import api from './api';
import { Promotion, PromotionApiResponse, mapPromotion } from '@/types';

/**
 * Get promotions (Admin)
 */
export async function getPromotions(): Promise<Promotion[]> {
  const response = await api.get<PromotionApiResponse[]>('/admin/promotions');
  return response.data.map(mapPromotion);
}

/**
 * Validate a promo code
 */
export async function validatePromotion(code: string): Promise<Promotion | null> {
  try {
    const response = await api.get<PromotionApiResponse>(`/promotions/validate?code=${encodeURIComponent(code)}`);
    return mapPromotion(response.data);
  } catch (error) {
    console.error('Promotion validation failed:', error);
    return null;
  }
}
