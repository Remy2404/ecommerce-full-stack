export type UserRole = 'customer' | 'merchant' | 'admin' | 'delivery';

export type User = {
  id: string;
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Address = {
  id: string;
  userId: string;
  label?: string;
  street: string;
  city: string;
  district?: string;
  province: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: Date;
};

export type Merchant = {
  id: string;
  userId: string;
  storeName: string;
  description?: string;
  logo?: string;
  banner?: string;
  phoneNumber: string;
  email?: string;
  addressId?: string;
  isVerified: boolean;
  rating: number;
  totalOrders: number;
  commission: number;
  createdAt: Date;
  updatedAt: Date;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
};

export type WingPoints = {
  id: string;
  userId: string;
  points: number;
  totalEarned: number;
  totalSpent: number;
  updatedAt: Date;
};

export type WingPointsTransaction = {
  id: string;
  userId: string;
  orderId?: string;
  points: number;
  type: string;
  description?: string;
  expiresAt?: Date;
  createdAt: Date;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
};
