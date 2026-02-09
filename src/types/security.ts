/**
 * Security-related type definitions
 */

export interface UserSecurityInfo {
  userId: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  twofaEnabled: boolean;
  activeSessions?: number;
  failedLoginAttempts?: number;
}

export interface SecurityAction {
  type: 'force_logout' | 'reset_2fa' | 'lock_account' | 'unlock_account';
  targetUserId: string;
  reason?: string;
}

export interface SecurityActionResult {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface SecurityDialogConfig {
  title: string;
  description: string;
  warningLevel: 'info' | 'warning' | 'danger';
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}
