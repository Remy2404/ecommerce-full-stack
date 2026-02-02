/**
 * User Wishlist type definitions
 */

import { Product, ProductApiResponse, mapProduct } from './product';

// --- Backend API Responses (DTOs) ---

export interface WishlistApiResponse {
  id: string;
  userId: string;
  items: ProductApiResponse[];
  createdAt: string;
  updatedAt: string;
}

// --- Frontend Domain Models ---

export interface Wishlist {
  id: string;
  userId: string;
  items: Product[];
  createdAt: string;
  updatedAt: string;
}

// --- Transformation Logic ---

export function mapWishlist(raw: WishlistApiResponse): Wishlist {
  return {
    id: raw.id,
    userId: raw.userId,
    items: (raw.items || []).map(mapProduct),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
