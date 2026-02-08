/**
 * User-related type definitions
 */

// --- Backend API Responses (DTOs) ---

import type { AddressApiResponse } from './address';
import { normalizeUserRole } from '@/lib/roles';

export interface SavedPaymentMethodApiResponse {
  id: string;
  method: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserApiResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // Unified name
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneNumber?: string;
  avatarUrl?: string;
  twofaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  addresses?: AddressApiResponse[];
  savedPaymentMethods?: SavedPaymentMethodApiResponse[];
}

export interface RefreshTokenApiResponse {
  token: string;
  expiryDate: string;
}

// --- Frontend Domain Models ---

export type UserRole = 'CUSTOMER' | 'USER' | 'ADMIN' | 'MERCHANT' | 'DELIVERY';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified: boolean;
  twofaEnabled: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  method: string;
  brand?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User extends AuthUser {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  savedPaymentMethods?: SavedPaymentMethod[];
}

export interface RefreshToken {
  token: string;
  expiryDate: string;
}

// --- Auth-specific Inputs (for API) ---

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

// --- Transformation Logic ---

export function mapAuthUser(raw: UserApiResponse): AuthUser {
  const normalizedRole = normalizeUserRole(raw.role);
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name || `${raw.firstName} ${raw.lastName}`.trim(),
    role: normalizedRole,
    avatarUrl: raw.avatarUrl,
    emailVerified: Boolean(raw.emailVerified),
    twofaEnabled: Boolean(raw.twofaEnabled),
  };
}

export function mapUser(raw: UserApiResponse): User {
  return {
    ...mapAuthUser(raw),
    firstName: raw.firstName,
    lastName: raw.lastName,
    phoneNumber: raw.phoneNumber,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    savedPaymentMethods: raw.savedPaymentMethods,
  };
}
