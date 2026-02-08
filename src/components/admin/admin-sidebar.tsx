'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Gift,
  LayoutGrid,
  MessageSquareWarning,
  PackageSearch,
  QrCode,
  Tag,
  Truck,
  Users,
  X,
  Boxes,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth-context';
import { isMerchantRole, roleLabel } from '@/lib/roles';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const adminNavItems = [
  { href: '/admin', label: 'Overview', icon: LayoutGrid },
  { href: '/admin/products', label: 'Products', icon: Boxes },
  { href: '/admin/orders', label: 'Orders', icon: PackageSearch },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/promotions', label: 'Promotions', icon: Tag },
  { href: '/admin/payments', label: 'Payments', icon: QrCode },
  { href: '/admin/loyalty', label: 'Loyalty', icon: Gift },
  { href: '/admin/delivery', label: 'Delivery', icon: Truck },
  { href: '/admin/reviews', label: 'Reviews', icon: MessageSquareWarning },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];

const merchantNavItems = [
  { href: '/merchant', label: 'Overview', icon: LayoutGrid },
  { href: '/merchant/orders', label: 'Orders', icon: PackageSearch },
  { href: '/merchant/payments', label: 'Payments', icon: QrCode },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const merchantMode = isMerchantRole(user?.role);
  const navItems = merchantMode ? merchantNavItems : adminNavItems;
  const workspace = merchantMode ? 'Merchant Console' : 'Admin Console';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 border-r border-border bg-background xl:w-72',
          'flex flex-col px-5 py-6 shadow-lg transition-transform duration-300 lg:translate-x-0 lg:shadow-none',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-design-sm bg-primary text-primary-foreground">
              W
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Wing</p>
              <p className="text-base font-semibold">{workspace}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== '/admin' && item.href !== '/merchant' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-design px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-design-lg border border-border bg-muted/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Session</p>
          <p className="mt-2 text-sm font-medium text-foreground">{user?.name || 'Operator'}</p>
          <p className="mt-1 text-xs text-muted-foreground">{roleLabel(user?.role)}</p>
        </div>
      </aside>
    </>
  );
}
