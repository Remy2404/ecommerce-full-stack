/**
 * Audit Log Types
 * Types for admin audit logging and activity tracking
 */

export type AuditLogAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'STATUS_CHANGE' 
  | 'PAYMENT' 
  | 'LOGIN' 
  | 'LOGOUT'
  | 'EXPORT'
  | 'BULK_ACTION';

export type AuditLogEntity = 
  | 'ORDER' 
  | 'PRODUCT' 
  | 'USER' 
  | 'CATEGORY' 
  | 'PAYMENT' 
  | 'SYSTEM';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: AuditLogAction;
  entity: AuditLogEntity;
  entityId?: string;
  userId: string;
  userName?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export interface AuditLogViewerProps {
  entries: AuditLogEntry[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
  className?: string;
  maxHeight?: string;
}
