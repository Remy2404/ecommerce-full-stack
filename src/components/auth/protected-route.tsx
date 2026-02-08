'use client';

import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth-context';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, requiresTwoFactor } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requiresTwoFactor && !pathname.startsWith('/2fa')) {
      router.replace('/2fa');
      return;
    }

    if (!isAuthenticated && !pathname.startsWith('/2fa')) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, pathname, requiresTwoFactor, router]);

  if (isLoading || (!isAuthenticated && !pathname.startsWith('/2fa')) || (requiresTwoFactor && !pathname.startsWith('/2fa'))) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
