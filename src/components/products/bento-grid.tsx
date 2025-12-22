'use client';

import { ProductCard, Product } from './product-card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface BentoGridProps {
  products: Product[];
  isLoading?: boolean;
  className?: string;
}

export function BentoGrid({ products, isLoading, className }: BentoGridProps) {
  if (isLoading) {
    return (
      <div className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}>
        {[...Array(8)].map((_, i) => (
          <div 
            key={i} 
            className={cn(
              i === 0 && 'sm:col-span-2 sm:row-span-2'
            )}
          >
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg text-muted-foreground">No products found</p>
      </div>
    );
  }

  // Separate featured products for hero tiles
  const featuredProducts = products.filter(p => p.isFeatured);
  const regularProducts = products.filter(p => !p.isFeatured);

  // Combine with featured first (they'll be displayed larger)
  const sortedProducts = [...featuredProducts, ...regularProducts];

  return (
    <div className={cn(
      'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
      className
    )}>
      {sortedProducts.map((product, index) => {
        // First featured product gets the large hero tile
        const isHero = product.isFeatured && index === 0;
        
        return (
          <div
            key={product.id}
            className={cn(
              isHero && 'sm:col-span-2 sm:row-span-2'
            )}
          >
            <ProductCard 
              product={product} 
              index={index}
              size={isHero ? 'large' : 'default'}
            />
          </div>
        );
      })}
    </div>
  );
}

// Bento Grid Hero Section
interface BentoHeroProps {
  title: string;
  subtitle?: string;
  products: Product[];
  isLoading?: boolean;
}

export function BentoHero({ title, subtitle, products, isLoading }: BentoHeroProps) {
  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mb-8 text-center lg:mb-12">
        <h2 className="text-3xl font-bold tracking-tight lg:text-4xl">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <BentoGrid products={products} isLoading={isLoading} />
    </section>
  );
}

// Featured Products Row
interface FeaturedRowProps {
  title: string;
  products: Product[];
  isLoading?: boolean;
}

export function FeaturedRow({ title, products, isLoading }: FeaturedRowProps) {
  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold">{title}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-6 text-2xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.slice(0, 4).map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  );
}
