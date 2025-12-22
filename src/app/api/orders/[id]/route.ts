import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth.config';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Get single order
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, id),
        eq(orders.userId, session.user.id)
      ),
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
            phoneNumber: true,
          },
        },
        payment: true,
        delivery: {
          with: {
            driver: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get delivery address
    const address = await db.query.addresses.findFirst({
      where: eq(orders.deliveryAddressId, order.deliveryAddressId),
    });

    return NextResponse.json({
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
      deliveryAddress: address,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// Cancel order
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, id),
        eq(orders.userId, session.user.id)
      ),
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: 'Order cannot be cancelled' },
        { status: 400 }
      );
    }

    await db.update(orders)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: 'Cancelled by customer',
      })
      .where(eq(orders.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
