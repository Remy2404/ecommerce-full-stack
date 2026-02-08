/**
 * Product Review type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface ReviewApiResponse {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  images?: string; // Comma-separated URLs
  createdAt: string;
}

// --- Frontend Domain Models ---

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  images: string[];
  createdAt: string;
}

// --- Transformation Logic ---

export function mapReview(raw: ReviewApiResponse): Review {
  return {
    id: raw.id,
    productId: raw.productId,
    userId: raw.userId,
    rating: Number(raw.rating),
    comment: raw.comment,
    images: raw.images ? raw.images.split(',').map(u => u.trim()).filter(Boolean) : [],
    createdAt: raw.createdAt,
  };
}
