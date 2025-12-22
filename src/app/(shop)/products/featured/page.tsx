import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { BentoGrid } from '@/components/products/bento-grid';
import { Button } from '@/components/ui/button';
import { getFormattedMockProducts } from '@/lib/mock-data';

export const metadata = {
  title: 'Featured Products | Store',
  description: 'Hand-picked selections from our collection. The best products we have to offer.',
};

export default function FeaturedPage() {
  const allProducts = getFormattedMockProducts();
  const featuredProducts = allProducts.filter(p => p.isFeatured);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-warning/10 via-background to-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-warning/10 px-4 py-1.5 text-sm font-medium text-warning">
              <Star className="h-4 w-4 fill-current" />
              Editor's Choice
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Featured Products
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Hand-selected by our team. These are the products we love the most.
            </p>
          </div>
        </div>
        <div className="absolute -right-4 bottom-1/4 h-72 w-72 rounded-full bg-warning/5 blur-3xl" />
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {featuredProducts.length > 0 ? (
          <BentoGrid products={featuredProducts} />
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No featured products at the moment.</p>
            <Button className="mt-4" asChild>
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Explore Our Collection</h2>
          <p className="mt-2 text-muted-foreground">
            Discover even more amazing products.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
