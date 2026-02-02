/**
 * Delivery-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface DeliveryApiResponse {
  id: string;
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  status: DeliveryStatus;
  estimatedArrival?: string;
  actualArrival?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Frontend Domain Models ---

export type DeliveryStatus = 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';

export interface Delivery {
  id: string;
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  status: DeliveryStatus;
  estimatedArrival?: string;
  actualArrival?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Transformation Logic ---

export function mapDelivery(raw: DeliveryApiResponse): Delivery {
  return {
    ...raw,
  };
}

// --- UI Logic Types & Constants ---

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  PENDING: 'Pending',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
};
