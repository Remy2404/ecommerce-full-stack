'use server';

import * as cartService from '@/services/cart.service';
import { getCurrentUser } from '@/services/auth.service';

export type CartResult = {
  success: boolean;
  error?: string;
  cart?: {
    id: string;
    items: CartItem[];
    itemCount: number;
    subtotal: number;
    total: number;
  };
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string | null;
  variantId: string | null;
  variantName: string | null;
  price: number;
  quantity: number;
  subtotal: number;
  stock: number;
};

/**
 * Get current user's cart
 * Calls Spring Boot backend /api/cart
 */
export async function getCart(): Promise<CartResult> {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const cart = await cartService.getCart();

  if (!cart) {
    return {
      success: true,
      cart: {
        id: '',
        items: [],
        itemCount: 0,
        subtotal: 0,
        total: 0,
      },
    };
  }

  return {
    success: true,
    cart: {
      id: cart.id,
      items: cart.items,
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      total: cart.total,
    },
  };
}

/**
 * Add item to cart
 * Calls Spring Boot backend /api/cart/add
 */
export async function addToCart(
  productId: string,
  quantity: number = 1,
  variantId?: string
): Promise<CartResult> {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Please log in to add items to cart' };
  }

  const result = await cartService.addToCart({
    productId,
    variantId,
    quantity,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    cart: result.cart
      ? {
          id: result.cart.id,
          items: result.cart.items,
          itemCount: result.cart.itemCount,
          subtotal: result.cart.subtotal,
          total: result.cart.total,
        }
      : undefined,
  };
}

/**
 * Remove item from cart
 * Calls Spring Boot backend /api/cart/remove/{itemId}
 */
export async function removeFromCart(itemId: string): Promise<CartResult> {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const result = await cartService.removeFromCart(itemId);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    cart: result.cart
      ? {
          id: result.cart.id,
          items: result.cart.items,
          itemCount: result.cart.itemCount,
          subtotal: result.cart.subtotal,
          total: result.cart.total,
        }
      : undefined,
  };
}

/**
 * Update cart item quantity
 * Calls Spring Boot backend /api/cart/items
 */
export async function updateCartQuantity(
  itemId: string,
  quantity: number
): Promise<CartResult> {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  if (quantity < 1) {
    return removeFromCart(itemId);
  }

  const result = await cartService.updateCartQuantity({
    cartItemId: itemId,
    quantity,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return {
    success: true,
    cart: result.cart
      ? {
          id: result.cart.id,
          items: result.cart.items,
          itemCount: result.cart.itemCount,
          subtotal: result.cart.subtotal,
          total: result.cart.total,
        }
      : undefined,
  };
}

/**
 * Clear all items from cart
 * Calls Spring Boot backend /api/cart/clear
 */
export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  return cartService.clearCart();
}
