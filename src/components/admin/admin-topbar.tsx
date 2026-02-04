'use client';

import { Menu, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/auth-context';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex items-center gap-4 px-6 py-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex flex-1 items-center gap-3">
          <div className="hidden items-center gap-2 rounded-design bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground lg:flex">
            <Sparkles className="h-3.5 w-3.5" />
            Admin Workspace
          </div>
          <div className="max-w-md flex-1">
            <Input
              placeholder="Search orders, users, promotions..."
              icon={<Search className="h-4 w-4" />}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{user?.name || 'Admin'}</p>
            <p className="text-xs text-muted-foreground">{user?.role || 'ADMIN'}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
