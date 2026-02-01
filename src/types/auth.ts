/**
 * Auth-related type definitions
 * These types mirror the Spring Boot backend models
 */

// Enums
export type UserRole = 'USER' | 'ADMIN' | 'MERCHANT';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label?: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  bakongId: string;
  isVerified: boolean;
  createdAt: string;
}

export interface WingPoints {
  id: string;
  userId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface WingPointsTransaction {
  id: string;
  userId: string;
  type: 'EARN' | 'SPEND' | 'EXPIRE' | 'ADJUST';
  amount: number;
  description?: string;
  orderId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

// Auth-specific types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
}
