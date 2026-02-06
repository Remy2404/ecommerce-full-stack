/**
 * Product-related type definitions
 * Includes backend DTOs, frontend models, enums, and mapping logic
 */

// --- Backend API Responses (DTOs) ---

export interface ProductApiResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string | null;
  rating: number;
  reviewCount: number;
  isActive?: boolean;
  isFeatured?: boolean;
  categoryId?: string;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- Frontend Domain Models ---

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId?: string;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  isActive: boolean;
}

// --- Transformation Logic ---

export function mapProduct(raw: ProductApiResponse): Product {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description || undefined,
    price: Number(raw.price),
    comparePrice: raw.comparePrice ? Number(raw.comparePrice) : undefined,
    stock: raw.stock || 0,
    images: typeof raw.images === 'string' 
      ? raw.images.split(',').map((img: string) => img.trim()).filter(Boolean)
      : Array.isArray(raw.images) ? raw.images : [],
    rating: raw.rating || 0,
    reviewCount: raw.reviewCount || 0,
    isActive: raw.isActive ?? true,
    isFeatured: raw.isFeatured ?? false,
    categoryId: raw.categoryId,
    categoryName: raw.categoryName,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

// --- UI Logic Types & Constants ---

export type ProductSortOption = 'newest' | 'price-low' | 'price-high' | 'rating' | 'popular';

export interface ProductFilterParams {
  category?: string;
  featured?: boolean;
  sale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  size?: number;
}

export const PRODUCT_SORT_LABELS: Record<ProductSortOption, string> = {
  'newest': 'Newest Arrivals',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
  'rating': 'Top Rated',
  'popular': 'Most Popular'
};
