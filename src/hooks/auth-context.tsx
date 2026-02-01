'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser, isLoggedIn, logout as logoutService, type UserSummary } from '@/services';

interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: UserSummary) => void;
  logout: () => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    // Listen for storage events (login/logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        refresh();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refresh]);

  const login = useCallback((userData: UserSummary) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
    // Redirect to login page
    window.location.href = '/login';
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
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
