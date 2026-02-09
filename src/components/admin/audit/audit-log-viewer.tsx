'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Activity,
  Search,
  User,
  Clock,
  FileText,
  Settings,
  ShoppingCart,
  Package,
  CreditCard,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { 
  AuditLogEntry, 
  AuditLogAction, 
  AuditLogEntity,
  AuditLogViewerProps 
} from '@/types/audit';

export type { AuditLogEntry, AuditLogAction, AuditLogEntity } from '@/types/audit';

const ACTION_COLORS: Record<AuditLogAction, string> = {
  CREATE: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  UPDATE: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  DELETE: 'bg-red-500/20 text-red-600 border-red-500/30',
  STATUS_CHANGE: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  PAYMENT: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  LOGIN: 'bg-sky-500/20 text-sky-600 border-sky-500/30',
  LOGOUT: 'bg-slate-500/20 text-slate-600 border-slate-500/30',
  EXPORT: 'bg-teal-500/20 text-teal-600 border-teal-500/30',
  BULK_ACTION: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
};

const ENTITY_ICONS: Record<AuditLogEntity, React.ReactNode> = {
  ORDER: <ShoppingCart className="h-4 w-4" />,
  PRODUCT: <Package className="h-4 w-4" />,
  USER: <User className="h-4 w-4" />,
  CATEGORY: <FileText className="h-4 w-4" />,
  PAYMENT: <CreditCard className="h-4 w-4" />,
  SYSTEM: <Settings className="h-4 w-4" />,
};

/**
 * Audit log viewer component for future backend integration
 */
export function AuditLogViewer({
  entries,
  isLoading = false,
  isError = false,
  onRetry,
  onRefresh,
  className,
  maxHeight = '400px',
}: AuditLogViewerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<AuditLogAction | null>(null);
  const [filterEntity, setFilterEntity] = useState<AuditLogEntity | null>(null);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch = searchQuery
        ? entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.entityId?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesAction = filterAction ? entry.action === filterAction : true;
      const matchesEntity = filterEntity ? entry.entity === filterEntity : true;
      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [entries, searchQuery, filterAction, filterEntity]);

  const formatTimestamp = useCallback((date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterAction(null);
    setFilterEntity(null);
  }, []);

  const hasActiveFilters = searchQuery || filterAction || filterEntity;

  if (isLoading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-destructive">Failed to load audit logs</p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <CardDescription className="mt-1">
              Recent admin actions and system events
            </CardDescription>
          </div>
          {onRefresh && (
            <Button variant="ghost" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className="space-y-2 overflow-y-auto pr-1"
          style={{ maxHeight }}
        >
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                {hasActiveFilters ? 'No matching logs found' : 'No activity recorded yet'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <AuditLogItem
                key={entry.id}
                entry={entry}
                isExpanded={expandedId === entry.id}
                onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                formatTimestamp={formatTimestamp}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface AuditLogItemProps {
  entry: AuditLogEntry;
  isExpanded: boolean;
  onToggle: () => void;
  formatTimestamp: (date: Date) => string;
}

function AuditLogItem({ entry, isExpanded, onToggle, formatTimestamp }: AuditLogItemProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3 transition-colors',
        'hover:bg-accent/30 cursor-pointer'
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-muted p-2">
          {ENTITY_ICONS[entry.entity]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant="outline" 
              className={cn('text-xs', ACTION_COLORS[entry.action])}
            >
              {entry.action.replace('_', ' ')}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {entry.entity}
              {entry.entityId && ` #${entry.entityId.slice(0, 8)}`}
            </span>
          </div>
          <p className="mt-1 text-sm">{entry.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {entry.userName ?? 'System'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isExpanded && entry.metadata && (
        <div className="mt-3 rounded-md bg-muted/50 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Details</p>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(entry.metadata, null, 2)}
          </pre>
          {entry.ipAddress && (
            <p className="mt-2 text-xs text-muted-foreground">
              IP: {entry.ipAddress}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Generate demo audit log entries for display
 */
export function generateDemoAuditLogs(orders: Array<{ id: string; status: string; createdAt: string }>): AuditLogEntry[] {
  const now = new Date();
  const logs: AuditLogEntry[] = [];
  orders.slice(0, 10).forEach((order, i) => {
    logs.push({
      id: `log-${order.id}-${i}`,
      timestamp: new Date(now.getTime() - i * 3600000),
      action: 'CREATE',
      entity: 'ORDER',
      entityId: order.id,
      userId: 'admin',
      userName: 'Admin User',
      description: `Order created with status ${order.status}`,
      metadata: { status: order.status },
    });
  });
  return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export { AuditLogItem };
