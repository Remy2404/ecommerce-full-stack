import api from './api/client';
import { SavedPaymentMethod, SavedPaymentMethodApiResponse } from '@/types/user';

export async function getPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const response = await api.get<SavedPaymentMethodApiResponse[]>('/payment-methods');
  return response.data;
}

export async function createPaymentMethod(data: {
  method: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  providerToken: string;
  isDefault?: boolean;
}): Promise<SavedPaymentMethod> {
  const response = await api.post<SavedPaymentMethodApiResponse>('/payment-methods', data);
  return response.data;
}

export async function updatePaymentMethod(id: string, data: Partial<Omit<SavedPaymentMethod, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SavedPaymentMethod> {
  const response = await api.put<SavedPaymentMethodApiResponse>(`/payment-methods/${id}`, data);
  return response.data;
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await api.delete(`/payment-methods/${id}`);
}

export async function setDefaultPaymentMethod(id: string): Promise<SavedPaymentMethod> {
  const response = await api.put<SavedPaymentMethodApiResponse>(`/payment-methods/${id}/default`);
  return response.data;
}
