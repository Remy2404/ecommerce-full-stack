'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useWishlist, WishlistItem } from '@/hooks/wishlist-context';
import { useCart } from '@/hooks/cart-context';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleAddToCart = (item: WishlistItem) => {
    addToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      maxStock: item.stock,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Heart className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Your wishlist is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Save items you love to find them easily later.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products">
              Explore Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>
        <Button 
          variant="ghost" 
          className="text-muted-foreground hover:text-destructive"
          onClick={clearWishlist}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear All
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.productId}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative flex flex-col rounded-design-lg border border-border bg-card overflow-hidden transition-all hover:shadow-soft"
            >
              <Link href={`/products/${item.productId}`} className="aspect-square relative overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      removeItem(item.productId);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Link>

              <div className="flex flex-1 flex-col p-4">
                <Link 
                  href={`/products/${item.productId}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-lg font-bold">
                  {formatPrice(item.price)}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                  >
                    <ShoppingCart className="mr-2 h-3 w-3" />
                    {item.stock > 0 ? 'To Cart' : 'Out of Stock'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
