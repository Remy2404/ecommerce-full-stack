'use server';

import * as productService from '@/services/product.service';
import * as categoryService from '@/services/category.service';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ProductResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  comparePrice: string | null;
  stock: number;
  images: string[] | null;
  rating: string;
  reviewCount: number;
  isFeatured: boolean;
  categoryId: string;
  createdAt: Date;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  sale?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular';
}

async function resolveCategoryId(category?: string): Promise<string | undefined> {
  const normalized = category?.trim();
  if (!normalized) return undefined;
  if (UUID_PATTERN.test(normalized)) return normalized;

  const categories = await categoryService.getCategories();
  const match = categories.find(
    (candidate) =>
      candidate.slug.toLowerCase() === normalized.toLowerCase() ||
      candidate.id === normalized
  );

  return match?.id;
}

/**
 * Get products with filtering and pagination
 * Calls Spring Boot backend /api/products
 */
export async function getProducts(params: GetProductsParams = {}) {
  const {
    page = 1,
    limit = 12,
    category,
    featured,
    minPrice,
    maxPrice,
    search,
    sortBy = 'newest',
  } = params;

  const resolvedCategoryId = await resolveCategoryId(category);
  if (category && !resolvedCategoryId) {
    return {
      products: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const result = await productService.getProducts({
    page: page - 1, // Spring Boot uses 0-indexed pages
    size: limit,
    categoryId: resolvedCategoryId,
    featured,
    minPrice,
    maxPrice,
    search,
    sort: sortBy,
  });

  // Transform to match existing interface
  return {
    products: result.products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : null,
      stock: p.stock,
      images: p.images,
      rating: String(p.rating),
      reviewCount: p.reviewCount,
      isFeatured: p.isFeatured,
      categoryId: p.categoryId || '',
      createdAt: new Date(p.createdAt),
    })),
    pagination: {
      page: result.pagination.page + 1, // Convert back to 1-indexed for frontend
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
    },
  };
}

/**
 * Get product by slug
 * Calls Spring Boot backend /api/products/{slug}
 */
export async function getProductBySlug(slug: string) {
  const product = await productService.getProductBySlug(slug);

  if (!product) return null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description || '',
    price: String(product.price),
    comparePrice: product.comparePrice ? String(product.comparePrice) : null,
    stock: product.stock,
    images: product.images,
    rating: String(product.rating),
    reviewCount: product.reviewCount,
    isFeatured: product.isFeatured,
    categoryId: product.categoryId || '',
    createdAt: new Date(product.createdAt),
    // Note: category, merchant, variants, reviews need separate API calls
    // or the backend needs to include them in the response
  };
}

/**
 * Get featured products
 * Calls Spring Boot backend /api/products?featured=true
 */
export async function getFeaturedProducts(limit: number = 8) {
  const products = await productService.getFeaturedProducts(limit);

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: String(p.price),
    comparePrice: p.comparePrice ? String(p.comparePrice) : null,
    stock: p.stock,
    images: p.images,
    rating: String(p.rating),
    reviewCount: p.reviewCount,
    isFeatured: p.isFeatured,
    categoryId: p.categoryId || '',
    createdAt: new Date(p.createdAt),
  }));
}

/**
 * Get new arrivals (sorted by newest)
 * Calls Spring Boot backend /api/products?sort=newest
 */
export async function getNewArrivals(limit: number = 8) {
  const products = await productService.getNewArrivals(limit);

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: String(p.price),
    comparePrice: p.comparePrice ? String(p.comparePrice) : null,
    stock: p.stock,
    images: p.images,
    rating: String(p.rating),
    reviewCount: p.reviewCount,
    isFeatured: p.isFeatured,
    categoryId: p.categoryId || '',
    createdAt: new Date(p.createdAt),
  }));
}

/**
 * Get all categories
 * Calls Spring Boot backend /api/categories
 */
export async function getCategories() {
  const categories = await categoryService.getCategories();

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image: c.image,
    isActive: true,
    sortOrder: 0,
  }));
}
