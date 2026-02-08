'use client';

import { Menu, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { useAuth } from '@/hooks/auth-context';
import { isMerchantRole, roleLabel } from '@/lib/roles';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user } = useAuth();
  const workspace = isMerchantRole(user?.role) ? 'Merchant Workspace' : 'Admin Workspace';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden items-center gap-2 rounded-design bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground lg:flex">
            <Sparkles className="h-3.5 w-3.5" />
            {workspace}
          </div>
        </div>

        <div className="w-full flex-1 min-w-0 sm:min-w-[260px]">
          <Input
            placeholder="Search orders, users, promotions..."
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle className="flex" />
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground">{roleLabel(user?.role)}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
