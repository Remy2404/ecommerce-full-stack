import api, { setAccessToken, removeAccessToken, getAccessToken, decodeToken } from './api';
import { AxiosError } from 'axios';

// ============================================================================
// Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserSummary;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: UserSummary;
  token?: string;
}

// ============================================================================
// Auth Service
// ============================================================================

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;
    setAccessToken(token);

    return { success: true, user, token };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || 'Invalid email or password';
    return { success: false, error: message };
  }
}

/**
 * Register a new user
 */
export async function register(data: RegisterRequest): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/auth/register', data);

    const { token, user } = response.data;
    setAccessToken(token);

    return { success: true, user, token };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    
    // Handle validation errors
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const firstError = Object.values(errors).flat()[0];
      return { success: false, error: firstError || 'Validation failed' };
    }
    
    const message = axiosError.response?.data?.message || 'Registration failed';
    return { success: false, error: message };
  }
}

/**
 * Login with Google ID token
 */
export async function loginWithGoogle(idToken: string): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/auth/google/login', {
      idToken,
    });

    const { token, user } = response.data;
    setAccessToken(token);

    return { success: true, user, token };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    const message = axiosError.response?.data?.message || 'Google authentication failed';
    return { success: false, error: message };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore errors, still clear local token
  } finally {
    removeAccessToken();
  }
}

/**
 * Refresh access token (uses httpOnly refresh token cookie)
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await api.post<{ accessToken: string }>('/auth/refresh-token');
    const { accessToken } = response.data;
    
    if (accessToken) {
      setAccessToken(accessToken);
      return true;
    }
    return false;
  } catch {
    removeAccessToken();
    return false;
  }
}

/**
 * Get current user from stored JWT
 */
export function getCurrentUser(): UserSummary | null {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = decodeToken<{
    sub: string;
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role: 'USER' | 'ADMIN';
    avatar?: string;
    exp: number;
  }>(token);

  if (!decoded || decoded.exp * 1000 < Date.now()) {
    return null;
  }

  return {
    id: decoded.sub,
    email: decoded.email,
    name: decoded.name || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim(),
    role: decoded.role,
    avatar: decoded.avatar,
  };
}

/**
 * Check if user is authenticated
 */
export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Verify email with code
 */
export async function verifyEmail(email: string, code: string): Promise<AuthResult> {
  try {
    await api.post('/auth/verify-email', { email, code });
    return { success: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return { success: false, error: axiosError.response?.data?.message || 'Verification failed' };
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<AuthResult> {
  try {
    await api.post('/auth/forgot-password', { email });
    return { success: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return { success: false, error: axiosError.response?.data?.message || 'Request failed' };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  try {
    await api.post('/auth/reset-password', { token, newPassword });
    return { success: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return { success: false, error: axiosError.response?.data?.message || 'Password reset failed' };
  }
}
