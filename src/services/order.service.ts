import api from './api';
import { AxiosError } from 'axios';
import { 
  Order, 
  OrderApiResponse, 
  CreateOrderRequest, 
  OrderResult, 
  OrderListResult,
  PaginatedResponse,
  Pagination,
  mapOrder
} from '@/types';

export type { 
  Order, 
  OrderApiResponse, 
  CreateOrderRequest, 
  OrderResult, 
  OrderListResult,
  PaginatedResponse,
  Pagination
};
export { mapOrder };

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderRequest): Promise<OrderResult> {
  try {
    const response = await api.post<OrderApiResponse>('/orders', data);
    return { success: true, order: mapOrder(response.data) };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || 'Failed to create order';
    return { success: false, error: message };
  }
}

/**
 * Get current user's orders with pagination
 */
export async function getUserOrders(
  page: number = 0,
  size: number = 20
): Promise<OrderListResult> {
  try {
    const response = await api.get<PaginatedResponse<OrderApiResponse>>(
      `/orders?page=${page}&size=${size}`
    );

    const data = response.data;
    
    return {
      orders: data.content.map(mapOrder),
      pagination: {
        page: data.number,
        limit: data.size,
        total: data.totalElements,
        totalPages: data.totalPages,
      },
    };
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return {
      orders: [],
      pagination: { page: 0, limit: 20, total: 0, totalPages: 0 },
    };
  }
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const response = await api.get<OrderApiResponse>(`/orders/${orderNumber}`);
    return mapOrder(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    console.error('Failed to fetch order:', error);
    return null;
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string, reason: string = 'User cancelled'): Promise<OrderResult> {
  return updateOrderStatus(orderId, 'CANCELLED', reason);
}

/**
 * Update order status (Admin/Merchant)
 */
export async function updateOrderStatus(
  orderId: string, 
  status: string, 
  reason?: string
): Promise<OrderResult> {
  try {
    const response = await api.put<OrderApiResponse>(`/orders/${orderId}/status`, null, {
      params: { status, ...(reason ? { reason } : {}) }
    });
    return { success: true, order: mapOrder(response.data) };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || 'Failed to update order status';
    return { success: false, error: message };
  }
}

/**
 * Get all orders (Admin)
 */
export async function getAllOrders(
  page: number = 0,
  size: number = 20
): Promise<OrderListResult> {
  try {
    const response = await api.get<PaginatedResponse<OrderApiResponse>>(
      `/orders/all?page=${page}&size=${size}`
    );

    const data = response.data;
    
    return {
      orders: data.content.map(mapOrder),
      pagination: {
        page: data.number,
        limit: data.size,
        total: data.totalElements,
        totalPages: data.totalPages,
      },
    };
  } catch (error) {
    console.error('Failed to fetch all orders:', error);
    return {
      orders: [],
      pagination: { page: 0, limit: 20, total: 0, totalPages: 0 },
    };
  }
}

