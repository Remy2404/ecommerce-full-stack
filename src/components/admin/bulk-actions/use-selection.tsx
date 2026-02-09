'use client';

import { useState, useCallback, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { 
  UseSelectionOptions, 
  UseSelectionReturn,
  SelectAllCheckboxProps,
  SelectRowCheckboxProps 
} from '@/types/bulk-actions';

export type { UseSelectionOptions, UseSelectionReturn } from '@/types/bulk-actions';

/**
 * Hook for managing selection state in tables/lists
 */
export function useSelection<T>({
  items,
  idSelector,
}: UseSelectionOptions<T>): UseSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allIds = useMemo(() => items.map(idSelector), [items, idSelector]);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = useMemo(
    () => allIds.length > 0 && allIds.every((id) => selectedIds.has(id)),
    [allIds, selectedIds]
  );

  const isSomeSelected = useMemo(
    () => allIds.some((id) => selectedIds.has(id)) && !isAllSelected,
    [allIds, selectedIds, isAllSelected]
  );

  const selectedCount = useMemo(
    () => allIds.filter((id) => selectedIds.has(id)).length,
    [allIds, selectedIds]
  );

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (allIds.every((id) => prev.has(id))) {
        return new Set();
      }
      return new Set(allIds);
    });
  }, [allIds]);

  const select = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const deselect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds));
  }, [allIds]);

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    isSomeSelected,
    selectedCount,
    toggle,
    toggleAll,
    select,
    deselect,
    clear,
    selectAll,
  };
}

/**
 * Select all checkbox with indeterminate state support
 */
export function SelectAllCheckbox({
  isAllSelected,
  isSomeSelected,
  onToggleAll,
  disabled = false,
}: SelectAllCheckboxProps) {
  const checked = isAllSelected ? true : isSomeSelected ? 'indeterminate' : false;
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={() => onToggleAll()}
      disabled={disabled}
      aria-label="Select all"
    />
  );
}

/**
 * Row selection checkbox
 */
export function SelectRowCheckbox({
  isSelected,
  onToggle,
  disabled = false,
}: SelectRowCheckboxProps) {
  return (
    <Checkbox
      checked={isSelected}
      onCheckedChange={() => onToggle()}
      disabled={disabled}
      aria-label="Select row"
    />
  );
}
