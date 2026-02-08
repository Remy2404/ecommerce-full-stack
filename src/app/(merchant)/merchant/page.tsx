'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowUpRight, DollarSign, PackageCheck, ShoppingBag } from 'lucide-react';
import { getMerchantOrders } from '@/services/order.service';
import { ORDER_STATUS_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const EMPTY_ORDERS: NonNullable<Awaited<ReturnType<typeof getMerchantOrders>>['orders']> = [];

export default function MerchantDashboardPage() {
  const ordersQuery = useQuery({
    queryKey: ['merchant-dashboard-orders'],
    queryFn: () => getMerchantOrders(0, 20),
  });

  const orders = ordersQuery.data?.orders ?? EMPTY_ORDERS;

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
    const deliveredCount = orders.filter((order) => order.status === 'DELIVERED').length;
    const pendingCount = orders.filter((order) => order.status === 'PENDING').length;
    return { totalRevenue, deliveredCount, pendingCount };
  }, [orders]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Merchant Dashboard</p>
          <h1 className="text-3xl font-semibold">Store Performance</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review order throughput and payment collections for your catalog.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/merchant/orders">Manage Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/merchant/payments">Payment Verification</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="mt-2 text-xs text-muted-foreground">Based on loaded merchant orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
            <PackageCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.deliveredCount}</div>
            <p className="mt-2 text-xs text-muted-foreground">Orders marked delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats.pendingCount}</div>
            <p className="mt-2 text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" className="text-sm" asChild>
            <Link href="/merchant/orders" className="flex items-center gap-1">
              View all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-design border border-border">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">{ORDER_STATUS_LABELS[order.status]}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={4}>
                      No merchant orders available.
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
