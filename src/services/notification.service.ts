import api from './api';
import { PaginatedResponse, mapNotification } from '@/types';

/**
 * Get user notifications
 */
export async function getNotifications(page: number = 0, size: number = 20) {
  const response = await api.get<PaginatedResponse<any>>(`/notifications?page=${page}&size=${size}`);
  return {
    notifications: response.data.content.map(mapNotification),
    pagination: {
      page: response.data.number,
      limit: response.data.size,
      total: response.data.totalElements,
      totalPages: response.data.totalPages,
    }
  };
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string) {
  await api.put(`/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  await api.put('/notifications/read-all');
}
