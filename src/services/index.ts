// ============================================================================
// Service Exports
// ============================================================================

// API Client and Auth Utilities
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
  AuthResult,
  AuthUser,
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
  OrderResult,
  OrderListResult,
} from './order.service';

// Category Service
export { getCategories, getCategoryBySlug } from './category.service';

// Wishlist Service
export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from './wishlist.service';
