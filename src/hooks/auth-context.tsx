'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser, logout, type AuthUser } from '@/services';
import { getUserProfile } from '@/services/user.service';
import { mapUser, type User } from '@/types/user';
import { usePathname } from 'next/navigation';

interface AuthContextType {
  user: AuthUser | null;
  profile: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshInFlightRef = React.useRef<Promise<void> | null>(null);
  const isPublicAuthRoute =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/verify-email') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/reset-password');

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const task = (async () => {
      // Fast path: decode local token/refresh cookie first so UI can render quickly.
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setProfile(null);
      setIsLoading(false);

      // Slow path: hydrate full profile in the background.
      if (!currentUser) {
        return;
      }

      try {
        const profile = await getUserProfile();
        setUser(mapUser(profile));
        setProfile(profile);
      } catch (error) {
        console.error('Failed to refresh user profile:', error);
      }
    })();

    refreshInFlightRef.current = task;
    try {
      await task;
    } finally {
      refreshInFlightRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPublicAuthRoute) {
      setIsLoading(false);
      setUser(null);
      setProfile(null);
      return;
    }

    // Initialize auth state from local storage on mount
    refresh();

    // Listen for storage events (login/logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refresh, isPublicAuthRoute]);

  const login = useCallback((userData: AuthUser) => {
    setUser(userData);
    setProfile(null);
  }, []);

  const logoutHander = useCallback(async () => {
    await logout();
    setUser(null);
    setProfile(null);
    // Redirect to login page
    window.location.href = '/login';
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout: logoutHander,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const callbackUrl = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?callbackUrl=${callbackUrl}`;
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}
