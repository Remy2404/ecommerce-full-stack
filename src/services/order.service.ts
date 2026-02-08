import api from './api';
import { AxiosError } from 'axios';
import {
  type CreateOrderRequest,
  mapOrder,
  type Order,
  type OrderApiResponse,
  type OrderListResult,
  type OrderResult,
  type PaginatedResponse,
  type Pagination,
} from '@/types';

export type {
  Order,
  OrderApiResponse,
  CreateOrderRequest,
  OrderResult,
  OrderListResult,
  PaginatedResponse,
  Pagination,
};
export { mapOrder };

const EMPTY_ORDERS: OrderListResult = {
  orders: [],
  pagination: { page: 0, limit: 20, total: 0, totalPages: 0 },
};

export async function createOrder(data: CreateOrderRequest): Promise<OrderResult> {
  try {
    const response = await api.post<OrderApiResponse>('/orders', data);
    return { success: true, order: mapOrder(response.data) };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const message = axiosError.response?.data?.error || axiosError.response?.data?.message;
    return { success: false, error: message || 'Failed to create order' };
  }
}

async function fetchOrders(path: string, page = 0, size = 20): Promise<OrderListResult> {
  try {
    const response = await api.get<PaginatedResponse<OrderApiResponse>>(
      `${path}?page=${page}&size=${size}`
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
  } catch {
    return EMPTY_ORDERS;
  }
}

export async function getUserOrders(page = 0, size = 20): Promise<OrderListResult> {
  return fetchOrders('/orders', page, size);
}

export async function getAllOrders(page = 0, size = 20): Promise<OrderListResult> {
  return fetchOrders('/orders/all', page, size);
}

export async function getMerchantOrders(page = 0, size = 20): Promise<OrderListResult> {
  return fetchOrders('/orders/merchant', page, size);
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const response = await api.get<OrderApiResponse>(`/orders/${orderNumber}`);
    return mapOrder(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) return null;
    return null;
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<OrderResult> {
  try {
    const response = await api.put<OrderApiResponse>(`/orders/${orderId}/status`, null, {
      params: { status },
    });
    return { success: true, order: mapOrder(response.data) };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return {
      success: false,
      error: axiosError.response?.data?.message || 'Failed to update order status',
    };
  }
}

export async function cancelOrder(orderId: string): Promise<OrderResult> {
  return updateOrderStatus(orderId, 'CANCELLED');
}
