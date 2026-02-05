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
  tempToken?: string; 
}

export interface TwoFactorResponse {
  secret: string;
  qrCodeUrl: string;
  message?: string;
}

// --- Backend API Requests (DTOs) ---

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface CompletePasswordResetRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface Enable2FARequest {
  code: string;
}

// --- Frontend Domain Models ---

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  token?: string;
  tempToken?: string;
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
