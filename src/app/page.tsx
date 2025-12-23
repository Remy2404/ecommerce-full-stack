import Link from 'next/link';
import { ArrowRight, Truck, Shield, RefreshCw } from 'lucide-react';
import { BentoGrid } from '@/components/products/bento-grid';
import { Button } from '@/components/ui/button';
import { getCategories, getFeaturedProducts, getNewArrivals } from '@/actions/product.actions';
import HeroWithLaser from '@/components/home/hero-with-laser';
import FlowingMenu from '@/components/reactbit/FlowingMenu';

export const metadata = {
  title: 'Store | Premium E-commerce',
  description: 'Discover premium products curated for modern living. Quality meets style in every item we offer.',
};

// Features list
const features = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $100',
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: '100% protected',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: '30-day return policy',
  },
];

export default async function HomePage() {
  // Fetch data from database
  const [categories, featuredProducts, newProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getNewArrivals(5),
  ]);

  // Format products for display
  const formattedFeaturedProducts = featuredProducts.map((p) => ({
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

  const formattedNewProducts = newProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: parseFloat(p.price as string),
    images: p.images || [],
  }));

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <HeroWithLaser />

      {/* Features Bar */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-center justify-center gap-4 text-center sm:justify-start sm:text-left"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-design-sm bg-background shadow-soft">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold lg:text-3xl">Shop by Category</h2>
            <p className="mt-1 text-muted-foreground">Premium collections for every lifestyle</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800">
          <FlowingMenu
            items={categories.map(cat => ({
              link: `/products?category=${cat.slug}`,
              text: cat.name,
              image: cat.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80'
            }))}
          />
        </div>
      </section>

      {/* Featured Products - Bento Grid */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold lg:text-3xl">Featured Products</h2>
              <p className="mt-1 text-muted-foreground">Hand-picked selections just for you</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products?featured=true">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <BentoGrid products={formattedFeaturedProducts} />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold lg:text-3xl">New Arrivals</h2>
            <p className="mt-1 text-muted-foreground">The latest additions to our collection</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/products?sort=newest">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {formattedNewProducts.map((product, index) => (
            <div key={product.id}>
              <Link
                href={`/products/${product.slug}`}
                className="group block overflow-hidden rounded-design border border-border bg-card transition-all hover:shadow-float hover:-translate-y-1"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <p className="mt-2 font-semibold">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground dark:bg-card dark:text-card-foreground border-t border-border">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Join Our Newsletter
            </h2>
            <p className="mt-4 opacity-80">
              Subscribe to get special offers, free giveaways, and new arrival updates.
            </p>
            <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-12 w-full rounded-design border border-white/20 bg-white/10 px-4 text-sm text-inherit placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-xs dark:bg-primary/5 dark:border-primary/10"
                suppressHydrationWarning
              />
              <Button
                variant="default"
                size="lg"
                className="rounded-design bg-white text-black hover:bg-black hover:text-white transition-colors duration-300 dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
