import Link from 'next/link';
import { ArrowRight, Sparkles, Truck, Shield, RefreshCw } from 'lucide-react';
import { BentoGrid, FeaturedRow } from '@/components/products/bento-grid';
import { Button } from '@/components/ui/button';
import { getFormattedMockProducts, getFeaturedMockProducts, mockCategories } from '@/lib/mock-data';

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

export default function HomePage() {
  // Using mock data for now - will be replaced with actual DB queries
  const allProducts = getFormattedMockProducts();
  const featuredProducts = getFeaturedMockProducts();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-muted/50 via-background to-muted/30">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              New Collection 2025
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Discover Products
              <span className="block text-primary">Designed for You</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Experience our curated collection of premium products. 
              Quality craftsmanship meets modern design in every piece.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/products?featured=true">
                  View Featured
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -left-4 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-4 bottom-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      </section>

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
          <h2 className="text-2xl font-bold">Shop by Category</h2>
          <Button variant="ghost" asChild>
            <Link href="/products">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {mockCategories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col items-center gap-3 rounded-design bg-muted/50 p-6 text-center transition-all hover:bg-muted hover:shadow-soft"
            >
              <span className="text-4xl">{category.icon}</span>
              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                {category.name}
              </span>
            </Link>
          ))}
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
          <BentoGrid products={allProducts} />
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {allProducts.slice(0, 4).map((product, index) => (
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
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold lg:text-4xl">
              Join Our Newsletter
            </h2>
            <p className="mt-4 text-primary-foreground/80">
              Subscribe to get special offers, free giveaways, and new arrival updates.
            </p>
            <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-12 w-full rounded-design border-0 bg-white/10 px-4 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 sm:max-w-xs"
              />
              <Button 
                variant="secondary" 
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
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
