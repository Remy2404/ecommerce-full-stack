'use server';

import * as orderService from '@/services/order.service';
import { getCurrentUser } from '@/services/auth.service';

/**
 * Get all orders for the current user
 * Calls Spring Boot backend /api/orders
 */
export async function getUserOrders(limit: number = 10) {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const result = await orderService.getUserOrders(0, limit);

  return {
    success: true,
    data: result.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      subtotal: String(order.subtotal),
      deliveryFee: String(order.deliveryFee),
      discount: String(order.discount),
      tax: '0',
      total: String(order.total),
      createdAt: new Date(order.createdAt),
      updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(order.createdAt),
    })),
  };
}

/**
 * Get dashboard stats for the current user
 * Note: This now uses the order count from the API
 */
export async function getUserDashboardStats() {
  const user = getCurrentUser();
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
      points: points,
      memberSince: 'Member',
    },
  };
}

/**
 * Create a new order
 * Calls Spring Boot backend /api/orders
 */
export async function createOrder(data: {
  items: {
    productId: string;
    variantId?: string;
    name: string;
    image: string;
    variantName?: string;
    quantity: number;
    price: number;
  }[];
  shippingAddress: {
    id?: string;
    label?: string;
    street: string;
    city: string;
    province?: string;
    postalCode: string;
    fullName?: string;
    phone?: string;
  };
  paymentData: {
    method: 'cash' | 'card' | 'khqr' | 'wing';
  };
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
}) {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Map payment method to backend format
  const paymentMethodMap: Record<string, 'COD' | 'CARD' | 'KHQR' | 'WING'> = {
    cash: 'COD',
    card: 'CARD',
    khqr: 'KHQR',
    wing: 'WING',
  };

  const result = await orderService.createOrder({
    shippingAddress: {
      fullName: data.shippingAddress.fullName || '',
      phone: data.shippingAddress.phone || '',
      street: data.shippingAddress.street,
      city: data.shippingAddress.city,
      state: data.shippingAddress.province,
      postalCode: data.shippingAddress.postalCode,
      country: 'Cambodia',
    },
    paymentMethod: paymentMethodMap[data.paymentData.method] || 'COD',
  });

  if (!result.success) {
    return { success: false, error: result.error };
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
export async function getOrderById(orderId: string) {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const order = await orderService.getOrderByNumber(orderId);

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  return {
    success: true,
    data: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      paymentStatus: order.paymentStatus.toLowerCase(),
      subtotal: String(order.subtotal),
      deliveryFee: String(order.deliveryFee),
      discount: String(order.discount),
      tax: '0',
      total: String(order.total),
      notes: order.notes || null,
      createdAt: new Date(order.createdAt),
      updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(order.createdAt),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: String(item.price),
        subtotal: String(item.subtotal),
      })),
      deliveryAddress: {
        street: order.shippingAddress?.street || '',
        city: order.shippingAddress?.city || '',
        province: order.shippingAddress?.state || '',
        postalCode: order.shippingAddress?.postalCode || '',
      },
    },
  };
}
