'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
