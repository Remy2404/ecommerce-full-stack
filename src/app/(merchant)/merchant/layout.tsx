'use client';

import { MerchantGuard } from '@/components/admin/merchant-guard';
import { AdminShell } from '@/components/admin/admin-shell';

export default function MerchantLayout({ children }: { children: React.ReactNode }) {
  return (
    <MerchantGuard>
      <AdminShell>{children}</AdminShell>
    </MerchantGuard>
  );
}
