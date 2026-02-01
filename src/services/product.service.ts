import api from './api';
import { AxiosError } from 'axios';

// ============================================================================
// Types
// ============================================================================

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string[]; // Transformed from backend's comma-separated string
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  categoryName?: string;
  merchantId: string;
  createdAt: string;
  updatedAt: string;
}

// Raw response from backend (images as string)
interface ProductApiResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  images: string | null; // Backend returns comma-separated string
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  categoryName?: string;
  merchantId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform backend product response: convert images string to array
 */
function transformProduct(product: ProductApiResponse): ProductResponse {
  return {
    ...product,
    images: product.images 
      ? product.images.split(',').map(url => url.trim()).filter(Boolean)
      : [],
  };
}

export interface ProductFilterParams {
  page?: number;
  size?: number;
  category?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ProductListResult {
  products: ProductResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// Product Service
// ============================================================================

/**
 * Get products with filtering and pagination
 */
export async function getProducts(params: ProductFilterParams = {}): Promise<ProductListResult> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.set('page', String(params.page));
    if (params.size !== undefined) queryParams.set('size', String(params.size));
    if (params.category) queryParams.set('category', params.category);
    if (params.featured !== undefined) queryParams.set('featured', String(params.featured));
    if (params.minPrice !== undefined) queryParams.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) queryParams.set('maxPrice', String(params.maxPrice));
    if (params.search) queryParams.set('search', params.search);
    if (params.sort) queryParams.set('sort', params.sort);

    const response = await api.get<PaginatedResponse<ProductApiResponse>>(
      `/products?${queryParams.toString()}`
    );

    const data = response.data;
    
    return {
      products: data.content.map(transformProduct),
      pagination: {
        page: data.number,
        limit: data.size,
        total: data.totalElements,
        totalPages: data.totalPages,
      },
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      products: [],
      pagination: { page: 0, limit: 12, total: 0, totalPages: 0 },
    };
  }
}

/**
 * Get all products without pagination
 */
export async function getAllProducts(): Promise<ProductResponse[]> {
  try {
    const response = await api.get<ProductApiResponse[]>('/products/all');
    return response.data.map(transformProduct);
  } catch (error) {
    console.error('Failed to fetch all products:', error);
    return [];
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<ProductResponse | null> {
  try {
    const response = await api.get<ProductApiResponse>(`/products/${slug}`);
    return transformProduct(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      return null;
    }
    console.error('Failed to fetch product:', error);
    return null;
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 8): Promise<ProductResponse[]> {
  try {
    const response = await api.get<PaginatedResponse<ProductApiResponse>>(
      `/products?featured=true&size=${limit}`
    );
    return response.data.content.map(transformProduct);
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

/**
 * Get new arrivals (sorted by newest)
 */
export async function getNewArrivals(limit: number = 8): Promise<ProductResponse[]> {
  try {
    const response = await api.get<PaginatedResponse<ProductApiResponse>>(
      `/products?sort=newest&size=${limit}`
    );
    return response.data.content.map(transformProduct);
  } catch (error) {
    console.error('Failed to fetch new arrivals:', error);
    return [];
  }
}
