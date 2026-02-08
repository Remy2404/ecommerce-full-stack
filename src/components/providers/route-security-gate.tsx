'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth-context';

const PROTECTED_PREFIXES = [
  '/profile',
  '/settings',
  '/orders',
  '/checkout',
  '/wishlist',
  '/admin',
  '/merchant',
];

const PUBLIC_PREFIXES = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password', '/2fa'];

const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

export function RouteSecurityGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, requiresTwoFactor } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!pathname) return;
    if (isPublicPath(pathname)) return;
    if (!isProtectedPath(pathname)) return;

    if (requiresTwoFactor) {
      router.replace('/2fa');
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, requiresTwoFactor, router]);

  return <>{children}</>;
}
