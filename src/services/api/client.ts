import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

/* ------------------------------------------------------------------ */
/* Environment helpers */
/* ------------------------------------------------------------------ */

const isBrowser = () => typeof window !== 'undefined';
const isServer = () => !isBrowser();

/* ------------------------------------------------------------------ */
/* Token utilities */
/* ------------------------------------------------------------------ */

const ACCESS_TOKEN_KEY = 'accessToken';

export const getAccessToken = async (): Promise<string | null> => {
  // Browser: localStorage first
  if (isBrowser()) {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) return token;
  }

  // Server: next/headers cookies
  if (isServer()) {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      return cookieStore.get(ACCESS_TOKEN_KEY)?.value ?? null;
    } catch {
      // cookies() not available (safe to ignore)
    }
  }

  // Browser fallback: document.cookie
  if (isBrowser()) {
    const match = document.cookie.match(
      new RegExp(`(^| )${ACCESS_TOKEN_KEY}=([^;]+)`)
    );
    return match?.[2] ?? null;
  }

  return null;
};

export const setAccessToken = (token: string): void => {
  if (!isBrowser()) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, token);

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  document.cookie = `${ACCESS_TOKEN_KEY}=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const removeAccessToken = (): void => {
  if (!isBrowser()) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

/* ------------------------------------------------------------------ */
/* JWT helpers */
/* ------------------------------------------------------------------ */

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

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) return false;

  const payload = decodeToken(token);
  return !!payload && payload.exp * 1000 > Date.now();
};

/* ------------------------------------------------------------------ */
/* Axios instance */
/* ------------------------------------------------------------------ */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/* ------------------------------------------------------------------ */
/* Request interceptor */
/* ------------------------------------------------------------------ */

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ------------------------------------------------------------------ */
/* Refresh token queue */
/* ------------------------------------------------------------------ */

let isRefreshing = false;
let subscribers: Array<(token: string) => void> = [];

const subscribe = (cb: (token: string) => void) => subscribers.push(cb);

const notifySubscribers = (token: string) => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

/* ------------------------------------------------------------------ */
/* Response interceptor */
/* ------------------------------------------------------------------ */

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribe((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      if (isBrowser()) {
        console.debug('[API] Token expired, attempting refresh...');
      }

      const refreshConfig: { 
        withCredentials: boolean; 
        headers?: { Cookie: string } 
      } = { withCredentials: true };

      // Server-side cookie forwarding
      if (isServer()) {
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = await cookies();
          const refreshToken = cookieStore.get('refreshToken')?.value;
          if (refreshToken) {
            refreshConfig.headers = {
              Cookie: `refreshToken=${refreshToken}`,
            };
          }
        } catch {}
      }

      const res = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        refreshConfig
      );

      const token = res.data.accessToken ?? res.data.token;
      if (!token) throw new Error('No access token returned from refresh');

      if (isBrowser()) {
        console.debug('[API] Token refreshed successfully');
      }

      setAccessToken(token);
      notifySubscribers(token);

      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshError: any) {
      if (isBrowser()) {
        console.error('[API] Refresh token failed:', {
          status: refreshError.response?.status,
          message: refreshError.response?.data?.error || refreshError.message,
          code: refreshError.response?.data?.code
        });
      }

      removeAccessToken();

      if (isBrowser()) {
        const path = window.location.pathname;
        if (!path.startsWith('/login') && !path.startsWith('/register')) {
          window.location.href = '/login?reason=token_expired';
        }
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
