'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { RefreshCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { StatWidgetProps } from '@/types/admin-widgets';

export type { StatWidgetProps } from '@/types/admin-widgets';

/**
 * Reusable stat widget with auto-refresh capability
 */
export function StatWidget({
  title,
  value,
  previousValue,
  currentValue,
  icon,
  description,
  isLoading = false,
  isError = false,
  errorMessage = 'Failed to load',
  onRetry,
  autoRefresh = false,
  refreshIntervalMs = 30000,
  onRefresh,
  className,
  trend,
  trendLabel,
}: StatWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculatedTrend = trend ?? calculateTrend(previousValue, currentValue);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, isRefreshing]);

  useEffect(() => {
    if (autoRefresh && onRefresh && refreshIntervalMs > 0) {
      intervalRef.current = setInterval(handleRefresh, refreshIntervalMs);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, onRefresh, refreshIntervalMs, handleRefresh]);

  const TrendIcon = calculatedTrend === 'up' 
    ? TrendingUp 
    : calculatedTrend === 'down' 
      ? TrendingDown 
      : Minus;

  const trendColorClass = calculatedTrend === 'up'
    ? 'text-emerald-500'
    : calculatedTrend === 'down'
      ? 'text-red-500'
      : 'text-muted-foreground';

  if (isLoading) {
    return <StatWidgetSkeleton className={className} />;
  }

  if (isError) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <p className="text-sm text-destructive">{errorMessage}</p>
            {onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry} className="mt-2">
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
            </Button>
          )}
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="mt-2 flex items-center gap-2">
          {calculatedTrend && (
            <div className={cn('flex items-center gap-1', trendColorClass)}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trendLabel && <span className="text-xs">{trendLabel}</span>}
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatWidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-3 w-40" />
      </CardContent>
    </Card>
  );
}

function calculateTrend(
  previous?: number,
  current?: number
): 'up' | 'down' | 'neutral' | undefined {
  if (previous === undefined || current === undefined) return undefined;
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
}

export { StatWidgetSkeleton };
