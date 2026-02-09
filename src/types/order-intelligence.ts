/**
 * Order Intelligence type definitions
 */

import type { OrderStatus } from './order';
import type { PaymentStatus } from './payment';

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  actor?: string;
  note?: string;
}

export interface AdminNote {
  id: string;
  orderId: string;
  content: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export interface StatusTransition {
  from: OrderStatus;
  to: OrderStatus;
  isAllowed: boolean;
  reason?: string;
}

/**
 * Valid order status transitions
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DELIVERING', 'CANCELLED'],
  DELIVERING: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  PAID: ['CONFIRMED'],
};

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  from: OrderStatus,
  to: OrderStatus
): StatusTransition {
  const allowedTransitions = ORDER_STATUS_TRANSITIONS[from] ?? [];
  const isAllowed = allowedTransitions.includes(to);

  return {
    from,
    to,
    isAllowed,
    reason: isAllowed
      ? undefined
      : `Cannot transition from ${from} to ${to}. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
  };
}

export interface StatusTransitionConfig {
  currentStatus: OrderStatus;
  paymentStatus?: PaymentStatus;
  onTransition: (newStatus: OrderStatus) => Promise<void>;
}
