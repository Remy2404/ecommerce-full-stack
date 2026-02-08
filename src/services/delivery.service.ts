import api from './api';
import { mapDelivery, type Delivery, type DeliveryApiResponse } from '@/types';

export async function getDeliveryStatus(orderId: string): Promise<Delivery | null> {
  try {
    const response = await api.get<DeliveryApiResponse>(`/delivery/order/${orderId}`);
    return mapDelivery(response.data);
  } catch {
    return null;
  }
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: string,
  notes?: string
): Promise<void> {
  await api.put(`/delivery/${deliveryId}/status`, null, {
    params: { status, ...(notes?.trim() ? { notes: notes.trim() } : {}) },
  });
}

export async function assignDeliveryDriver(deliveryId: string, driverId: string): Promise<void> {
  await api.post(`/delivery/${deliveryId}/assign/${driverId}`);
}
