import api from './api';
import { getErrorMessage } from '@/lib/http-error';
import { mapPromotion, type Promotion, type PromotionApiResponse } from '@/types';

export interface PromotionApplyPayload {
  code: string;
  orderId: string;
}

export interface PromotionUpsertPayload {
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  applicableCategories?: string;
  applicableMerchants?: string;
}

export async function validatePromotion(code: string): Promise<Promotion | null> {
  try {
    const response = await api.get<PromotionApiResponse>(
      `/promotions/validate?code=${encodeURIComponent(code)}`
    );
    return mapPromotion(response.data);
  } catch {
    return null;
  }
}

export async function applyPromotion(payload: PromotionApplyPayload): Promise<{
  success: boolean;
  promotion?: Promotion;
  error?: string;
}> {
  try {
    const response = await api.post<PromotionApiResponse>('/promotions/apply', payload);
    return { success: true, promotion: mapPromotion(response.data) };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Failed to apply promotion') };
  }
}

export async function getPromotions(): Promise<Promotion[]> {
  const response = await api.get<PromotionApiResponse[]>('/admin/promotions');
  return response.data.map(mapPromotion);
}

export async function getPromotionById(id: string): Promise<Promotion> {
  const response = await api.get<PromotionApiResponse>(`/admin/promotions/${id}`);
  return mapPromotion(response.data);
}

export async function createPromotion(payload: PromotionUpsertPayload): Promise<Promotion> {
  const response = await api.post<PromotionApiResponse>('/admin/promotions', payload);
  return mapPromotion(response.data);
}

export async function updatePromotion(id: string, payload: Partial<PromotionUpsertPayload>): Promise<Promotion> {
  const response = await api.put<PromotionApiResponse>(`/admin/promotions/${id}`, payload);
  return mapPromotion(response.data);
}

export async function deletePromotion(id: string): Promise<void> {
  await api.delete(`/admin/promotions/${id}`);
}
