/**
 * Delivery-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface DeliveryApiResponse {
  id: string;
  orderId: string;
  driverId?: string;
  status: DeliveryStatus;
  driverNotes?: string;
  pickupTime?: string;
  deliveredTime?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Frontend Domain Models ---

// Keep in sync with backend enum: com.wing.ecommercebackendwing.model.enums.DeliveryStatus
export type DeliveryStatus = 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';

export interface Delivery {
  id: string;
  orderId: string;
  driverId?: string;
  status: DeliveryStatus;
  driverNotes?: string;
  pickupTime?: string;
  deliveredTime?: string;
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
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
};
