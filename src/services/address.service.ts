import api from './api/client';
import { Address, AddressApiResponse, mapAddress } from '@/types/address';

export async function getAddresses(): Promise<Address[]> {
  const response = await api.get<AddressApiResponse[]>('/addresses');
  return response.data.map(mapAddress);
}

export async function createAddress(data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Address> {
  const response = await api.post<AddressApiResponse>('/addresses', data);
  return mapAddress(response.data);
}

export async function updateAddress(id: string, data: Partial<Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Address> {
  const response = await api.put<AddressApiResponse>(`/addresses/${id}`, data);
  return mapAddress(response.data);
}

export async function deleteAddress(id: string): Promise<void> {
  await api.delete(`/addresses/${id}`);
}

export async function setDefaultAddress(id: string): Promise<Address> {
  const response = await api.put<AddressApiResponse>(`/addresses/${id}/default`);
  return mapAddress(response.data);
}
