import api from './api';
import type { Review, ReviewApiResponse } from '@/types';
import { mapReview } from '@/types';
import { getErrorMessage } from '@/lib/http-error';

export interface CreateReviewPayload {
  productId: string;
  orderId?: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export async function getProductReviews(productId: string): Promise<Review[]> {
  const response = await api.get<ReviewApiResponse[]>(`/reviews/products/${productId}`);
  return response.data.map(mapReview);
}

export async function createReview(payload: CreateReviewPayload): Promise<{ success: boolean; review?: Review; error?: string }> {
  try {
    const response = await api.post<ReviewApiResponse>('/reviews', payload);
    return { success: true, review: mapReview(response.data) };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to submit review'),
    };
  }
}
