'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { 
  Card, 
  CardInteractive 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Badge, 
  LowStockBadge, 
  FeaturedBadge, 
  SaleBadge 
} from '@/components/ui/badge';
import { useCart } from '@/hooks/cart-context';
import { useWishlist } from '@/hooks/wishlist-context';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  isFeatured: boolean;
  category?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  size?: 'default' | 'large';
}

export function ProductCard({ product, index = 0, size = 'default' }: ProductCardProps) {
  const { addItem, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const inWishlist = isInWishlist(product.id);

  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.jpg',
      quantity: 1,
      maxStock: product.stock,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.jpg',
      stock: product.stock,
    });
  };

  const isLarge = size === 'large';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      <Link href={`/products/${product.slug}`}>
        <CardInteractive 
          className={cn(
            'group overflow-hidden',
            isLarge && 'md:col-span-2 md:row-span-2'
          )}
        >
          {/* Image Container */}
          <div 
            className={cn(
              'relative overflow-hidden bg-muted',
              isLarge ? 'aspect-square md:aspect-[4/3]' : 'aspect-square'
            )}
          >
            {/* Product Image */}
            <Image
              src={product.images[0] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-slow group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {product.isFeatured && <FeaturedBadge />}
              {discount && <SaleBadge discount={discount} />}
              <LowStockBadge stock={product.stock} />
            </div>

            {/* Quick Actions - Show on hover */}
            <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-base group-hover:opacity-100">
              <Button
                variant="secondary"
                size="icon"
                className={cn(
                  "h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm transition-colors hover:bg-background",
                  inWishlist && "text-destructive"
                )}
                onClick={handleToggleWishlist}
              >
                <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
                <span className="sr-only">Add to wishlist</span>
              </Button>
            </div>

            {/* Add to Cart Button - Show on hover */}
            <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 transition-all duration-base group-hover:translate-y-0 group-hover:opacity-100">
              <Button
                className="w-full shadow-elevated"
                size={isLarge ? 'lg' : 'default'}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className={cn('p-4', isLarge && 'md:p-6')}>
            {/* Category */}
            {product.category && (
              <p className="mb-1 text-xs text-muted-foreground uppercase tracking-wide">
                {product.category}
              </p>
            )}

            {/* Name */}
            <h3 className={cn(
              'font-medium line-clamp-2 transition-colors group-hover:text-primary',
              isLarge ? 'text-lg md:text-xl' : 'text-sm'
            )}>
              {product.name}
            </h3>

            {/* Rating */}
            <div className="mt-2 flex items-center gap-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < Math.floor(product.rating)
                        ? 'fill-warning text-warning'
                        : 'fill-muted text-muted'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="mt-3 flex items-center gap-2">
              <span className={cn(
                'font-semibold',
                isLarge ? 'text-xl' : 'text-base'
              )}>
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>
        </CardInteractive>
      </Link>
    </motion.div>
  );
}
