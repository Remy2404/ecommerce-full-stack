'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShieldAlert, UserX } from 'lucide-react';
import { getAdminOrders, revokeUser } from '@/services/admin.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types';

interface UserSummary {
  userId: string;
  orders: number;
  totalSpend: number;
  lastOrder: string;
}

export default function AdminUsersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [revokeId, setRevokeId] = useState('');
  const [revokeStatus, setRevokeStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAdminOrders(0, 50);
        if (!active) return;
        setOrders(result.orders);
      } catch (err) {
        if (!active) return;
        setError('Unable to load admin orders to build the user list.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const users = useMemo<UserSummary[]>(() => {
    const summary = new Map<string, UserSummary>();

    orders.forEach((order) => {
      if (!order.userId) return;
      const current = summary.get(order.userId) || {
        userId: order.userId,
        orders: 0,
        totalSpend: 0,
        lastOrder: order.createdAt || ''
      };

      current.orders += 1;
      current.totalSpend += order.total || 0;
      if (order.createdAt && order.createdAt > current.lastOrder) {
        current.lastOrder = order.createdAt;
      }

      summary.set(order.userId, current);
    });

    return Array.from(summary.values())
      .filter((user) => user.userId.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [orders, search]);

  const formatCurrency = (value?: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleRevoke = async (userId: string) => {
    if (!userId) return;
    setRevokeStatus(null);
    try {
      await revokeUser(userId);
      setRevokeStatus(`User ${userId} access revoked.`);
    } catch (err) {
      setRevokeStatus('Failed to revoke user access.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">User Management</p>
        <h1 className="text-3xl font-semibold">Users</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Review customers with recent order activity and take action when needed.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Input
            placeholder="Search by user ID"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="flex flex-1 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="h-4 w-4" />
            User list is built from recent orders. Use revoke by ID for manual actions.
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-design-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-design border border-border">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">User ID</th>
                  <th className="px-4 py-3 text-left font-semibold">Orders</th>
                  <th className="px-4 py-3 text-left font-semibold">Total Spend</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{user.userId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.orders}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(user.totalSpend)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(user.lastOrder)}</td>
                    <td className="px-4 py-3">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(user.userId)}
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
                {!isLoading && users.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={5}>
                      No users found for the current query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revoke Access by ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Paste user UUID"
              value={revokeId}
              onChange={(event) => setRevokeId(event.target.value)}
            />
            <Button onClick={() => handleRevoke(revokeId)}>
              <UserX className="h-4 w-4" />
              Revoke Access
            </Button>
          </div>
          {revokeStatus && <p className="text-sm text-muted-foreground">{revokeStatus}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
