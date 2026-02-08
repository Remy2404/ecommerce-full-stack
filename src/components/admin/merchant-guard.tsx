'use client';

import { RoleGuard } from '@/components/auth/role-guard';

export function MerchantGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['MERCHANT']}>{children}</RoleGuard>;
}
