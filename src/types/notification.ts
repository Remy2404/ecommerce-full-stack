/**
 * Notification-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface NotificationApiResponse {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
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
  link?: string;
  createdAt: string;
}

// --- Transformation Logic ---

export function mapNotification(raw: NotificationApiResponse): Notification {
  return {
    ...raw,
  };
}
