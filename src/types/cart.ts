/**
 * Cart-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface CartItemApiResponse {
  id: string;
  cartId?: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productSlug: string;
  variantId: string | null;
  variantName: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartApiResponse {
  id: string;
  userId?: string;
  items: CartItemApiResponse[];
  itemCount: number;
  subtotal: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

// --- Frontend Domain Models ---

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productSlug: string;
  variantId: string | null;
  variantName: string | null;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

// --- Service Inputs (for API) ---

export interface AddToCartRequest {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: string;
  quantity: number;
}

// --- UI Logic Types & Results ---

export interface CartResult {
  success: boolean;
  cart?: Cart;
  error?: string;
}

// --- Transformation Logic ---

export function mapCartItem(raw: CartItemApiResponse): CartItem {
  return {
    id: raw.id,
    cartId: raw.cartId || '',
    productId: raw.productId,
    productName: raw.productName,
    productImage: raw.productImage,
    productSlug: raw.productSlug,
    variantId: raw.variantId,
    variantName: raw.variantName,
    price: Number(raw.price),
    quantity: raw.quantity,
    subtotal: Number(raw.subtotal),
  };
}

export function mapCart(raw: CartApiResponse): Cart {
  return {
    id: raw.id || '',
    items: (raw.items || []).map(mapCartItem),
    itemCount: raw.itemCount || 0,
    subtotal: Number(raw.subtotal || 0),
    total: Number(raw.total || raw.subtotal || 0),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}
