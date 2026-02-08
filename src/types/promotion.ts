/**
 * Promotion and Discount type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface PromotionApiResponse {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  endDate: string;
  isActive: boolean;
}

export interface PromotionUsageApiResponse {
  id: string;
  promotionId: string;
  userId: string;
  orderId: string;
  discountApplied: number;
  usedAt: string;
}

// --- Frontend Domain Models ---

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  endDate: string;
  isActive: boolean;
}

export interface PromotionUsage {
  id: string;
  promotionId: string;
  userId: string;
  orderId: string;
  discountApplied: number;
  usedAt: string;
}

// --- Transformation Logic ---

export function mapPromotion(raw: PromotionApiResponse): Promotion {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    description: raw.description,
    type: raw.type,
    value: Number(raw.value),
    minOrderAmount: Number(raw.minOrderAmount || 0),
    maxDiscount: raw.maxDiscount ? Number(raw.maxDiscount) : undefined,
    endDate: raw.endDate,
    isActive: Boolean(raw.isActive),
  };
}

export function mapPromotionUsage(raw: PromotionUsageApiResponse): PromotionUsage {
  return {
    ...raw,
    discountApplied: Number(raw.discountApplied),
  };
}
