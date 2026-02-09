'use client';

import { useState, useCallback, ReactNode } from 'react';
import { Download, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ExportResult } from '@/types/export';

interface ExportButtonProps {
  onExport: () => Promise<ExportResult> | ExportResult;
  label?: string;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable export button with loading and status feedback
 */
export function ExportButton({
  onExport,
  label = 'Export CSV',
  icon,
  variant = 'outline',
  size = 'sm',
  disabled = false,
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [result, setResult] = useState<ExportResult | null>(null);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setResult(null);

    try {
      const exportResult = await onExport();
      setResult(exportResult);

      setTimeout(() => setResult(null), 3000);
    } finally {
      setIsExporting(false);
    }
  }, [onExport]);

  const buttonIcon = isExporting ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : result?.success ? (
    <CheckCircle2 className="h-4 w-4 text-green-500" />
  ) : result?.error ? (
    <AlertCircle className="h-4 w-4 text-destructive" />
  ) : (
    icon ?? <Download className="h-4 w-4" />
  );

  const buttonLabel = isExporting
    ? 'Exporting...'
    : result?.success
      ? result.truncated
        ? `Exported ${result.rowCount} rows (truncated)`
        : `Exported ${result.rowCount} rows`
      : result?.error
        ? 'Export failed'
        : label;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={cn('gap-2', className)}
    >
      {buttonIcon}
      {buttonLabel}
    </Button>
  );
}
