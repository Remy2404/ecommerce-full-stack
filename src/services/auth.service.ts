import api, { setAccessToken, removeAccessToken, getAccessToken, decodeToken } from './api';
import { AxiosError } from 'axios';
import { 
  AuthUser, 
  User, 
  LoginCredentials as LoginRequest, 
  RegisterData as RegisterRequest,
  UserRole,
  UserApiResponse,
  AuthResponse,
  AuthResult,
  JwtPayload,
  ChangePasswordRequest,
  TwoFactorResponse,
  mapAuthUser,
} from '@/types';

export type { 
  AuthUser, 
  User, 
  LoginRequest, 
  RegisterRequest, 
  UserApiResponse,
  AuthResponse,
  AuthResult,
  JwtPayload,
  ChangePasswordRequest,
  TwoFactorResponse
};
export { mapAuthUser };

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

    const { token, user, tempToken } = response.data;
    
    // If tempToken is present, 2FA is required
    if (tempToken) {
      return { success: true, tempToken };
    }
    
    // Normal login flow
    setAccessToken(token);
    return { success: true, user: mapAuthUser(user), token };
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

    return { success: true, user: mapAuthUser(user), token };
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

    return { success: true, user: mapAuthUser(user), token };
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
    const response = await api.post<AuthResponse>('/auth/refresh');
    const { token } = response.data;
    
    if (token) {
      setAccessToken(token);
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
 * Updated to be async to support cookies() in server actions
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  let token = await getAccessToken();

  // If no token or token expired, try to refresh
  let shouldRefresh = !token;
  
  if (token) {
    const decoded = decodeToken<{ exp: number }>(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      shouldRefresh = true;
    }
  }

  if (shouldRefresh) {
    // Attempt refresh (works if httpOnly cookie is present)
    const refreshed = await refreshToken();
    if (refreshed) {
      token = await getAccessToken();
    } else {
      return null;
    }
  }

  if (!token) return null;

  const decoded = decodeToken<{
    id: string; 
    sub: string; 
    email: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    role?: unknown;
    avatar?: string;
    exp: number;
  }>(token);

  if (!decoded || decoded.exp * 1000 < Date.now()) {
    return null;
  }

  const isUserRole = (value: unknown): value is UserRole => {
    return (
      typeof value === 'string' &&
      (value === 'CUSTOMER' ||
        value === 'ADMIN' ||
        value === 'MERCHANT' ||
        value === 'DELIVERY')
    );
  };

  const role: UserRole = isUserRole(decoded.role) ? decoded.role : 'CUSTOMER';

  return mapAuthUser({
    id: decoded.id || decoded.sub, 
    email: decoded.email || decoded.sub,
    firstName: decoded.firstName || '',
    lastName: decoded.lastName || '',
    name: decoded.name,
    role,
    avatarUrl: decoded.avatar,
    isActive: true,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as UserApiResponse);
}

/**
 * Check if user is authenticated
 */
export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
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

/**
 * Change user password
 */
export async function changePassword(data: ChangePasswordRequest): Promise<AuthResult> {
  try {
    await api.post('/auth/change-password', data);
    return { success: true };
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return { success: false, error: axiosError.response?.data?.message || 'Password change failed' };
  }
}
