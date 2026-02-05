'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/auth-context';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setAuthorized(false);
      const url = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.push(url);
      return;
    }

    if (user?.role !== 'ADMIN') {
      setAuthorized(false);
      router.push('/');
      return;
    }

    setAuthorized(true);
  }, [isAuthenticated, isLoading, pathname, router, user?.role]);

  if (isLoading || !authorized) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
