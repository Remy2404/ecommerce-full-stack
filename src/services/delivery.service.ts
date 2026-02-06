import api from './api';
import { Delivery, DeliveryApiResponse, mapDelivery } from '@/types';

/**
 * Get delivery status for an order
 */
export async function getDeliveryStatus(orderId: string): Promise<Delivery | null> {
  try {
    const response = await api.get<DeliveryApiResponse>(`/delivery/order/${orderId}`);
    return mapDelivery(response.data);
  } catch (error) {
    console.error('Failed to fetch delivery status:', error);
    return null;
  }
}

/**
 * Update delivery status (Admin/Delivery personnel)
 */
export async function updateDeliveryStatus(deliveryId: string, status: string, notes?: string): Promise<void> {
  await api.put(
    `/delivery/${deliveryId}/status`,
    null,
    { params: { status, notes: notes?.trim() ? notes.trim() : undefined } }
  );
}
