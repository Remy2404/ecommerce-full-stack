import { AdminNotificationsClient } from '@/components/admin/admin-notifications-client';
import { getNotifications } from '@/services/notification.service';

export default async function AdminNotificationsPage() {
  const initialNotifications = await getNotifications().catch(() => []);
  return <AdminNotificationsClient initialNotifications={initialNotifications} />;
}
