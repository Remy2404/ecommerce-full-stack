/**
 * User-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface UserApiResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // Unified name
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefreshTokenApiResponse {
  token: string;
  expiryDate: string;
}

// --- Frontend Domain Models ---

export type UserRole = 'USER' | 'ADMIN' | 'MERCHANT';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  emailVerified: boolean;
}

export interface User extends AuthUser {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  firstName: string;
  lastName: string;
}

// --- Transformation Logic ---

export function mapAuthUser(raw: UserApiResponse): AuthUser {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name || `${raw.firstName} ${raw.lastName}`.trim(),
    role: raw.role,
    avatarUrl: raw.avatarUrl,
    emailVerified: raw.emailVerified,
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
  };
}
