import api from './api';
import { AxiosError } from 'axios';
import { 
  Cart, 
  CartApiResponse, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  CartResult,
  mapCart
} from '@/types';

export type { 
  Cart, 
  CartApiResponse, 
  AddToCartRequest, 
  UpdateCartItemRequest, 
  CartResult 
};
export { mapCart };

/**
 * Get current user's cart
 */
export async function getCart(): Promise<Cart | null> {
  try {
    const response = await api.get<CartApiResponse>('/cart');
    return mapCart(response.data);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
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
    const response = await api.post<CartApiResponse>('/cart/add', data);
    return { success: true, cart: mapCart(response.data) };
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
    const response = await api.put<CartApiResponse>('/cart/items', data);
    return { success: true, cart: mapCart(response.data) };
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
    const response = await api.delete<CartApiResponse>(`/cart/remove/${itemId}`);
    return { success: true, cart: mapCart(response.data) };
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
