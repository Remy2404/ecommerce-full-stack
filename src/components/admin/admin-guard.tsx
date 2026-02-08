'use client';

import { RoleGuard } from '@/components/auth/role-guard';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['ADMIN']}>{children}</RoleGuard>;
}
