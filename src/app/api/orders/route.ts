import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, carts, cartItems, products, addresses } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth.config';

// Get user's orders
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, session.user.id),
      orderBy: [desc(orders.createdAt)],
      with: {
        orderItems: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        merchant: {
          columns: {
            id: true,
            storeName: true,
          },
        },
      },
    });

    return NextResponse.json({
      orders: userOrders.map((order) => ({
        ...order,
        subtotal: parseFloat(order.subtotal),
        deliveryFee: parseFloat(order.deliveryFee),
        discount: order.discount ? parseFloat(order.discount) : 0,
        tax: order.tax ? parseFloat(order.tax) : 0,
        total: parseFloat(order.total),
        items: order.orderItems.map((item) => ({
          ...item,
          unitPrice: parseFloat(item.unitPrice),
          subtotal: parseFloat(item.subtotal),
          image: item.productImage || (item.product?.images as string[])?.[0],
        })),
      })),
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { shippingAddressId, paymentMethod, paymentDetails } = body;

    if (!shippingAddressId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Shipping address and payment method are required' },
        { status: 400 }
      );
    }

    // Get user's cart with items
    const cart = await db.query.carts.findFirst({
      where: eq(carts.userId, session.user.id),
      with: {
        items: {
          with: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Verify address belongs to user
    const address = await db.query.addresses.findFirst({
      where: and(
        eq(addresses.id, shippingAddressId),
        eq(addresses.userId, session.user.id)
      ),
    });

    if (!address) {
      return NextResponse.json(
        { error: 'Invalid shipping address' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = cart.items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
    const deliveryFee = subtotal >= 100 ? 0 : 10;
    const tax = 0; // Can add tax calculation
    const discount = 0; // Can add promo code discount
    const total = subtotal + deliveryFee + tax - discount;

    // Get first merchant ID (in real app, might need to handle multi-merchant orders)
    const merchantId = cart.items[0].product?.merchantId;
    if (!merchantId) {
      return NextResponse.json(
        { error: 'Invalid product merchant' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    // Create order
    const [order] = await db.insert(orders).values({
      orderNumber,
      userId: session.user.id,
      merchantId,
      status: 'pending',
      subtotal: subtotal.toString(),
      deliveryFee: deliveryFee.toString(),
      discount: discount.toString(),
      tax: tax.toString(),
      total: total.toString(),
      deliveryAddressId: shippingAddressId,
    }).returning();

    // Create order items
    const orderItemsData = cart.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product?.name || 'Unknown Product',
      productImage: (item.product?.images as string[])?.[0],
      variantName: item.variant?.name,
      quantity: item.quantity,
      unitPrice: item.price,
      subtotal: (parseFloat(item.price) * item.quantity).toString(),
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Update product stock
    for (const item of cart.items) {
      if (item.variantId) {
        await db.execute(sql`
          UPDATE product_variants 
          SET stock = stock - ${item.quantity} 
          WHERE id = ${item.variantId}
        `);
      } else {
        await db.execute(sql`
          UPDATE products 
          SET stock = stock - ${item.quantity},
              sold_count = sold_count + ${item.quantity}
          WHERE id = ${item.productId}
        `);
      }
    }

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
