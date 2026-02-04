'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingBag,
  Users
} from 'lucide-react';
import { getAdminDashboardStats, getAdminOrders } from '@/services/admin.service';
import { getProducts } from '@/services/product.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, Order, Product } from '@/types';

interface AdminStats {
  totalUsers?: number;
  totalOrders?: number;
  totalProducts?: number;
  totalRevenue?: number;
  timestamp?: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          getAdminDashboardStats(),
          getAdminOrders(0, 6),
          getProducts({ page: 0, size: 12 })
        ]);

        if (!active) return;

        setStats(statsRes || null);
        setOrders(ordersRes?.orders || []);
        const lowStockProducts = (productsRes?.products || [])
          .filter((product) => product.stock <= 10)
          .slice(0, 6);
        setLowStock(lowStockProducts);
      } catch (err) {
        if (!active) return;
        setError('Unable to load admin dashboard data.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const statusCounts = useMemo(() => {
    return orders.reduce<Record<string, number>>((acc, order) => {
      const key = order.status || 'PENDING';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [orders]);

  const formatCurrency = (value?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Admin Dashboard</p>
          <h1 className="text-3xl font-semibold">Store Overview</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Monitor performance, orders, and inventory health in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">Last 7 days</Button>
          <Button variant="outline">Last 30 days</Button>
          <Button>Open Promotions</Button>
        </div>
      </div>

      {error && (
        <div className="rounded-design-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{formatCurrency(stats?.totalRevenue)}</div>
            <p className="mt-2 text-xs text-muted-foreground">Updated {formatDate(stats?.timestamp)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats?.totalOrders ?? 0}</div>
            <p className="mt-2 text-xs text-muted-foreground">All-time order volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats?.totalUsers ?? 0}</div>
            <p className="mt-2 text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stats?.totalProducts ?? 0}</div>
            <p className="mt-2 text-xs text-muted-foreground">Live catalog items</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" className="text-sm" asChild>
              <Link href="/admin/orders" className="flex items-center gap-1">
                View all <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-design border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Order</th>
                    <th className="px-4 py-3 text-left font-semibold">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold">Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.userId ? order.userId.slice(0, 8) : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ORDER_STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                  {!isLoading && orders.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={5}>
                        No recent orders available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <Badge variant="secondary">{statusCounts[status] || 0}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">SKU: {product.slug}</p>
                  </div>
                  <Badge variant={product.stock === 0 ? 'destructive' : 'warning'}>
                    {product.stock === 0 ? 'Out' : `${product.stock} left`}
                  </Badge>
                </div>
              ))}
              {!isLoading && lowStock.length === 0 && (
                <p className="text-sm text-muted-foreground">No low-stock alerts right now.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
