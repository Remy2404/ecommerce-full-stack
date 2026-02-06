'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/auth-context';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      const url = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.push(url);
      return;
    }

    if (user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router, user?.role]);

  const authorized = !isLoading && isAuthenticated && user?.role === 'ADMIN';

  if (isLoading || !authorized) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
