'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/use-online-status';

interface OfflineIndicatorProps {
  className?: string;
  position?: 'top' | 'bottom';
}

/**
 * Offline detection and fallback UI
 */
export function OfflineIndicator({
  className,
  position = 'top',
}: OfflineIndicatorProps) {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-amber-950',
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
    >
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">
        You are currently offline. Some features may not be available.
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.reload()}
        className="gap-1 text-amber-950 hover:bg-amber-600 hover:text-amber-950"
      >
        <RefreshCw className="h-3 w-3" />
        Refresh
      </Button>
    </div>
  );
}
