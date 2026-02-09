'use client';

import { useState, useCallback } from 'react';
import { Loader2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { SecurityDialogConfig } from '@/types/security';

interface SecurityActionDialogProps extends SecurityDialogConfig {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WARNING_ICONS = {
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  danger: <AlertCircle className="h-5 w-5 text-destructive" />,
};

const WARNING_BUTTON_STYLES = {
  info: 'bg-blue-600 hover:bg-blue-700',
  warning: 'bg-amber-600 hover:bg-amber-700',
  danger: 'bg-destructive hover:bg-destructive/90',
};

/**
 * Reusable security confirmation dialog
 */
export function SecurityActionDialog({
  open,
  onOpenChange,
  title,
  description,
  warningLevel,
  confirmLabel,
  onConfirm,
}: SecurityActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  }, [onConfirm, onOpenChange]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {WARNING_ICONS[warningLevel]}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(WARNING_BUTTON_STYLES[warningLevel])}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
