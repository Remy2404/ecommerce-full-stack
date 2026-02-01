import api from './api';
import { AxiosError } from 'axios';

// ============================================================================
// Types
// ============================================================================

export interface CartItem {
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
  stock?: number;
}

export interface CartResponse {
  id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}

export interface CartResult {
  success: boolean;
  cart?: CartResponse;
  error?: string;
}

// ============================================================================
// Cart Service
// ============================================================================

/**
 * Get current user's cart
 */
export async function getCart(): Promise<CartResponse | null> {
  try {
    const response = await api.get<CartResponse>('/cart');
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      // Not authenticated, return null
      return null;
    }
    console.error('Failed to fetch cart:', error);
    return null;
  }
}

/**
 * Add item to cart
 */
export async function addToCart(data: AddToCartRequest): Promise<CartResult> {
  try {
    const response = await api.post<CartResponse>('/cart/add', data);
    return { success: true, cart: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || 'Failed to add item to cart';
    return { success: false, error: message };
  }
}

/**
 * Update cart item quantity
 */
export async function updateCartQuantity(data: UpdateCartItemRequest): Promise<CartResult> {
  try {
    const response = await api.put<CartResponse>('/cart/items', data);
    return { success: true, cart: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || 'Failed to update cart';
    return { success: false, error: message };
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(itemId: string): Promise<CartResult> {
  try {
    const response = await api.delete<CartResponse>(`/cart/remove/${itemId}`);
    return { success: true, cart: response.data };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || 'Failed to remove item';
    return { success: false, error: message };
  }
}

/**
 * Clear all items from cart
 */
export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  try {
    await api.delete('/cart/clear');
    return { success: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || 'Failed to clear cart';
    return { success: false, error: message };
  }
}
