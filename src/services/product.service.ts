import api from './api';
import { AxiosError } from 'axios';
import { 
  Product, 
  Category, 
  ProductApiResponse, 
  CategoryApiResponse,
  ProductFilterParams,
  mapProduct,
  mapCategory
} from '@/types';

export type { Product, Category, ProductApiResponse, CategoryApiResponse, ProductFilterParams };
export { mapProduct, mapCategory };

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
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
      products: data.content.map(mapProduct),
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
export async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await api.get<ProductApiResponse[]>('/products/all');
    return response.data.map(mapProduct);
  } catch (error) {
    console.error('Failed to fetch all products:', error);
    return [];
  }
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await api.get<ProductApiResponse>(`/products/${slug}`);
    return mapProduct(response.data);
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
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const response = await api.get<PaginatedResponse<ProductApiResponse>>(
      `/products?featured=true&size=${limit}`
    );
    return response.data.content.map(mapProduct);
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

/**
 * Get new arrivals (sorted by newest)
 */
export async function getNewArrivals(limit: number = 8): Promise<Product[]> {
  try {
    const response = await api.get<PaginatedResponse<ProductApiResponse>>(
      `/products?sort=newest&size=${limit}`
    );
    return response.data.content.map(mapProduct);
  } catch (error) {
    console.error('Failed to fetch new arrivals:', error);
    return [];
  }
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get<CategoryApiResponse[]>('/categories');
    return response.data.map(mapCategory);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
