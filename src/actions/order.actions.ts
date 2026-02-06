'use server';

import * as orderService from '@/services/order.service';
import { getCurrentUser } from '@/services/auth.service';
import { CheckoutInput, Order } from '@/types';

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Get all orders for the current user
 * Calls Spring Boot backend /api/orders
 */
export async function getUserOrders(
  limit: number = 10
): Promise<ActionResult<Order[]>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const result = await orderService.getUserOrders(0, limit);

  return { success: true, data: result.orders };
}

/**
 * Get dashboard stats for the current user
 * Note: This now uses the order count from the API
 */
export async function getUserDashboardStats(): Promise<
  ActionResult<{ orderCount: number; points: number; memberSince: string }>
> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const result = await orderService.getUserOrders(0, 1);

  // Points are calculated based on order count (mock)
  const points = result.pagination.total * 10;

  return {
    success: true,
    data: {
      orderCount: result.pagination.total,
      points,
      memberSince: 'Member',
    },
  };
}

/**
 * Get profile page data in a single server action call
 */
export async function getProfileDashboardData(
  limit: number = 5
): Promise<
  ActionResult<{
    stats: { orderCount: number; points: number; memberSince: string };
    recentOrders: Order[];
  }>
> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const result = await orderService.getUserOrders(0, limit);
  const orderCount = result.pagination.total;

  return {
    success: true,
    data: {
      stats: {
        orderCount,
        points: orderCount * 10,
        memberSince: 'Member',
      },
      recentOrders: result.orders,
    },
  };
}

/**
 * Create a new order
 * Calls Spring Boot backend /api/orders
 */
export async function createOrder(
  data: CheckoutInput
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Map payment method to backend format
  const paymentMethodMap: Record<string, 'KHQR' | 'COD' | 'CARD'> = {
    cash: 'COD',
    card: 'CARD',
    KHQR: 'KHQR',
  };

  const result = await orderService.createOrder({
    items: data.items.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity
    })),
    shippingAddress: {
      fullName: data.shippingAddress.fullName || `${user.name}`,
      phone: data.shippingAddress.phone || '',
      street: data.shippingAddress.street,
      city: data.shippingAddress.city,
      state: data.shippingAddress.province || data.shippingAddress.city,
      zipCode: data.shippingAddress.postalCode,
      country: 'Cambodia',
    },
    paymentMethod: paymentMethodMap[data.paymentData.method] || 'COD',
  });

  if (!result.success) {
    return { success: false, error: result.error ?? 'Failed to create order' };
  }

  return {
    success: true,
    data: {
      orderId: result.order!.id,
      orderNumber: result.order!.orderNumber,
    },
  };
}

/**
 * Get order by ID or order number
 * Calls Spring Boot backend /api/orders/{orderNumber}
 */
export async function getOrderById(orderId: string): Promise<{ success: boolean; data?: Order; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const order = await orderService.getOrderByNumber(orderId);

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  return {
    success: true,
    data: order
  };
}

/**
 * Update order status (Admin/Merchant only)
 */
export async function updateOrderStatus(orderId: string, status: string, reason?: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'MERCHANT')) {
    return { success: false, error: 'Unauthorized: Admin or Merchant privileges required' };
  }

  const result = await orderService.updateOrderStatus(orderId, status, reason);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.order };
}

/**
 * Cancel an order
 */
export async function performCancelOrder(orderId: string, reason?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const result = await orderService.cancelOrder(orderId, reason);
  
  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, data: result.order };
}

/**
 * Get all orders (Admin only)
 */
export async function getAllOrders(limit: number = 20) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: Admin privileges required' };
  }

  const result = await orderService.getAllOrders(0, limit);

  return {
    success: true,
    data: result.orders,
    pagination: result.pagination
  };
}

