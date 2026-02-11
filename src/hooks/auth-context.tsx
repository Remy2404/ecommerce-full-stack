'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  bootstrapRefreshOnce,
  clearPendingTwoFactorToken,
  getCurrentUser,
  getPendingTwoFactorToken,
  logout as logoutRequest,
  setPendingTwoFactorToken,
} from '@/services/auth.service';
import { getUserProfile } from '@/services/user.service';
import { type AuthUser, type User } from '@/types/user';
import { usePathname, useRouter } from 'next/navigation';
import { getAccessToken, setAuthBootstrapPromise, subscribeAccessToken } from '@/services/api';

interface AuthContextType {
  user: AuthUser | null;
  profile: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresTwoFactor: boolean;
  pendingTwoFactorToken: string | null;
  login: (authUser: AuthUser) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setPendingTwoFactor: (tempToken: string) => void;
  clearPendingTwoFactor: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isPublicRoute = (pathname: string | null): boolean => {
  if (!pathname) return true;
  return (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/verify-email') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/2fa')
  );
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingTwoFactorToken, setPendingTwoFactorTokenState] = useState<string | null>(null);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);
  const refreshInFlightRef = React.useRef<Promise<void> | null>(null);
  const bootstrapStartedRef = React.useRef(false);

  const setPendingTwoFactor = useCallback((tempToken: string) => {
    setPendingTwoFactorToken(tempToken);
    setPendingTwoFactorTokenState(tempToken);
    setUser(null);
    setProfile(null);
  }, []);

  const clearPendingTwoFactor = useCallback(() => {
    clearPendingTwoFactorToken();
    setPendingTwoFactorTokenState(null);
  }, []);

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return refreshInFlightRef.current;
    }

    const task = (async () => {
      const pendingToken = getPendingTwoFactorToken();
      setPendingTwoFactorTokenState(pendingToken);

      if (pendingToken && !getAccessToken()) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setUser(currentUser);
      setIsLoading(false);

      try {
        const userProfile = await getUserProfile();
        setProfile(userProfile);
        setUser(userProfile);
        clearPendingTwoFactor();
      } catch {
        // Profile endpoint is best-effort. Keep decoded token identity for session continuity.
      }
    })();

    refreshInFlightRef.current = task;

    try {
      await task;
    } finally {
      refreshInFlightRef.current = null;
    }
  }, [clearPendingTwoFactor]);

  useEffect(() => {
    if (!hasBootstrapped) {
      return;
    }

    if (isPublicRoute(pathname)) {
      setIsLoading(false);
      if (!pathname?.startsWith('/2fa')) {
        clearPendingTwoFactor();
      }
      return;
    }

    void refresh();
  }, [hasBootstrapped, pathname, refresh, clearPendingTwoFactor]);

  useEffect(() => {
    if (bootstrapStartedRef.current) {
      return;
    }

    bootstrapStartedRef.current = true;
    const bootstrapTask = bootstrapRefreshOnce().then(() => undefined);

    setAuthBootstrapPromise(bootstrapTask);
    void bootstrapTask.finally(() => {
      setAuthBootstrapPromise(null);
      setHasBootstrapped(true);
    });
  }, [refresh]);

  useEffect(() => {
    return subscribeAccessToken(() => {
      void refresh();
    });
  }, [refresh]);

  const login = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    setProfile(null);
    clearPendingTwoFactor();
    setIsLoading(false);
  }, [clearPendingTwoFactor]);

  const logout = useCallback(async () => {
    await logoutRequest();
    clearPendingTwoFactor();
    setUser(null);
    setProfile(null);
    router.push('/login');
  }, [clearPendingTwoFactor, router]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      isAuthenticated: Boolean(user),
      isLoading,
      requiresTwoFactor: Boolean(pendingTwoFactorToken && !user),
      pendingTwoFactorToken,
      login,
      logout,
      refresh,
      setPendingTwoFactor,
      clearPendingTwoFactor,
    }),
    [
      clearPendingTwoFactor,
      isLoading,
      login,
      logout,
      pendingTwoFactorToken,
      refresh,
      setPendingTwoFactor,
      user,
      profile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
