'use server';

import { db } from '@/lib/db';
import { orders, orderItems, products, addresses, payments, merchants, users } from '@/lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { auth } from '@/lib/auth/auth';

/**
 * Get all orders for the current user
 */
export async function getUserOrders(limit: number = 10) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, session.user.id),
      orderBy: [desc(orders.createdAt)],
      limit: limit,
    });

    return { success: true, data: userOrders };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return { success: false, error: 'Failed to fetch orders' };
  }
}

/**
 * Get dashboard stats for the current user
 */
export async function getUserDashboardStats() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const [orderCountResult] = await db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.userId, session.user.id));

    // Points are currently mock, but we could add a column later.
    // For now, let's keep it 0 or a mock value based on order count.
    const points = (orderCountResult?.value || 0) * 10;

    return {
      success: true,
      data: {
        orderCount: orderCountResult?.value || 0,
        points: points,
        memberSince: session.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        }) : 'Recent Member'
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, error: 'Failed to fetch stats' };
  }
}

export async function createOrder(data: {
  items: any[];
  shippingAddress: any;
  paymentData: any;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify user exists in database to avoid foreign key violations
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!user) {
      console.error(`User ${session.user.id} not found in database. Session might be stale.`);
      return { 
        success: false, 
        error: 'Your session has expired or your user record was lost. Please log out and log back in to continue.' 
      };
    }

    // 1. Get a merchant (default to first one)
    const merchant = await db.query.merchants.findFirst();
    if (!merchant) {
      return { success: false, error: 'No merchant found in database' };
    }

    // 2. Handle Address
    let addressId = data.shippingAddress.id;
    if (!addressId) {
      const [newAddress] = await db.insert(addresses).values({
        userId: session.user.id,
        label: data.shippingAddress.label,
        street: data.shippingAddress.street,
        city: data.shippingAddress.city,
        province: data.shippingAddress.province,
        postalCode: data.shippingAddress.postalCode,
      }).returning({ id: addresses.id });
      addressId = newAddress.id;
    }

    // 3. Create Order
    const orderNum = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const [order] = await db.insert(orders).values({
      orderNumber: orderNum,
      userId: session.user.id,
      merchantId: merchant.id,
      status: 'pending',
      subtotal: data.subtotal.toString(),
      deliveryFee: data.deliveryFee.toString(),
      discount: data.discount.toString(),
      tax: data.tax.toString(),
      total: data.total.toString(),
      deliveryAddressId: addressId,
      deliveryInstructions: (data.shippingAddress as any).instructions || null,
    }).returning({ id: orders.id, orderNumber: orders.orderNumber });

    // 4. Create Order Items
    const itemsToInsert = data.items.map(item => ({
      orderId: order.id,
      productId: item.productId,
      variantId: item.variantId || null,
      productName: item.name,
      productImage: item.image,
      variantName: item.variantName || null,
      quantity: item.quantity,
      unitPrice: item.price.toString(),
      subtotal: (item.price * item.quantity).toString(),
    }));

    await db.insert(orderItems).values(itemsToInsert);

    // 5. Create Payment record
    await db.insert(payments).values({
      orderId: order.id,
      method: data.paymentData.method,
      status: data.paymentData.method === 'cash' ? 'pending' : 'paid',
      amount: data.total.toString(),
      transactionId: data.paymentData.method !== 'cash' ? `TXN-${Date.now()}` : null,
    });

    return { success: true, data: { orderId: order.id, orderNumber: order.orderNumber } };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        orderItems: true,
        deliveryAddress: true,
        payment: true,
        delivery: true,
        user: true,
      }
    });

    if (!order || order.userId !== session.user.id) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error('Error fetching order by id:', error);
    return { success: false, error: 'Failed to fetch order' };
  }
}
