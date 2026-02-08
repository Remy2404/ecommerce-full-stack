import api from './api';
import { AxiosError } from 'axios';
import {
  type Category,
  type CategoryApiResponse,
  mapCategory,
  mapProduct,
  type PaginatedResponse,
  type Pagination,
  type Product,
  type ProductApiResponse,
  type ProductFilterParams,
} from '@/types';
import { getErrorMessage } from '@/lib/http-error';

export type {
  Product,
  Category,
  ProductApiResponse,
  CategoryApiResponse,
  ProductFilterParams,
  PaginatedResponse,
  Pagination,
};
export { mapProduct, mapCategory };

export interface ProductListResult {
  products: Product[];
  pagination: Pagination;
}

export interface UpsertProductPayload {
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId: string;
  stock: number;
  images: string[];
}

const EMPTY_PAGE: Pagination = {
  page: 0,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export async function getProducts(params: ProductFilterParams = {}): Promise<ProductListResult> {
  try {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.set('page', String(params.page));
    if (params.size !== undefined) queryParams.set('size', String(params.size));
    if (params.categoryId) queryParams.set('categoryId', params.categoryId);
    if (!params.categoryId && params.category) queryParams.set('categoryId', params.category);
    if (params.searchQuery) queryParams.set('searchQuery', params.searchQuery);
    if (!params.searchQuery && params.search) queryParams.set('searchQuery', params.search);
    if (params.minPrice !== undefined) queryParams.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) queryParams.set('maxPrice', String(params.maxPrice));

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
  } catch {
    return { products: [], pagination: EMPTY_PAGE };
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const response = await api.get<ProductApiResponse[]>('/products/all');
    return response.data.map(mapProduct);
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await api.get<ProductApiResponse>(`/products/${encodeURIComponent(slug)}`);
    return mapProduct(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) return null;
    return null;
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const result = await getProducts({ page: 0, size: limit });
  return result.products.slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const result = await getProducts({ page: 0, size: limit });
  return result.products.slice(0, limit);
}

export async function createProduct(payload: UpsertProductPayload): Promise<Product> {
  const response = await api.post<ProductApiResponse>('/products', {
    ...payload,
    price: Number(payload.price),
    stock: Number(payload.stock),
  });
  return mapProduct(response.data);
}

export async function updateProduct(slug: string, payload: UpsertProductPayload): Promise<Product> {
  const response = await api.put<ProductApiResponse>(`/products/${encodeURIComponent(slug)}`, {
    name: payload.name,
    description: payload.description,
    price: Number(payload.price),
    categoryId: payload.categoryId,
    stock: Number(payload.stock),
    images: payload.images,
  });
  return mapProduct(response.data);
}

export async function deleteProduct(slug: string): Promise<void> {
  await api.delete(`/products/${encodeURIComponent(slug)}`);
}

export async function safeDeleteProduct(slug: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteProduct(slug);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to delete product'),
    };
  }
}
