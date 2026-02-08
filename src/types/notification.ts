/**
 * Notification-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface NotificationApiResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

// --- Frontend Domain Models ---

export type NotificationType = 'ORDER_STATUS' | 'PROMOTION' | 'ACCOUNT' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

// --- Transformation Logic ---

export function mapNotification(raw: NotificationApiResponse): Notification {
  const validType: NotificationType =
    raw.type === 'ORDER_STATUS' || raw.type === 'PROMOTION' || raw.type === 'ACCOUNT' || raw.type === 'SYSTEM'
      ? raw.type
      : 'SYSTEM';
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title,
    message: raw.message,
    type: validType,
    isRead: raw.isRead,
    relatedId: raw.relatedId,
    createdAt: raw.createdAt,
  };
}
