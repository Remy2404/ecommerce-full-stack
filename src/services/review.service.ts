import api from './api';
import { Review, ReviewApiResponse, mapReview, PaginatedResponse } from '@/types';

/**
 * Get reviews for a specific product
 */
export async function getProductReviews(productId: string, page: number = 0, size: number = 10) {
  const response = await api.get<PaginatedResponse<ReviewApiResponse>>(
    `/reviews/product/${productId}?page=${page}&size=${size}`
  );
  
  return {
    reviews: response.data.content.map(mapReview),
    pagination: {
      page: response.data.number,
      limit: response.data.size,
      total: response.data.totalElements,
      totalPages: response.data.totalPages,
    }
  };
}

/**
 * Create a new product review
 */
export async function createReview(data: any): Promise<Review> {
  const response = await api.post<ReviewApiResponse>('/reviews', data);
  return mapReview(response.data);
}
