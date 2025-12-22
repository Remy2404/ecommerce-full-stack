import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';
import { eq, desc, asc, and, ilike, gte, lte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sort') || 'newest';
    
    const offset = (page - 1) * limit;

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

    if (featured === 'true') {
      conditions.push(eq(products.isFeatured, true));
    }

    if (minPrice) {
      conditions.push(gte(products.price, minPrice));
    }

    if (maxPrice) {
      conditions.push(lte(products.price, maxPrice));
    }

    if (search) {
      conditions.push(ilike(products.name, `%${search}%`));
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'price_asc':
        orderBy = asc(products.price);
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

    // Execute queries
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

    return NextResponse.json({
      products: productList.map((p) => ({
        ...p,
        images: p.images as string[] | null,
        price: parseFloat(p.price),
        comparePrice: p.comparePrice ? parseFloat(p.comparePrice) : null,
        rating: parseFloat(p.rating || '0'),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
