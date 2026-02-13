import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import {
  clearAuthSessionHint,
  hasAuthSessionHint,
  markAuthSessionHint,
} from '../auth-session-hint';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

const PUBLIC_PATH_PREFIXES = [
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/2fa',
];

const PROTECTED_PATH_PREFIXES = [
  '/profile',
  '/settings',
  '/orders',
  '/checkout',
  '/admin',
  '/merchant',
];

type AccessTokenListener = (token: string | null) => void;
let accessTokenMemory: string | null = null;
const accessTokenListeners = new Set<AccessTokenListener>();
let authBootstrapPromise: Promise<void> | null = null;

const isBrowser = typeof window !== 'undefined';

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const notifyAccessTokenListeners = (): void => {
  accessTokenListeners.forEach((listener) => listener(accessTokenMemory));
};

export const getAccessToken = (): string | null => accessTokenMemory;

export const setAccessToken = (token: string): void => {
  accessTokenMemory = token;
  notifyAccessTokenListeners();
};

export const removeAccessToken = (): void => {
  accessTokenMemory = null;
  notifyAccessTokenListeners();
};

export const subscribeAccessToken = (
  listener: AccessTokenListener
): (() => void) => {
  accessTokenListeners.add(listener);
  return () => accessTokenListeners.delete(listener);
};

export const setAuthBootstrapPromise = (promise: Promise<void> | null): void => {
  authBootstrapPromise = promise;
};

type JwtPayload = {
  exp: number;
  [key: string]: unknown;
};

export const decodeToken = <T = JwtPayload>(token: string): T | null => {
  try {
    return JSON.parse(atob(token.split('.')[1])) as T;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string, skewMs = 5_000): boolean => {
  const payload = decodeToken<JwtPayload>(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + skewMs;
};

export const hasValidAccessToken = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  return !isTokenExpired(token);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  if (authBootstrapPromise && !shouldSkipRefresh(config.url)) {
    await authBootstrapPromise.catch(() => undefined);
  }

  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeRefresh = (cb: (token: string) => void): void => {
  refreshSubscribers.push(cb);
};

const publishRefresh = (token: string): void => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const redirectToLoginIfProtectedPath = (): void => {
  if (!isBrowser) return;
  const pathname = window.location.pathname;
  if (isProtectedPath(pathname) && !isPublicPath(pathname)) {
    window.location.href = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
  }
};

const clearRefreshTokenBestEffort = (): void => {
  if (!isBrowser) return;
  // Best effort client-side cleanup; server-side /auth/refresh failure path already clears HttpOnly cookie.
  document.cookie = 'refreshToken=; Max-Age=0; path=/api; SameSite=Lax';
  document.cookie = 'refreshToken=; Max-Age=0; path=/; SameSite=Lax';
  clearAuthSessionHint();
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

const shouldSkipRefresh = (requestUrl?: string): boolean => {
  if (!requestUrl) return false;
  return (
    requestUrl.includes('/auth/login') ||
    requestUrl.includes('/auth/register') ||
    requestUrl.includes('/auth/refresh') ||
    requestUrl.includes('/auth/verify-2fa') ||
    requestUrl.includes('/auth/verify-email') ||
    requestUrl.includes('/auth/forgot-password') ||
    requestUrl.includes('/auth/reset-password') ||
    requestUrl.includes('/auth/resend-verification')
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (!isBrowser) {
      return Promise.reject(error);
    }

    if (!hasAuthSessionHint()) {
      removeAccessToken();
      clearRefreshTokenBestEffort();
      redirectToLoginIfProtectedPath();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post<{ token?: string; accessToken?: string }>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const refreshedToken = refreshResponse.data.token ?? refreshResponse.data.accessToken;
      if (!refreshedToken) {
        throw new Error('Refresh endpoint returned no access token');
      }

      setAccessToken(refreshedToken);
      markAuthSessionHint();
      publishRefresh(refreshedToken);

      originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      removeAccessToken();
      clearRefreshTokenBestEffort();
      redirectToLoginTerminal();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
