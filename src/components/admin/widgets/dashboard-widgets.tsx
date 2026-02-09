'use client';

import { useMemo, useCallback } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Clock,
  AlertCircle,
  Truck,
  Tag,
} from 'lucide-react';
import { StatWidget, StatWidgetProps } from './stat-widget';
import { Order, OrderStatus } from '@/types/order';
import { Product } from '@/types/product';

interface DashboardWidgetsProps {
  stats: {
    totalRevenue?: number;
    totalOrders?: number;
    totalUsers?: number;
    totalProducts?: number;
  } | null;
  orders: Order[];
  products: Product[];
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => Promise<void>;
}

/**
 * Dashboard widgets grid component
 */
export function DashboardWidgets({
  stats,
  orders,
  products,
  isLoading = false,
  isError = false,
  onRefresh,
}: DashboardWidgetsProps) {
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'PENDING').length;
  }, [orders]);

  const failedPaymentsCount = useMemo(() => {
    return orders.filter((o) => o.paymentStatus === 'FAILED').length;
  }, [orders]);

  const deliveringCount = useMemo(() => {
    return orders.filter((o) => o.status === 'DELIVERING').length;
  }, [orders]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= 10).length;
  }, [products]);

  const activeUsersEstimate = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const uniqueUserIds = new Set(
      orders
        .filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
        .map((o) => o.userId)
    );
    return uniqueUserIds.size;
  }, [orders]);

  const todayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orders
      .filter((o) => new Date(o.createdAt) >= today)
      .reduce((sum, o) => sum + o.total, 0);
  }, [orders]);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatWidget
        title="Total Revenue"
        value={formatCurrency(stats?.totalRevenue ?? 0)}
        icon={<DollarSign className="h-5 w-5" />}
        description={`Today: ${formatCurrency(todayRevenue)}`}
        isLoading={isLoading}
        isError={isError}
        onRefresh={onRefresh}
        autoRefresh
        refreshIntervalMs={60000}
      />
      <StatWidget
        title="Total Orders"
        value={stats?.totalOrders ?? 0}
        icon={<ShoppingCart className="h-5 w-5" />}
        description={`${pendingOrdersCount} pending`}
        isLoading={isLoading}
        isError={isError}
        onRefresh={onRefresh}
        trend={pendingOrdersCount > 5 ? 'down' : 'neutral'}
      />
      <StatWidget
        title="Active Users"
        value={activeUsersEstimate}
        icon={<Users className="h-5 w-5" />}
        description={`${stats?.totalUsers ?? 0} registered total`}
        isLoading={isLoading}
        isError={isError}
        trend="neutral"
      />
      <StatWidget
        title="Products"
        value={stats?.totalProducts ?? 0}
        icon={<Package className="h-5 w-5" />}
        description={lowStockCount > 0 ? `${lowStockCount} low stock` : 'All stocked'}
        isLoading={isLoading}
        isError={isError}
        trend={lowStockCount > 0 ? 'down' : 'up'}
      />
      <StatWidget
        title="Pending Orders"
        value={pendingOrdersCount}
        icon={<Clock className="h-5 w-5" />}
        description="Awaiting confirmation"
        isLoading={isLoading}
        isError={isError}
        trend={pendingOrdersCount > 10 ? 'down' : 'neutral'}
      />
      <StatWidget
        title="Failed Payments"
        value={failedPaymentsCount}
        icon={<AlertCircle className="h-5 w-5" />}
        description="Require attention"
        isLoading={isLoading}
        isError={isError}
        trend={failedPaymentsCount > 0 ? 'down' : 'up'}
      />
      <StatWidget
        title="In Delivery"
        value={deliveringCount}
        icon={<Truck className="h-5 w-5" />}
        description="Currently shipping"
        isLoading={isLoading}
        isError={isError}
        trend="neutral"
      />
      <StatWidget
        title="Low Stock Items"
        value={lowStockCount}
        icon={<Tag className="h-5 w-5" />}
        description={lowStockCount === 0 ? 'Inventory healthy' : 'Need restocking'}
        isLoading={isLoading}
        isError={isError}
        trend={lowStockCount > 5 ? 'down' : 'neutral'}
      />
    </div>
  );
}
