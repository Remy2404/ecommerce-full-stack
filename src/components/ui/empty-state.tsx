'use client';

import { Package, FileText, Users, ShoppingCart, Search, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type EmptyStateType = 'default' | 'products' | 'orders' | 'users' | 'search' | 'inbox';

const EMPTY_STATE_ICONS: Record<EmptyStateType, ReactNode> = {
  default: <FileText className="h-12 w-12" />,
  products: <Package className="h-12 w-12" />,
  orders: <ShoppingCart className="h-12 w-12" />,
  users: <Users className="h-12 w-12" />,
  search: <Search className="h-12 w-12" />,
  inbox: <Inbox className="h-12 w-12" />,
};

interface EmptyStateProps {
  type?: EmptyStateType;
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * Reusable empty state component
 */
export function EmptyState({
  type = 'default',
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const displayIcon = icon ?? EMPTY_STATE_ICONS[type];

  return (
    <div
      className={cn(
        'flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center',
        className
      )}
    >
      <div className="text-muted-foreground">{displayIcon}</div>
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
}
