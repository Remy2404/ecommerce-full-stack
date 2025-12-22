import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, id), eq(products.isActive, true)),
      with: {
        category: true,
        merchant: {
          columns: {
            id: true,
            storeName: true,
            rating: true,
            logo: true,
          },
        },
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

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await db
      .update(products)
      .set({ viewCount: sql`${products.viewCount} + 1` })
      .where(eq(products.id, id));

    return NextResponse.json({
      ...product,
      images: product.images as string[] | null,
      price: parseFloat(product.price),
      comparePrice: product.comparePrice ? parseFloat(product.comparePrice) : null,
      rating: parseFloat(product.rating || '0'),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
