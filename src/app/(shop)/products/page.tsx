import Link from 'next/link';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { BentoGrid } from '@/components/products/bento-grid';
import { Button } from '@/components/ui/button';
import { getFormattedMockProducts, mockCategories } from '@/lib/mock-data';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse our complete collection of premium products. Quality meets style in every item.',
};

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    featured?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const allProducts = getFormattedMockProducts();
  
  // Apply filters (mock implementation)
  let filteredProducts = [...allProducts];
  
  if (params.featured === 'true') {
    filteredProducts = filteredProducts.filter(p => p.isFeatured);
  }

  if (params.sort === 'price_asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (params.sort === 'price_desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-border bg-muted/30 py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            {params.featured === 'true' ? 'Featured Products' : 'All Products'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {params.featured === 'true' 
              ? 'Hand-picked selections from our collection'
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
                  {mockCategories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className={`block rounded-design px-3 py-2 text-sm transition-colors ${params.category === category.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                      >
                        {category.icon} {category.name}
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
                Showing {filteredProducts.length} products
              </p>
              <div className="flex items-center gap-2">
                <select
                  defaultValue={params.sort || 'newest'}
                  className="h-10 rounded-design border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  onChange={(e) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('sort', e.target.value);
                    window.location.href = url.toString();
                  }}
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Products */}
            <BentoGrid products={filteredProducts} />

            {/* Empty State */}
            {filteredProducts.length === 0 && (
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
