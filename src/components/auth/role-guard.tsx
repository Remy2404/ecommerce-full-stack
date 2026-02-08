'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import type { UserRole } from '@/types/user';
import { hasAnyRole } from '@/lib/roles';
import { useAuth } from '@/hooks/auth-context';
import { ProtectedRoute } from './protected-route';

type RoleGuardProps = {
  allowedRoles: ReadonlyArray<UserRole | 'USER'>;
  fallbackPath?: string;
  children: React.ReactNode;
};

export function RoleGuard({
  allowedRoles,
  fallbackPath = '/',
  children,
}: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const allowed = hasAnyRole(user?.role, allowedRoles);

  useEffect(() => {
    if (!isLoading && user && !allowed) {
      router.replace(fallbackPath);
    }
  }, [allowed, fallbackPath, isLoading, router, user]);

  return (
    <ProtectedRoute>
      {allowed ? (
        children
      ) : (
        <div className="flex h-[60vh] w-full items-center justify-center">
          <div className="rounded-design-lg border border-border bg-muted/40 p-6 text-center">
            <AlertTriangle className="mx-auto h-6 w-6 text-warning" />
            <p className="mt-3 text-sm text-muted-foreground">
              You do not have permission to view this area.
            </p>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
