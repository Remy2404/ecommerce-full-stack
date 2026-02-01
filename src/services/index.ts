// ============================================================================
// Service Exports
// ============================================================================

// API Client
export { default as api } from './api';
export {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  isAuthenticated,
  decodeToken,
} from './api';

// Auth Service
export {
  login,
  register,
  loginWithGoogle,
  logout,
  refreshToken,
  getCurrentUser,
  isLoggedIn,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from './auth.service';
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UserSummary,
  GoogleLoginRequest,
  AuthResult,
} from './auth.service';

// Product Service
export {
  getProducts,
  getAllProducts,
  getProductBySlug,
  getFeaturedProducts,
  getNewArrivals,
} from './product.service';
export type {
  ProductResponse,
  ProductFilterParams,
  ProductListResult,
} from './product.service';

// Cart Service
export {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from './cart.service';
export type {
  CartItem,
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  CartResult,
} from './cart.service';

// Order Service
export {
  createOrder,
  getUserOrders,
  getOrderByNumber,
  cancelOrder,
} from './order.service';
export type {
  OrderItem,
  ShippingAddress,
  OrderResponse,
  CreateOrderRequest,
  OrderResult,
  OrderListResult,
} from './order.service';

// Category Service
export { getCategories, getCategoryBySlug } from './category.service';
export type { CategoryResponse } from './category.service';
