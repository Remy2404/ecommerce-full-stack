import { AxiosError } from 'axios';
import api, {
  decodeToken,
  getAccessToken,
  hasValidAccessToken,
  removeAccessToken,
  setAccessToken,
} from './api';
import { getErrorMessage } from '@/lib/http-error';
import { normalizeUserRole } from '@/lib/roles';
import type {
  AuthResult,
  AuthUser,
  ChangePasswordRequest,
  JwtPayload,
  LoginRequest,
  RegisterRequest,
} from '@/types';

type AuthResponse = {
  token?: string;
  tempToken?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    avatar?: string;
  };
};

type MessageResponse = {
  success: boolean;
  message: string;
};

const TEMP_2FA_KEY = '2fa_temp_token';
let bootstrapRefreshAttempted = false;
let bootstrapRefreshInFlight: Promise<boolean> | null = null;

const isBrowser = typeof window !== 'undefined';

const clearRefreshTokenBestEffort = (): void => {
  if (!isBrowser) return;
  // Best effort client-side cleanup; backend refresh-failure path expires HttpOnly cookie.
  document.cookie = 'refreshToken=; Max-Age=0; path=/api; SameSite=Lax';
  document.cookie = 'refreshToken=; Max-Age=0; path=/; SameSite=Lax';
};

const redirectToLoginTerminal = (): void => {
  if (!isBrowser) return;
  const pathname = window.location.pathname;
  if (process.env.NODE_ENV === 'test') return;
  const isPublicAuth =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/2fa');
  if (!isPublicAuth) {
    const search = window.location.search || '';
    const callback = `${pathname}${search}`;
    window.location.href = `/login?callbackUrl=${encodeURIComponent(callback)}`;
  }
};

const mapAuthSummary = (user?: AuthResponse['user']): AuthUser | undefined => {
  if (!user?.id || !user.email) return undefined;
  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email,
    role: normalizeUserRole(user.role),
    avatarUrl: user.avatar,
    emailVerified: true,
    twofaEnabled: false,
  };
};

export const setPendingTwoFactorToken = (tempToken: string): void => {
  if (!isBrowser) return;
  sessionStorage.setItem(TEMP_2FA_KEY, tempToken);
};

export const getPendingTwoFactorToken = (): string | null => {
  if (!isBrowser) return null;
  return sessionStorage.getItem(TEMP_2FA_KEY);
};

export const clearPendingTwoFactorToken = (): void => {
  if (!isBrowser) return;
  sessionStorage.removeItem(TEMP_2FA_KEY);
};

export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/auth/login', { email, password } satisfies LoginRequest);
    const { token, tempToken, user } = response.data;

    if (tempToken) {
      setPendingTwoFactorToken(tempToken);
      return { success: true, tempToken };
    }

    if (!token) {
      return { success: false, error: 'Access token is missing from response' };
    }

    setAccessToken(token);
    clearPendingTwoFactorToken();
    return { success: true, token, user: mapAuthSummary(user) };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Invalid email or password'),
    };
  }
}

export async function completeTwoFactorLogin(
  tempToken: string,
  otp: string
): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/auth/verify-2fa', { tempToken, otp });
    const { token, user } = response.data;

    if (!token) {
      return { success: false, error: 'Access token is missing from response' };
    }

    setAccessToken(token);
    clearPendingTwoFactorToken();
    return { success: true, token, user: mapAuthSummary(user) };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Two-factor verification failed'),
    };
  }
}

export async function register(data: RegisterRequest): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return { success: true, user: mapAuthSummary(response.data.user) };
  } catch (error) {
    const axiosError = error as AxiosError<{ errors?: Record<string, string> }>;
    const validationErrors = axiosError.response?.data?.errors;
    const firstValidationError = validationErrors ? Object.values(validationErrors)[0] : undefined;

    return {
      success: false,
      error: firstValidationError || getErrorMessage(error, 'Registration failed'),
    };
  }
}

export async function loginWithGoogle(idToken: string): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/auth/google/login', { idToken });
    const { token, user } = response.data;

    if (!token) {
      return { success: false, error: 'Access token is missing from response' };
    }

    setAccessToken(token);
    clearPendingTwoFactorToken();
    return { success: true, token, user: mapAuthSummary(user) };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Google authentication failed'),
    };
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch {
    // Best effort: always clear client auth state.
  } finally {
    removeAccessToken();
    clearPendingTwoFactorToken();
  }
}

export async function refreshToken(): Promise<boolean> {
  try {
    const response = await api.post<AuthResponse>('/auth/refresh');
    const token = response.data.token;
    if (!token) {
      removeAccessToken();
      clearPendingTwoFactorToken();
      clearRefreshTokenBestEffort();
      return false;
    }
    setAccessToken(token);
    return true;
  } catch {
    removeAccessToken();
    clearPendingTwoFactorToken();
    clearRefreshTokenBestEffort();
    return false;
  }
}

export async function bootstrapRefreshOnce(): Promise<boolean> {
  if (bootstrapRefreshAttempted) {
    return hasValidAccessToken();
  }

  if (bootstrapRefreshInFlight) {
    return bootstrapRefreshInFlight;
  }

  bootstrapRefreshInFlight = (async () => {
    bootstrapRefreshAttempted = true;
    return refreshToken();
  })();

  try {
    return await bootstrapRefreshInFlight;
  } finally {
    bootstrapRefreshInFlight = null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getAccessToken();

  if (!token && !(await bootstrapRefreshOnce())) {
    return null;
  }

  const activeToken = getAccessToken();
  if (!activeToken || !hasValidAccessToken()) {
    removeAccessToken();
    return null;
  }

  const decoded = decodeToken<JwtPayload & { avatar?: string }>(activeToken);
  if (!decoded?.sub) return null;

  const id = typeof decoded.id === 'string' ? decoded.id : decoded.sub;
  const email = decoded.email || decoded.sub;
  const roleRaw =
    typeof decoded.role === 'string'
      ? decoded.role
      : Array.isArray(decoded.role)
        ? decoded.role[0]
        : 'CUSTOMER';

  return {
    id,
    email,
    name: decoded.name || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim() || email,
    role: normalizeUserRole(roleRaw),
    avatarUrl: typeof decoded.avatar === 'string' ? decoded.avatar : undefined,
    emailVerified: true,
    twofaEnabled: false,
  };
}

export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return Boolean(user);
}

export async function verifyEmail(token: string): Promise<AuthResult> {
  try {
    await api.post<MessageResponse>('/auth/verify-email', { token });
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Verification failed') };
  }
}

export async function verifyEmailAndAutoLogin(token: string): Promise<AuthResult> {
  try {
    const response = await api.post<AuthResponse>('/auth/verify-email/auto-login', { token });
    if (!response.data.token) {
      return { success: true };
    }

    setAccessToken(response.data.token);
    clearPendingTwoFactorToken();
    return {
      success: true,
      token: response.data.token,
      user: mapAuthSummary(response.data.user),
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Email verification failed'),
    };
  }
}

export async function resendVerificationByToken(token: string): Promise<AuthResult> {
  try {
    await api.post<MessageResponse>('/auth/resend-verification/by-token', { token });
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Failed to resend verification email') };
  }
}

export async function forgotPassword(email: string): Promise<AuthResult> {
  try {
    await api.post<MessageResponse>('/auth/forgot-password', { email });
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Request failed') };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  try {
    await api.post<MessageResponse>('/auth/reset-password', { token, newPassword });
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Password reset failed') };
  }
}

export async function changePassword(data: ChangePasswordRequest): Promise<AuthResult> {
  try {
    await api.post<MessageResponse>('/auth/change-password', data);
    removeAccessToken();
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Password change failed') };
  }
}
