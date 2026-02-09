'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronDown, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/order';
import {
  ORDER_STATUS_TRANSITIONS,
  isValidStatusTransition,
} from '@/types/order-intelligence';

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  DELIVERING: 'Delivering',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  PAID: 'Paid',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PREPARING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  READY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  DELIVERING: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
};

interface StatusTransitionDropdownProps {
  currentStatus: OrderStatus;
  onTransition: (newStatus: OrderStatus) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

/**
 * Status dropdown with validation logic and locked transitions
 */
export function StatusTransitionDropdown({
  currentStatus,
  onTransition,
  disabled = false,
  className,
}: StatusTransitionDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedTransitions = useMemo(
    () => ORDER_STATUS_TRANSITIONS[currentStatus] ?? [],
    [currentStatus]
  );

  const isLocked = allowedTransitions.length === 0;

  const handleTransition = useCallback(
    async (newStatus: OrderStatus) => {
      const validation = isValidStatusTransition(currentStatus, newStatus);

      if (!validation.isAllowed) {
        setError(validation.reason ?? 'Invalid transition');
        return;
      }

      setIsUpdating(true);
      setError(null);

      try {
        await onTransition(newStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Transition failed');
      } finally {
        setIsUpdating(false);
      }
    },
    [currentStatus, onTransition]
  );

  if (isLocked) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
            STATUS_COLORS[currentStatus]
          )}
        >
          <Lock className="h-3 w-3" />
          {STATUS_LABELS[currentStatus]}
        </span>
        <span className="text-xs text-muted-foreground">Final status</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={disabled || isUpdating}
            className={cn('gap-2', STATUS_COLORS[currentStatus])}
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              STATUS_LABELS[currentStatus]
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {allowedTransitions.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() => handleTransition(status)}
              className="gap-2"
            >
              <span
                className={cn(
                  'inline-block h-2 w-2 rounded-full',
                  STATUS_COLORS[status].split(' ')[0]
                )}
              />
              {STATUS_LABELS[status]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
