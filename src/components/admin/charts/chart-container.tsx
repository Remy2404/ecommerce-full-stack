'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCcw, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  className?: string;
  height?: number;
  children: ReactNode;
}

/**
 * ChartContainer provides consistent wrapper for all chart components
 * with built-in loading, error, and empty states
 */
export function ChartContainer({
  title,
  description,
  isLoading = false,
  isError = false,
  isEmpty = false,
  errorMessage = 'Failed to load chart data',
  emptyMessage = 'No data available',
  onRetry,
  className,
  height = 300,
  children,
}: ChartContainerProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription className="text-sm text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div
          className="w-full flex items-center justify-center"
          style={{ minHeight: height }}
        >
          {isLoading && <ChartSkeleton height={height} />}
          {isError && !isLoading && (
            <ChartError message={errorMessage} onRetry={onRetry} />
          )}
          {isEmpty && !isLoading && !isError && (
            <ChartEmpty message={emptyMessage} />
          )}
          {!isLoading && !isError && !isEmpty && (
            <div className="w-full h-full">{children}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface ChartSkeletonProps {
  height: number;
}

function ChartSkeleton({ height }: ChartSkeletonProps) {
  return (
    <div className="w-full space-y-3" style={{ height }}>
      <div className="flex items-end justify-between h-[80%] gap-2 px-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{
              height: `${30 + Math.random() * 60}%`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>
      <div className="flex justify-between px-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

interface ChartErrorProps {
  message: string;
  onRetry?: () => void;
}

function ChartError({ message, onRetry }: ChartErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-destructive">
      <AlertCircle className="h-10 w-10 opacity-60" />
      <p className="text-sm font-medium">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCcw className="h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  );
}

interface ChartEmptyProps {
  message: string;
}

function ChartEmpty({ message }: ChartEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
      <BarChart3 className="h-10 w-10 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

export { ChartSkeleton, ChartError, ChartEmpty };
