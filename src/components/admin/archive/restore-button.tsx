'use client';

import { useState, useCallback } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface RestoreButtonProps {
  itemName: string;
  itemType: string;
  onRestore: () => Promise<void>;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Button with confirmation dialog for restoring archived items
 */
export function RestoreButton({
  itemName,
  itemType,
  onRestore,
  disabled = false,
  variant = 'outline',
  size = 'sm',
  className,
}: RestoreButtonProps) {
  const [isRestoring, setIsRestoring] = useState(false);
  const [open, setOpen] = useState(false);

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    try {
      await onRestore();
      setOpen(false);
    } finally {
      setIsRestoring(false);
    }
  }, [onRestore]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isRestoring}
          className={cn('gap-2', className)}
        >
          {isRestoring ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4" />
          )}
          Restore
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore {itemType}</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to restore &quot;{itemName}&quot;? This will
            move the {itemType.toLowerCase()} back to active status.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
            {isRestoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Restoring...
              </>
            ) : (
              'Restore'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
