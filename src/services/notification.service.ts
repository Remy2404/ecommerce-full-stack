import api from './api';
import { Notification, NotificationApiResponse, mapNotification } from '@/types';

/**
 * Get user notifications
 */
export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<NotificationApiResponse[]>('/notifications');
  return response.data.map(mapNotification);
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string) {
  await markAsReadBulk([notificationId]);
}

/**
 * Mark notifications as read (bulk)
 */
export async function markAsReadBulk(notificationIds: string[]) {
  if (notificationIds.length === 0) return;
  await api.post('/notifications/read', notificationIds);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  const notifications = await getNotifications();
  const ids = notifications.map((n) => n.id);
  await markAsReadBulk(ids);
}
