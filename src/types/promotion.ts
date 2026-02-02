/**
 * Promotion and Discount type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface PromotionApiResponse {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
  usageLimit?: number;
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
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
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
    ...raw,
    minOrderAmount: raw.minOrderAmount || 0,
  };
}

export function mapPromotionUsage(raw: PromotionUsageApiResponse): PromotionUsage {
  return {
    ...raw,
  };
}
