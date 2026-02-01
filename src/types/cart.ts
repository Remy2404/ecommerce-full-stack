/**
 * Cart-related type definitions
 * These types mirror the Spring Boot backend models
 */

export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  productImage?: string;
  productSlug?: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number; 
  salePrice?: number;
  subtotal: number;
}
