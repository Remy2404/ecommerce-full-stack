'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { useAuth } from './auth-context';
import * as cartService from '@/services/cart.service';
import type { Cart } from '@/types';

export interface CartItem {
  id: string;
  productId: string;
  merchantId?: string;
  variantId?: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantName?: string;
  maxStock: number;
  slug?: string;
}

interface AddItemInput {
  productId: string;
  variantId?: string;
  quantity?: number;
  merchantId?: string;
  name?: string;
  price?: number;
  image?: string;
  variantName?: string;
  maxStock?: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: AddItemInput) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const toUiItems = (cart: Cart | null): CartItem[] => {
  if (!cart) return [];

  return cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    merchantId: item.merchantId ?? undefined,
    variantId: item.variantId ?? undefined,
    name: item.productName,
    price: item.price,
    image: item.productImage || '/placeholder.jpg',
    quantity: item.quantity,
    variantName: item.variantName ?? undefined,
    maxStock: Math.max(item.availableStock ?? item.quantity, item.quantity),
    slug: item.productSlug,
  }));
};

const resolveItemCount = (cart: Cart | null): number => {
  if (!cart) return 0;
  if (typeof cart.itemCount === 'number') return cart.itemCount;
  return cart.items.reduce((count, item) => count + item.quantity, 0);
};

const resolveSubtotal = (cart: Cart | null): number => {
  if (!cart) return 0;
  return Number(cart.subtotal ?? 0);
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const applyBackendCart = useCallback((cart: Cart | null) => {
    setItems(toUiItems(cart));
    setItemCount(resolveItemCount(cart));
    setSubtotal(resolveSubtotal(cart));
  }, []);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      applyBackendCart(null);
      return;
    }

    const backendCart = await cartService.getCart();
    applyBackendCart(backendCart);
  }, [applyBackendCart, isAuthenticated]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let disposed = false;

    const hydrate = async () => {
      setIsLoading(true);
      try {
        if (!isAuthenticated) {
          if (!disposed) {
            applyBackendCart(null);
          }
          return;
        }

        const backendCart = await cartService.getCart();
        if (!disposed) {
          applyBackendCart(backendCart);
        }
      } finally {
        if (!disposed) {
          setIsLoading(false);
          setIsHydrated(true);
        }
      }
    };

    void hydrate();

    return () => {
      disposed = true;
    };
  }, [applyBackendCart, isAuthenticated, isAuthLoading]);

  const ensureAuthenticated = useCallback(() => {
    if (isAuthenticated) {
      return true;
    }

    toast.error('Please sign in to manage your cart.');
    return false;
  }, [isAuthenticated]);

  const addItem = useCallback(async (item: AddItemInput): Promise<boolean> => {
    if (!ensureAuthenticated()) {
      return false;
    }

    const quantity = Math.max(1, item.quantity ?? 1);
    setIsLoading(true);

    try {
      const result = await cartService.addToCart({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity,
      });

      if (!result.success) {
        toast.error(result.error || 'Failed to add item to cart');
        await refreshCart();
        return false;
      }

      applyBackendCart(result.cart ?? null);
      setIsOpen(true);
      return true;
    } finally {
      setIsLoading(false);
    }
  }, [applyBackendCart, ensureAuthenticated, refreshCart]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (!ensureAuthenticated()) {
      return;
    }

    if (quantity < 1) {
      setIsLoading(true);
      void (async () => {
        const result = await cartService.removeFromCart(id);
        if (!result.success) {
          toast.error(result.error || 'Failed to update cart');
          await refreshCart();
          return;
        }

        applyBackendCart(result.cart ?? null);
      })().finally(() => {
        setIsLoading(false);
      });
      return;
    }

    setIsLoading(true);
    void (async () => {
      const result = await cartService.updateCartQuantity({
        cartItemId: id,
        quantity,
      });

      if (!result.success) {
        toast.error(result.error || 'Failed to update cart');
        await refreshCart();
        return;
      }

      applyBackendCart(result.cart ?? null);
    })().finally(() => {
      setIsLoading(false);
    });
  }, [applyBackendCart, ensureAuthenticated, refreshCart]);

  const removeItem = useCallback((id: string) => {
    if (!ensureAuthenticated()) {
      return;
    }

    setIsLoading(true);
    void (async () => {
      const result = await cartService.removeFromCart(id);
      if (!result.success) {
        toast.error(result.error || 'Failed to remove item from cart');
        await refreshCart();
        return;
      }

      applyBackendCart(result.cart ?? null);
    })().finally(() => {
      setIsLoading(false);
    });
  }, [applyBackendCart, ensureAuthenticated, refreshCart]);

  const clearCart = useCallback(() => {
    if (!ensureAuthenticated()) {
      return;
    }

    setIsLoading(true);
    void (async () => {
      const result = await cartService.clearCart();
      if (!result.success) {
        toast.error(result.error || 'Failed to clear cart');
        await refreshCart();
        return;
      }

      applyBackendCart(null);
      setIsOpen(false);
    })().finally(() => {
      setIsLoading(false);
    });
  }, [applyBackendCart, ensureAuthenticated, refreshCart]);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const value = useMemo<CartContextType>(() => ({
    items,
    isOpen,
    isLoading,
    isHydrated,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    openCart,
    closeCart,
    toggleCart,
  }), [
    addItem,
    clearCart,
    closeCart,
    isHydrated,
    isLoading,
    isOpen,
    itemCount,
    items,
    openCart,
    refreshCart,
    removeItem,
    subtotal,
    toggleCart,
    updateQuantity,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
