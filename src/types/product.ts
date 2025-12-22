export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
};

export type Product = {
  id: string;
  merchantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  images?: string[];
  isActive: boolean;
  isFeatured: boolean;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  sku?: string;
  barcode?: string;
  rating: number;
  reviewCount: number;
  soldCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  price: number;
  stock: number;
  image?: string;
  attributes?: Record<string, any>;
  isActive: boolean;
};

export type Review = {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type WishlistItem = {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
};
