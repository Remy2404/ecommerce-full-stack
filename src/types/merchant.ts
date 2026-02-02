/**
 * Merchant-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface MerchantApiResponse {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Frontend Domain Models ---

export interface Merchant {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  rating: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Transformation Logic ---

export function mapMerchant(raw: MerchantApiResponse): Merchant {
  return {
    ...raw,
  };
}
