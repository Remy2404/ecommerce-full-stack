/**
 * Bulk Actions Types
 * Types for multi-select actions on orders and products
 */

import { OrderStatus } from './order';

export type BulkActionType = 
  | 'CONFIRM'
  | 'SHIP'
  | 'DELIVER'
  | 'CANCEL'
  | 'REFUND';

export interface BulkActionConfig {
  type: BulkActionType;
  label: string;
  icon: React.ReactNode;
  description: string;
  confirmTitle: string;
  confirmDescription: string;
  variant: 'default' | 'destructive' | 'outline';
  targetStatus: OrderStatus;
}

export interface BulkActionsToolbarProps {
  selectedCount: number;
  selectedIds: string[];
  onAction: (action: BulkActionType, orderIds: string[]) => Promise<void>;
  onClearSelection: () => void;
  isProcessing?: boolean;
  className?: string;
}

export interface BulkActionDropdownProps {
  selectedCount: number;
  selectedIds: string[];
  onAction: (action: BulkActionType, orderIds: string[]) => Promise<void>;
  isProcessing?: boolean;
  trigger?: React.ReactNode;
}

export interface UseSelectionOptions<T> {
  items: T[];
  idSelector: (item: T) => string;
}

export interface UseSelectionReturn {
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  selectedCount: number;
  toggle: (id: string) => void;
  toggleAll: () => void;
  select: (id: string) => void;
  deselect: (id: string) => void;
  clear: () => void;
  selectAll: () => void;
}

export interface SelectAllCheckboxProps {
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onToggleAll: () => void;
  disabled?: boolean;
}

export interface SelectRowCheckboxProps {
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}
