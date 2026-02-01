import api from './api';
import { AxiosError } from 'axios';

// ============================================================================
// Types
// ============================================================================

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  variantId: string | null;
  variantName: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: string | null;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  shippingAddressId?: string;
  shippingAddress?: ShippingAddress;
  paymentMethod: 'COD' | 'CARD' | 'KHQR' | 'WING';
  notes?: string;
  promoCode?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface OrderResult {
  success: boolean;
  order?: OrderResponse;
  error?: string;
}

export interface OrderListResult {
  orders: OrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Order Service
// ============================================================================

/**
 * Create a new order
 */
export async function createOrder(data: CreateOrderRequest): Promise<OrderResult> {
  try {
    const response = await api.post<OrderResponse>('/orders', data);
    return { success: true, order: response.data };
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
    const response = await api.get<PaginatedResponse<OrderResponse>>(
      `/orders?page=${page}&size=${size}`
    );

    const data = response.data;
    
    return {
      orders: data.content,
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
export async function getOrderByNumber(orderNumber: string): Promise<OrderResponse | null> {
  try {
    const response = await api.get<OrderResponse>(`/orders/${orderNumber}`);
    return response.data;
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
export async function cancelOrder(orderNumber: string): Promise<OrderResult> {
  try {
    const response = await api.post<OrderResponse>(`/orders/${orderNumber}/cancel`);
    return { success: true, order: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || 'Failed to cancel order';
    return { success: false, error: message };
  }
}
