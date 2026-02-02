import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Axios instance configured for Spring Boot backend
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookie-based refresh tokens
});

/**
 * Get access token from cookies or localStorage
 */
export const getAccessToken = (): string | null => {
  // If in browser, prioritize localStorage
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem('accessToken');
    if (localToken) return localToken;
  }

  // Fallback to cookies (works on both client and server via document.cookie or headers)
  try {
    const cookies = typeof document !== 'undefined' 
      ? document.cookie 
      : '';
    
    if (cookies) {
      const match = cookies.match(new RegExp('(^| )accessToken=([^;]+)'));
      if (match) return match[2];
    }
  } catch (error) {
    console.error('Error reading accessToken from cookies:', error);
  }

  return null;
};

/**
 * Store access token in localStorage and cookies
 */
export const setAccessToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
    
    // Also set as cookie for server-side access (expires in 7 days)
    const expires = new Date();
    expires.setTime(expires.getTime() + (7 * 24 * 60 * 60 * 1000));
    document.cookie = `accessToken=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }
};

/**
 * Remove access token from localStorage and cookies
 */
export const removeAccessToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    document.cookie = 'accessToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  if (!token) return false;
  
  try {
    // Decode JWT payload to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/**
 * Decode JWT token to get user info
 */
export const decodeToken = <T = Record<string, unknown>>(token: string): T | null => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as T;
  } catch {
    return null;
  }
};

// Request interceptor: Attach Authorization header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying, attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token using httpOnly cookie
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const data = refreshResponse.data;
        const token = 'token' in data ? data.token : data.accessToken;
        
        if (token) {
          setAccessToken(token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear token and redirect to login
        removeAccessToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
