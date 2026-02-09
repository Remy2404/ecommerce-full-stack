/**
 * Archive-related type definitions
 */

export type ArchiveStatus = 'active' | 'archived';

export interface ArchivableItem {
  id: string;
  isArchived?: boolean;
  archivedAt?: string;
  archivedBy?: string;
}

export interface ArchiveTabConfig {
  activeLabel?: string;
  archivedLabel?: string;
  activeCount?: number;
  archivedCount?: number;
}

export interface RestoreAction {
  itemId: string;
  itemType: string;
  onRestore: (id: string) => Promise<void>;
}

export interface DeleteConfirmConfig {
  itemName: string;
  itemType: string;
  isSoftDelete?: boolean;
  warningMessage?: string;
  onConfirm: () => Promise<void>;
}
