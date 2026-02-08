'use client';

import { ProtectedRoute } from './protected-route';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
