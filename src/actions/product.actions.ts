'use server';

import { db } from '@/lib/db';
import { products, categories, merchants } from '@/lib/db/schema';
import { eq, desc, sql, and, ilike, gte, lte } from 'drizzle-orm';

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
  merchantId: string;
  createdAt: Date;
}

export interface GetProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating' | 'popular';
}

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

  const offset = (page - 1) * limit;

  try {
    // Build where conditions
    const conditions = [eq(products.isActive, true)];

    if (category) {
      const categoryRecord = await db.query.categories.findFirst({
        where: eq(categories.slug, category),
      });
      if (categoryRecord) {
        conditions.push(eq(products.categoryId, categoryRecord.id));
      }
    }

    if (featured !== undefined) {
      conditions.push(eq(products.isFeatured, featured));
    }

    if (minPrice !== undefined) {
      conditions.push(gte(products.price, minPrice.toString()));
    }

    if (maxPrice !== undefined) {
      conditions.push(lte(products.price, maxPrice.toString()));
    }

    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'price_asc':
        orderBy = products.price;
        break;
      case 'price_desc':
        orderBy = desc(products.price);
        break;
      case 'rating':
        orderBy = desc(products.rating);
        break;
      case 'popular':
        orderBy = desc(products.soldCount);
        break;
      default:
        orderBy = desc(products.createdAt);
    }

    const [productList, countResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...conditions)),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return {
      products: productList.map((p) => ({
        ...p,
        images: p.images as string[] | null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return {
      products: [],
      pagination: {
        page: 1,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await db.query.products.findFirst({
      where: and(eq(products.slug, slug), eq(products.isActive, true)),
      with: {
        category: true,
        merchant: true,
        variants: {
          where: (variants, { eq }) => eq(variants.isActive, true),
        },
        reviews: {
          limit: 10,
          orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
          with: {
            user: {
              columns: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!product) return null;

    // Increment view count
    await db
      .update(products)
      .set({ viewCount: sql`${products.viewCount} + 1` })
      .where(eq(products.id, product.id));

    return {
      ...product,
      images: product.images as string[] | null,
    };
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

export async function getFeaturedProducts(limit: number = 8) {
  try {
    const featuredList = await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return featuredList.map((p) => ({
      ...p,
      images: p.images as string[] | null,
    }));
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

export async function getNewArrivals(limit: number = 8) {
  try {
    const newProducts = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    return newProducts.map((p) => ({
      ...p,
      images: p.images as string[] | null,
    }));
  } catch (error) {
    console.error('Failed to fetch new arrivals:', error);
    return [];
  }
}

export async function getCategories() {
  try {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(categories.sortOrder);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}
