/**
 * Auth-related type definitions
 * These types mirror the Spring Boot backend models
 */

import { UserApiResponse, AuthUser, UserRole } from './user';

// --- Backend API Responses (DTOs) ---

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserApiResponse;
}

// --- Frontend Domain Models ---

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  token?: string;
}

export interface JwtPayload {
  id?: string;
  sub: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole | UserRole[];
  avatar?: string;
  exp: number;
}

// Re-export common auth types from user.ts
export type { UserRole, LoginCredentials, RegisterData } from './user';
