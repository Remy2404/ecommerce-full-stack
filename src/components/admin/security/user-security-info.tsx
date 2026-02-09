'use client';

import {
  Clock,
  Globe,
  Monitor,
  Shield,
  ShieldCheck,
  ShieldX,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserSecurityInfo } from '@/types/security';

interface UserSecurityInfoCardProps {
  securityInfo: UserSecurityInfo;
  className?: string;
}

/**
 * Display last login and security metadata
 */
export function UserSecurityInfoCard({
  securityInfo,
  className,
}: UserSecurityInfoCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-4', className)}>
      <h3 className="flex items-center gap-2 font-medium text-sm">
        <Shield className="h-4 w-4" />
        Security Information
      </h3>

      <div className="grid gap-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last Login
          </span>
          <span className="font-medium">
            {formatDate(securityInfo.lastLoginAt)}
          </span>
        </div>

        {securityInfo.lastLoginIp && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              IP Address
            </span>
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {securityInfo.lastLoginIp}
            </span>
          </div>
        )}

        {securityInfo.lastLoginDevice && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Monitor className="h-4 w-4" />
              Device
            </span>
            <span className="text-xs truncate max-w-[200px]">
              {securityInfo.lastLoginDevice}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-muted-foreground">
            {securityInfo.twofaEnabled ? (
              <ShieldCheck className="h-4 w-4 text-green-500" />
            ) : (
              <ShieldX className="h-4 w-4 text-amber-500" />
            )}
            Two-Factor Auth
          </span>
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded',
              securityInfo.twofaEnabled
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            )}
          >
            {securityInfo.twofaEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {securityInfo.activeSessions !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Active Sessions</span>
            <span className="font-medium">{securityInfo.activeSessions}</span>
          </div>
        )}

        {securityInfo.failedLoginAttempts !== undefined &&
          securityInfo.failedLoginAttempts > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Failed Attempts
              </span>
              <span className="font-medium text-destructive">
                {securityInfo.failedLoginAttempts}
              </span>
            </div>
          )}
      </div>
    </div>
  );
}
