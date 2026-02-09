'use client';

import { useState, useCallback } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
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

interface DeleteConfirmDialogProps {
  itemName: string;
  itemType: string;
  isSoftDelete?: boolean;
  warningMessage?: string;
  onConfirm: () => Promise<void>;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  triggerLabel?: string;
}

/**
 * Confirmation dialog with soft-delete warning
 */
export function DeleteConfirmDialog({
  itemName,
  itemType,
  isSoftDelete = true,
  warningMessage,
  onConfirm,
  disabled = false,
  variant = 'destructive',
  size = 'sm',
  className,
  triggerLabel = 'Delete',
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleConfirm = useCallback(async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }, [onConfirm]);

  const defaultWarning = isSoftDelete
    ? `This ${itemType.toLowerCase()} will be archived and can be restored later.`
    : `This action cannot be undone. The ${itemType.toLowerCase()} will be permanently deleted.`;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || isDeleting}
          className={cn('gap-2', className)}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {!isSoftDelete && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            {isSoftDelete ? 'Archive' : 'Delete'} {itemType}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Are you sure you want to {isSoftDelete ? 'archive' : 'delete'}{' '}
              &quot;{itemName}&quot;?
            </span>
            <span className="block text-sm text-muted-foreground">
              {warningMessage ?? defaultWarning}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className={cn(!isSoftDelete && 'bg-destructive hover:bg-destructive/90')}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSoftDelete ? 'Archiving...' : 'Deleting...'}
              </>
            ) : isSoftDelete ? (
              'Archive'
            ) : (
              'Delete Permanently'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
