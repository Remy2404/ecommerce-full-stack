import Link from 'next/link';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { BentoGrid } from '@/components/products/bento-grid';
import { Button } from '@/components/ui/button';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { SortSelect } from '@/components/products/sort-select';
import { getProducts, getCategories } from '@/actions/product.actions';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of premium products. Quality meets style in every item.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    featured?: string;
    sale?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;

  // Fetch products and categories from database
  const [productsData, categories] = await Promise.all([
    getProducts({
      category: params.category,
      featured: params.featured === 'true' ? true : undefined,
      sale: params.sale === 'true' ? true : undefined,
      minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      sortBy: (params.sort as any) || 'newest',
      page: parseInt(params.page || '1'),
      limit: 50,
    }),
    getCategories(),
  ]);

  // Format products for display
  const formattedProducts = productsData.products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: parseFloat(p.price as string),
    comparePrice: p.comparePrice ? parseFloat(p.comparePrice as string) : null,
    images: p.images || [],
    rating: parseFloat(p.rating as string),
    reviewCount: p.reviewCount ?? 0,
    stock: p.stock,
    isFeatured: p.isFeatured,
  }));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            {params.featured === 'true' ? 'Featured Products' :
              params.sort === 'newest' ? 'New Arrivals' :
                params.sale === 'true' ? 'Products on Sale' :
                  'All Products'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {params.featured === 'true'
              ? 'Hand-picked selections from our collection'
              : params.sort === 'newest'
                ? 'Check out our latest collection of premium products'
                : params.sale === 'true'
                  ? 'Great deals on high-quality products'
                  : 'Browse our complete collection of premium products'}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 lg:flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/products"
                      className={`block rounded-design px-3 py-2 text-sm transition-colors ${!params.category ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    >
                      All Products
                    </Link>
                  </li>
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className={`flex items-center gap-2 rounded-design px-3 py-2 text-sm transition-colors ${params.category === category.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      >
                        <DynamicIcon name={category.icon || 'Package'} size={16} />
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Price Range
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/products?maxPrice=50"
                    className="block rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    Under $50
                  </Link>
                  <Link
                    href="/products?minPrice=50&maxPrice=100"
                    className="block rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    $50 - $100
                  </Link>
                  <Link
                    href="/products?minPrice=100&maxPrice=200"
                    className="block rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    $100 - $200
                  </Link>
                  <Link
                    href="/products?minPrice=200"
                    className="block rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    Over $200
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/products?sort=newest"
                    className="block rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    New Arrivals
                  </Link>
                  <Link
                    href="/products?featured=true"
                    className={`block rounded-design px-3 py-2 text-sm transition-colors ${params.featured === 'true' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                  >
                    Featured
                  </Link>
                  <Link
                    href="/products?sale=true"
                    className="block rounded-design px-3 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    On Sale
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {formattedProducts.length} of {productsData.pagination.total} products
              </p>
              <div className="flex items-center gap-2">
                <SortSelect defaultValue={params.sort || 'newest'} />
              </div>
            </div>

            {/* Products */}
            <BentoGrid products={formattedProducts} />

            {/* Empty State */}
            {formattedProducts.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg text-muted-foreground">No products found</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href="/products">Clear Filters</Link>
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
