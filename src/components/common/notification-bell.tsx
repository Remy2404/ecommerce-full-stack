'use client';

import { useMemo, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/notification-context';
import { useAuth } from '@/hooks/auth-context';
import type { Notification } from '@/types';

const toDisplayType = (type: string): string =>
  type
    .split('_')
    .map((part) => (part ? part[0] + part.slice(1).toLowerCase() : part))
    .join(' ');

const formatDate = (timestamp: string): string => {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return 'Just now';
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const resolveNotificationHref = (notification: Notification): string | null => {
  if (!notification.relatedId) return null;

  if (
    notification.type === 'ORDER' ||
    notification.type === 'ORDER_STATUS' ||
    notification.type === 'PAYMENT'
  ) {
    return `/orders?relatedId=${encodeURIComponent(notification.relatedId)}`;
  }

  return null;
};

export function NotificationBell() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    isHydrated,
    error,
    refreshNotifications,
    markNotificationAsRead,
    markAllAsRead,
  } = useNotifications();

  const items = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [notifications]
  );

  if (!user) {
    return null;
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      void refreshNotifications({ silent: true });
    }
  };

  const handleMarkAll = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const success = await markAllAsRead();
    if (!success) {
      toast.error('Unable to mark all notifications as read.');
    }
  };

  const handleNotificationSelect = async (notification: Notification) => {
    const success = await markNotificationAsRead(notification.id);
    if (!success) {
      toast.error('Unable to mark notification as read.');
      return;
    }

    const href = resolveNotificationHref(notification);
    if (href) {
      router.push(href);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {isHydrated && unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(92vw,24rem)] rounded-design border border-border bg-popover p-0 shadow-float"
      >
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            disabled={unreadCount === 0}
            onClick={handleMarkAll}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-0" />

        <div className="max-h-80 overflow-y-auto p-1">
          {isLoading && items.length === 0 && (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          )}

          {!isLoading && items.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          )}

          {items.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="cursor-pointer items-start gap-3 rounded-design-sm px-3 py-3"
              onSelect={() => {
                void handleNotificationSelect(notification);
              }}
            >
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{notification.title}</p>
                  <Badge variant="secondary" size="sm">
                    {toDisplayType(notification.type)}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {notification.message}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </div>

        {error && (
          <>
            <DropdownMenuSeparator className="my-0" />
            <p className="px-3 py-2 text-xs text-muted-foreground">{error}</p>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
