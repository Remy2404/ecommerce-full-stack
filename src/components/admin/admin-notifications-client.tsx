'use client';

import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';
import {
  getNotifications,
  markAllAsRead,
  markAsReadBulk,
} from '@/services/notification.service';
import { Notification } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminNotificationsClientProps {
  initialNotifications: Notification[];
}

export function AdminNotificationsClient({
  initialNotifications,
}: AdminNotificationsClientProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadNotifications = async () => {
    try {
      const result = await getNotifications();
      setNotifications(result);
    } catch {
      setMessage('Unable to load notifications.');
    }
  };

  useEffect(() => {
    if (initialNotifications.length === 0) {
      void loadNotifications();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelected = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleMarkSelected = async () => {
    if (selected.length === 0) return;
    try {
      await markAsReadBulk(selected);
      setSelected([]);
      setMessage('Selected notifications marked as read.');
      await loadNotifications();
    } catch {
      setMessage('Unable to mark selected notifications as read.');
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead();
      setMessage('All notifications marked as read.');
      await loadNotifications();
    } catch {
      setMessage('Unable to mark all notifications as read.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Notification Center
        </p>
        <h1 className="text-3xl font-semibold">Notifications</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitor system, order, and account alerts from one queue.
        </p>
      </div>

      {message && (
        <div className="rounded-design-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Unread Notifications</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleMarkSelected}
              disabled={selected.length === 0}
            >
              Mark Selected
            </Button>
            <Button onClick={handleMarkAll}>
              <BellRing className="h-4 w-4" />
              Mark All Read
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-design border border-border">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Select</th>
                  <th className="px-4 py-3 text-left font-semibold">Title</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Message</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {notifications.map((notification) => (
                  <tr key={notification.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(notification.id)}
                        onChange={() => toggleSelected(notification.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {notification.title}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={notification.isRead ? 'secondary' : 'success'}
                      >
                        {notification.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {notification.message}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {notifications.length === 0 && (
                  <tr>
                    <td
                      className="px-4 py-6 text-center text-sm text-muted-foreground"
                      colSpan={5}
                    >
                      No unread notifications available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
