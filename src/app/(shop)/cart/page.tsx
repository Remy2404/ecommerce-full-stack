'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/cart-context';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const shippingFee = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven&apos;t added anything to your cart yet.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="mt-1 text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Button 
          variant="ghost" 
          className="text-muted-foreground hover:text-destructive"
          onClick={clearCart}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-design-lg border border-border bg-card">
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={index !== 0 ? 'border-t border-border' : ''}
                >
                  <div className="flex gap-4 p-4 sm:p-6">
                    {/* Product Image */}
                    <Link 
                      href={`/products/${item.productId}`}
                      className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-design bg-muted sm:h-32 sm:w-32"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <div>
                          <Link 
                            href={`/products/${item.productId}`}
                            className="font-medium hover:text-primary transition-colors line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          {item.variantName && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.variantName}
                            </p>
                          )}
                        </div>
                        <p className="font-semibold sm:text-lg">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 rounded-design border border-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Unit Price & Remove */}
                        <div className="flex items-center gap-4">
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.price)} each
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Button variant="ghost" asChild>
              <Link href="/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-design-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-success">Free</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-xs text-muted-foreground">
                  Free shipping on orders over $100
                </p>
              )}
            </div>

            <div className="my-6 border-t border-border" />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button size="lg" className="mt-6 w-full" asChild>
              <Link href="/checkout">
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {/* Trust badges */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>🔒 Secure Checkout</span>
              <span>•</span>
              <span>🚚 Fast Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
