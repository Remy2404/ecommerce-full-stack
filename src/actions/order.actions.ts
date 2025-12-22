'use server';

import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/lib/db/schema';
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

export async function createOrder() {
  // To be implemented when checkout is done
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
        orderItems: true
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
