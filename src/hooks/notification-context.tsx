'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/hooks/auth-context';
import { getNotifications, markAsReadBulk } from '@/services/notification.service';
import type { Notification } from '@/types';

interface RefreshOptions {
  silent?: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  refreshNotifications: (options?: RefreshOptions) => Promise<boolean>;
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
  markNotificationsAsRead: (notificationIds: string[]) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const byNewest = (a: Notification, b: Notification): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshNotifications = useCallback(
    async (options: RefreshOptions = {}) => {
      if (!isAuthenticated) {
        setNotifications([]);
        setError(null);
        setIsHydrated(true);
        return true;
      }

      if (!options.silent) {
        setIsLoading(true);
      }

      try {
        const next = await getNotifications();
        setNotifications(next.sort(byNewest));
        setError(null);
        return true;
      } catch {
        setError('Unable to load notifications right now.');
        return false;
      } finally {
        if (!options.silent) {
          setIsLoading(false);
        }
        setIsHydrated(true);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    void refreshNotifications();
  }, [isAuthLoading, refreshNotifications]);

  const markNotificationsAsRead = useCallback(
    async (notificationIds: string[]) => {
      const uniqueIds = Array.from(new Set(notificationIds)).filter(Boolean);
      if (uniqueIds.length === 0) {
        return true;
      }

      const previous = notifications;
      setNotifications((current) =>
        current.filter((notification) => !uniqueIds.includes(notification.id))
      );

      try {
        await markAsReadBulk(uniqueIds);
        setError(null);
        return true;
      } catch {
        setNotifications(previous);
        setError('Unable to mark notifications as read.');
        return false;
      }
    },
    [notifications]
  );

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => markNotificationsAsRead([notificationId]),
    [markNotificationsAsRead]
  );

  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter((notification) => !notification.isRead)
      .map((notification) => notification.id);
    return markNotificationsAsRead(unreadIds);
  }, [notifications, markNotificationsAsRead]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const value = useMemo<NotificationContextType>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      isHydrated,
      error,
      refreshNotifications,
      markNotificationAsRead,
      markNotificationsAsRead,
      markAllAsRead,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      isHydrated,
      error,
      refreshNotifications,
      markNotificationAsRead,
      markNotificationsAsRead,
      markAllAsRead,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
