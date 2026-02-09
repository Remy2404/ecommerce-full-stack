'use client';

import { useState, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureToggleProps {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Reusable feature toggle component
 */
export function FeatureToggle({
  id,
  label,
  description,
  enabled,
  onToggle,
  requiresConfirmation = false,
  confirmationMessage,
  disabled = false,
  className,
}: FeatureToggleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingState, setPendingState] = useState<boolean | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleToggle = useCallback(
    async (newValue: boolean) => {
      if (requiresConfirmation) {
        setPendingState(newValue);
        setShowConfirmation(true);
        return;
      }

      setIsLoading(true);
      try {
        await onToggle(newValue);
      } finally {
        setIsLoading(false);
      }
    },
    [onToggle, requiresConfirmation]
  );

  const handleConfirm = useCallback(async () => {
    if (pendingState === null) return;

    setIsLoading(true);
    setShowConfirmation(false);
    try {
      await onToggle(pendingState);
    } finally {
      setIsLoading(false);
      setPendingState(null);
    }
  }, [pendingState, onToggle]);

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between rounded-lg border p-4',
          className
        )}
      >
        <div className="space-y-0.5">
          <Label htmlFor={id} className="text-base font-medium cursor-pointer">
            {label}
          </Label>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Switch
            id={id}
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={disabled || isLoading}
          />
        </div>
      </div>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingState ? 'Enable' : 'Disable'} {label}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationMessage ??
                `Are you sure you want to ${pendingState ? 'enable' : 'disable'} ${label.toLowerCase()}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingState(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
