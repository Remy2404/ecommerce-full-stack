import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { BentoGrid } from '@/components/products/bento-grid';
import { Button } from '@/components/ui/button';
import { getFormattedMockProducts } from '@/lib/mock-data';

export const metadata = {
  title: 'New Arrivals | Store',
  description: 'Discover our latest products and newest additions to our collection.',
};

export default function NewArrivalsPage() {
  // Get products sorted by newest first
  const allProducts = getFormattedMockProducts();
  const newProducts = [...allProducts].sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Clock className="h-4 w-4" />
              Just Dropped
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              New Arrivals
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Be the first to discover our latest products. Fresh styles added weekly.
            </p>
          </div>
        </div>
        <div className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <BentoGrid products={newProducts} />
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Want to see more?</h2>
          <p className="mt-2 text-muted-foreground">
            Browse our complete collection of premium products.
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
