/**
 * Order-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface OrderItemApiResponse {
  id: string;
  orderId?: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productSlug?: string;
  variantId: string | null;
  variantName: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderApiResponse {
  id: string;
  orderNumber: string;
  userId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  shippingAddress?: OrderShippingAddress;
  items: OrderItemApiResponse[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderShippingAddress {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  zipCode: string;
  country: string;
}

// --- Frontend Domain Models ---

import { PaymentStatus } from './payment';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED' | 'PAID';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productSlug?: string;
  variantId: string | null;
  variantName: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: 'COD' | 'CARD' | 'KHQR' | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  shippingAddress?: OrderShippingAddress;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- Service Inputs (for API) ---

export interface OrderItemRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateOrderRequest {
  shippingAddressId?: string;
  shippingAddress?: OrderShippingAddress;
  items?: OrderItemRequest[];
  merchantId?: string;
  paymentMethod: 'COD' | 'CARD' | 'KHQR';
  notes?: string;
  couponCode?: string;
}

/**
 * Data passed from the Checkout form to the createOrder action
 */
export interface CheckoutInput {
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
    method: 'cash' | 'card' | 'KHQR';
  };
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;
}

// --- UI Logic Types & Results ---

export interface OrderResult {
  success: boolean;
  order?: Order;
  error?: string;
  errorCode?: string;
  statusCode?: number;
  retryAfterSeconds?: number;
}

export interface OrderListResult {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// --- Transformation Logic ---

export function mapOrderItem(raw: OrderItemApiResponse): OrderItem {
  return {
    id: raw.id,
    orderId: raw.orderId || '',
    productId: raw.productId,
    productName: raw.productName,
    productImage: raw.productImage,
    productSlug: raw.productSlug,
    variantId: raw.variantId,
    variantName: raw.variantName,
    price: Number(raw.price),
    quantity: raw.quantity,
    subtotal: Number(raw.subtotal),
  };
}

export function mapOrder(raw: OrderApiResponse): Order {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    userId: raw.userId || '',
    status: raw.status,
    paymentStatus: raw.paymentStatus,
    items: (raw.items || []).map(mapOrderItem),
    subtotal: Number(raw.subtotal),
    deliveryFee: Number(raw.deliveryFee || 0),
    discount: Number(raw.discount || 0),
    tax: Number(raw.tax || 0),
    total: Number(raw.total),
    shippingAddress: raw.shippingAddress ? {
      ...raw.shippingAddress,
      zipCode: raw.shippingAddress.zipCode
    } : undefined,
    notes: raw.notes,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt || raw.createdAt,
  };
}

// --- UI Logic Types & Constants ---

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  DELIVERING: 'Delivering',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  PAID: 'Paid'
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-indigo-100 text-indigo-800',
  READY: 'bg-cyan-100 text-cyan-800',
  DELIVERING: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PAID: 'bg-emerald-100 text-emerald-800'
};
