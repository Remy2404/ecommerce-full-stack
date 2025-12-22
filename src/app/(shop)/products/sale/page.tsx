import Link from 'next/link';
import { ArrowRight, Percent } from 'lucide-react';
import { BentoGrid } from '@/components/products/bento-grid';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/actions/product.actions';

export const metadata = {
  title: 'Sale | Store',
  description: 'Shop our best deals and discounts. Limited time offers on premium products.',
};

export default async function SalePage() {
  const { products: rawProducts } = await getProducts({ limit: 50 });
  
  // Filter for products on sale (comparePrice exists and is greater than price)
  const filteredSaleProducts = rawProducts.filter(
    (p) => p.comparePrice && parseFloat(p.comparePrice as string) > parseFloat(p.price as string)
  );
  
  const saleProducts = filteredSaleProducts.map((p) => ({
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
      <section className="relative overflow-hidden bg-gradient-to-br from-destructive/10 via-background to-muted/30 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-1.5 text-sm font-medium text-destructive">
              <Percent className="h-4 w-4" />
              Limited Time
            </div>
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
              Sale & Deals
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Don't miss out on our best discounts. Save big on premium products.
            </p>
          </div>
        </div>
        <div className="absolute -left-4 bottom-1/4 h-72 w-72 rounded-full bg-destructive/5 blur-3xl" />
      </section>

      {/* Products */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {saleProducts.length > 0 ? (
          <BentoGrid products={saleProducts} />
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No sale items at the moment. Check back soon!</p>
            <Button className="mt-4" asChild>
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Looking for more?</h2>
          <p className="mt-2 text-muted-foreground">
            Check out our new arrivals and featured products.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/products/new">New Arrivals</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products/featured">Featured</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
