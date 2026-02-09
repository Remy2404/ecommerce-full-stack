'use client';

import { useState, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Truck,
  Ban,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { 
  BulkActionType, 
  BulkActionConfig,
  BulkActionsToolbarProps,
  BulkActionDropdownProps 
} from '@/types/bulk-actions';

export type { BulkActionType, BulkActionConfig } from '@/types/bulk-actions';

export const BULK_ACTIONS: BulkActionConfig[] = [
  {
    type: 'CONFIRM',
    label: 'Confirm Orders',
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Mark as confirmed',
    confirmTitle: 'Confirm Selected Orders',
    confirmDescription: 'Are you sure you want to confirm the selected orders? This will notify the customers.',
    variant: 'default',
    targetStatus: 'CONFIRMED',
  },
  {
    type: 'SHIP',
    label: 'Mark as Shipped',
    icon: <Truck className="h-4 w-4" />,
    description: 'Update to shipping',
    confirmTitle: 'Ship Selected Orders',
    confirmDescription: 'Are you sure you want to mark the selected orders as shipped? This will notify the customers.',
    variant: 'default',
    targetStatus: 'DELIVERING',
  },
  {
    type: 'DELIVER',
    label: 'Mark as Delivered',
    icon: <CheckCircle2 className="h-4 w-4" />,
    description: 'Update to delivered',
    confirmTitle: 'Deliver Selected Orders',
    confirmDescription: 'Are you sure you want to mark the selected orders as delivered?',
    variant: 'default',
    targetStatus: 'DELIVERED',
  },
  {
    type: 'CANCEL',
    label: 'Cancel Orders',
    icon: <Ban className="h-4 w-4" />,
    description: 'Cancel selected orders',
    confirmTitle: 'Cancel Selected Orders',
    confirmDescription: 'Are you sure you want to cancel the selected orders? This action cannot be undone.',
    variant: 'destructive',
    targetStatus: 'CANCELLED',
  },
];

/**
 * Bulk actions toolbar for order management
 */
export function BulkActionsToolbar({
  selectedCount,
  selectedIds,
  onAction,
  onClearSelection,
  isProcessing = false,
  className,
}: BulkActionsToolbarProps) {
  const [confirmDialog, setConfirmDialog] = useState<BulkActionConfig | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleActionClick = useCallback((action: BulkActionConfig) => {
    setConfirmDialog(action);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmDialog) return;
    setIsExecuting(true);
    try {
      await onAction(confirmDialog.type, selectedIds);
      setConfirmDialog(null);
      onClearSelection();
    } finally {
      setIsExecuting(false);
    }
  }, [confirmDialog, selectedIds, onAction, onClearSelection]);

  const handleCancel = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm',
          'animate-in slide-in-from-bottom-2 duration-200',
          className
        )}
      >
        <Badge variant="secondary" className="gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {selectedCount} selected
        </Badge>

        <div className="flex items-center gap-2">
          {BULK_ACTIONS.map((action) => (
            <Button
              key={action.type}
              variant={action.variant}
              size="sm"
              onClick={() => handleActionClick(action)}
              disabled={isProcessing || isExecuting}
              className="gap-1.5"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          disabled={isProcessing || isExecuting}
        >
          <XCircle className="mr-1.5 h-4 w-4" />
          Clear
        </Button>
      </div>

      <Dialog open={!!confirmDialog} onOpenChange={() => handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog?.variant === 'destructive' && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {confirmDialog?.confirmTitle}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.confirmDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will affect <strong>{selectedCount}</strong> order(s).
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isExecuting}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog?.variant}
              onClick={handleConfirm}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {confirmDialog?.icon}
                  <span className="ml-1.5">Confirm</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Compact dropdown menu for bulk actions
 */
export function BulkActionDropdown({
  selectedCount,
  selectedIds,
  onAction,
  isProcessing = false,
  trigger,
}: BulkActionDropdownProps) {
  const [confirmDialog, setConfirmDialog] = useState<BulkActionConfig | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleActionClick = useCallback((action: BulkActionConfig) => {
    setConfirmDialog(action);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmDialog) return;
    setIsExecuting(true);
    try {
      await onAction(confirmDialog.type, selectedIds);
      setConfirmDialog(null);
    } finally {
      setIsExecuting(false);
    }
  }, [confirmDialog, selectedIds, onAction]);

  const handleCancel = useCallback(() => {
    setConfirmDialog(null);
  }, []);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={selectedCount === 0 || isProcessing}>
          {trigger ?? (
            <Button variant="outline" size="sm" disabled={selectedCount === 0}>
              Bulk Actions
              <Badge variant="secondary" className="ml-2">
                {selectedCount}
              </Badge>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {BULK_ACTIONS.map((action) => (
            <DropdownMenuItem
              key={action.type}
              onClick={() => handleActionClick(action)}
              className={cn(
                'gap-2',
                action.variant === 'destructive' && 'text-destructive focus:text-destructive'
              )}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!confirmDialog} onOpenChange={() => handleCancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog?.variant === 'destructive' && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {confirmDialog?.confirmTitle}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog?.confirmDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This action will affect <strong>{selectedCount}</strong> order(s).
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isExecuting}
            >
              Cancel
            </Button>
            <Button
              variant={confirmDialog?.variant}
              onClick={handleConfirm}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {confirmDialog?.icon}
                  <span className="ml-1.5">Confirm</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
