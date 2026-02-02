/**
 * Product Review type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface ReviewApiResponse {
  id: string;
  productId: string;
  userId: string;
  userName?: string; // Backend might provide user name for reviews
  rating: number;
  title?: string;
  comment?: string;
  images?: string; // Comma-separated URLs
  isVerified: boolean;
  createdAt: string;
}

// --- Frontend Domain Models ---

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName?: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
}

// --- Transformation Logic ---

export function mapReview(raw: ReviewApiResponse): Review {
  return {
    ...raw,
    images: raw.images ? raw.images.split(',').map(u => u.trim()).filter(Boolean) : [],
  };
}
