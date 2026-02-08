import type { UserRole } from '@/types/user';

type RawRole = string | null | undefined;

const ROLE_ALIASES: Record<string, UserRole> = {
  ADMIN: 'ADMIN',
  MERCHANT: 'MERCHANT',
  DELIVERY: 'DELIVERY',
  CUSTOMER: 'CUSTOMER',
  USER: 'CUSTOMER',
};

export function normalizeUserRole(role: RawRole): UserRole {
  if (!role) return 'CUSTOMER';
  return ROLE_ALIASES[role.toUpperCase()] ?? 'CUSTOMER';
}

export function roleLabel(role: RawRole): 'ADMIN' | 'MERCHANT' | 'DELIVERY' | 'USER' {
  const normalized = normalizeUserRole(role);
  if (normalized === 'CUSTOMER') return 'USER';
  return normalized;
}

export function hasAnyRole(
  currentRole: RawRole,
  allowedRoles: ReadonlyArray<UserRole | 'USER'>
): boolean {
  const normalized = normalizeUserRole(currentRole);
  return allowedRoles.some((allowedRole) => {
    if (allowedRole === 'USER') {
      return normalized === 'CUSTOMER';
    }
    return normalizeUserRole(allowedRole) === normalized;
  });
}

export function isAdminRole(role: RawRole): boolean {
  return normalizeUserRole(role) === 'ADMIN';
}

export function isMerchantRole(role: RawRole): boolean {
  return normalizeUserRole(role) === 'MERCHANT';
}
