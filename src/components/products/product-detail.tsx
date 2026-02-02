'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star,
  Truck,
  RefreshCw,
  Shield,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge, LowStockBadge, FeaturedBadge, SaleBadge } from '@/components/ui/badge';
import { useCart } from '@/hooks/cart-context';
import { useWishlist } from '@/hooks/wishlist-context';
import { ProductImageGallery } from './product-image-gallery';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  image?: string;
  attributes?: Record<string, string>;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    comparePrice: number | null;
    stock: number;
    images: string[];
    rating: number;
    reviewCount: number;
    isFeatured: boolean;
    variants?: ProductVariant[];
    category?: { name: string; slug: string };
    merchant?: { storeName: string };
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const inWishlist = isInWishlist(product.id);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );
  const [isSticky, setIsSticky] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Calculate discount
  const discount = product.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  // Current stock (variant or product)
  const currentStock = selectedVariant?.stock ?? product.stock;
  const currentPrice = selectedVariant?.price ?? product.price;
  const isLowStock = currentStock > 0 && currentStock < 10;
  const isOutOfStock = currentStock === 0;

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Handle sticky add to cart
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price: currentPrice,
      image: product.images[0] || '/placeholder.jpg',
      quantity,
      variantName: selectedVariant?.name,
      maxStock: currentStock,
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div className="group">
            <ProductImageGallery 
              images={product.images} 
              productName={product.name} 
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isFeatured && <FeaturedBadge />}
              {discount && <SaleBadge discount={discount} />}
              <LowStockBadge stock={currentStock} />
            </div>

            {/* Category & Title */}
            {product.category && (
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {product.category.name}
              </p>
            )}
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-5 w-5',
                      i < Math.floor(product.rating)
                        ? 'fill-warning text-warning'
                        : 'fill-muted text-muted'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                {formatPrice(currentPrice)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
              {discount && (
                <Badge variant="destructive">Save {discount}%</Badge>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Select Option
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={variant.stock === 0}
                      className={cn(
                        'rounded-design border px-4 py-2 text-sm font-medium transition-all',
                        selectedVariant?.id === variant.id
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/50',
                        variant.stock === 0 && 'cursor-not-allowed opacity-50 line-through'
                      )}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col gap-4 sm:flex-row">
              {/* Quantity Selector */}
              <div className="flex items-center rounded-design border border-border">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                  disabled={quantity >= currentStock}
                  className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <Button
                size="lg"
                className="flex-1"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {addedToCart ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                  </>
                )}
              </Button>

              {/* Wishlist Button */}
              <Button 
                variant="outline" 
                size="lg" 
                className={cn("w-12 px-0 transition-colors", inWishlist && "text-destructive border-destructive")}
                onClick={() => toggleWishlist({
                  productId: product.id,
                  name: product.name,
                  price: currentPrice,
                  image: product.images[0] || '/placeholder.jpg',
                  stock: currentStock,
                })}
              >
                <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
                <span className="sr-only">Add to wishlist</span>
              </Button>
            </div>

            {/* Stock Status */}
            {isLowStock && (
              <p className="flex items-center gap-2 text-sm text-warning">
                <span className="animate-pulse rounded-full bg-warning h-2 w-2" />
                Only {currentStock} left in stock - order soon!
              </p>
            )}

            {/* Product Info */}
            <div className="space-y-3 border-t border-border pt-6">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span>Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                <span>30-day easy returns</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span>Secure checkout with SSL encryption</span>
              </div>
            </div>

            {/* Share */}
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share this product
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart */}
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm lg:bottom-0"
          >
            <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 flex-shrink-0">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="rounded-design-sm object-cover"
                />
              </div>
                <div className="hidden sm:block">
                  <p className="font-medium line-clamp-1">{product.name}</p>
                  <p className="text-lg font-bold">{formatPrice(currentPrice)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold sm:hidden">{formatPrice(currentPrice)}</span>
                <Button
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  <span className="hidden sm:inline">Add to Cart</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
