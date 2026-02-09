'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface DangerZoneProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Danger zone styling wrapper for destructive actions
 */
export function DangerZone({
  title = 'Danger Zone',
  description,
  children,
  className,
}: DangerZoneProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 border-destructive/50 bg-destructive/5 p-4',
        className
      )}
    >
      <div className="mb-4">
        <h3 className="flex items-center gap-2 font-semibold text-destructive">
          <AlertTriangle className="h-4 w-4" />
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
