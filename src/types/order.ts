/**
 * Order-related type definitions
 * These types mirror the Spring Boot backend models
 */

// Enums
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'KHQR' | 'WING' | 'CASH_ON_DELIVERY';
export type DeliveryStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  tax?: number;
  total: number;
  deliveryInstructions?: string;
  notes?: string;
  orderItems?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number; 
  subtotal: number;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface Delivery {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  deliveredTime?: string;
  notes?: string;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface PromotionUsage {
  id: string;
  promotionId: string;
  userId: string;
  orderId: string;
  discountAmount: number;
  usedAt: string;
}
