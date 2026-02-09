import { useMemo } from 'react';
import { format, subDays, startOfDay, isWithinInterval } from 'date-fns';
import { Order, OrderStatus } from '@/types/order';
import { PaymentMethod } from '@/types/payment';

/**
 * Color palette for charts with accessible, visually distinct colors
 */
export const CHART_COLORS = {
  primary: 'hsl(220, 70%, 50%)',
  secondary: 'hsl(142, 70%, 45%)',
  tertiary: 'hsl(280, 65%, 50%)',
  quaternary: 'hsl(24, 95%, 55%)',
  quinary: 'hsl(340, 75%, 55%)',
  muted: 'hsl(220, 10%, 60%)',
} as const;

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'hsl(45, 93%, 47%)',
  CONFIRMED: 'hsl(200, 95%, 45%)',
  PREPARING: 'hsl(260, 80%, 55%)',
  READY: 'hsl(180, 70%, 42%)',
  DELIVERING: 'hsl(290, 60%, 50%)',
  DELIVERED: 'hsl(142, 76%, 42%)',
  CANCELLED: 'hsl(0, 84%, 50%)',
  PAID: 'hsl(160, 80%, 40%)',
};

export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, string> = {
  COD: 'hsl(24, 95%, 55%)',
  CARD: 'hsl(220, 70%, 50%)',
  KHQR: 'hsl(142, 70%, 45%)',
};

/**
 * Aggregates orders by date for timeline charts
 */
export function aggregateOrdersByDate(
  orders: Order[],
  days: number = 7
): Array<{ date: string; count: number; revenue: number }> {
  const today = startOfDay(new Date());
  const startDate = subDays(today, days - 1);

  const dateMap = new Map<string, { count: number; revenue: number }>();

  for (let i = 0; i < days; i++) {
    const date = format(subDays(today, days - 1 - i), 'yyyy-MM-dd');
    dateMap.set(date, { count: 0, revenue: 0 });
  }

  orders.forEach((order) => {
    const orderDate = startOfDay(new Date(order.createdAt));
    if (
      isWithinInterval(orderDate, {
        start: startDate,
        end: today,
      })
    ) {
      const dateKey = format(orderDate, 'yyyy-MM-dd');
      const existing = dateMap.get(dateKey);
      if (existing) {
        existing.count += 1;
        existing.revenue += order.total;
      }
    }
  });

  return Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    ...data,
  }));
}

/**
 * Aggregates orders by status for distribution charts
 */
export function aggregateOrdersByStatus(
  orders: Order[]
): Array<{ status: OrderStatus; count: number; percentage: number }> {
  const statusMap = new Map<OrderStatus, number>();

  orders.forEach((order) => {
    const current = statusMap.get(order.status) || 0;
    statusMap.set(order.status, current + 1);
  });

  const total = orders.length;

  return Array.from(statusMap.entries())
    .map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Aggregates orders by payment method for distribution charts
 */
export function aggregateOrdersByPaymentMethod(
  orders: Order[]
): Array<{ method: PaymentMethod; count: number; percentage: number }> {
  const methodMap = new Map<PaymentMethod, number>();

  orders.forEach((order) => {
    if (order.paymentMethod) {
      const current = methodMap.get(order.paymentMethod) || 0;
      methodMap.set(order.paymentMethod, current + 1);
    }
  });

  const total = orders.length;

  return Array.from(methodMap.entries())
    .map(([method, count]) => ({
      method,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Aggregates top products by order count
 */
export function aggregateTopProducts(
  orders: Order[],
  limit: number = 5
): Array<{ productName: string; count: number; revenue: number }> {
  const productMap = new Map<string, { count: number; revenue: number }>();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = productMap.get(item.productName) || { count: 0, revenue: 0 };
      productMap.set(item.productName, {
        count: existing.count + item.quantity,
        revenue: existing.revenue + item.price * item.quantity,
      });
    });
  });

  return Array.from(productMap.entries())
    .map(([productName, data]) => ({
      productName,
      ...data,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Format currency for chart tooltips
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date for chart axis labels
 */
export function formatChartDate(dateString: string, compact = false): string {
  const date = new Date(dateString);
  return compact ? format(date, 'MMM d') : format(date, 'MMMM d, yyyy');
}

/**
 * Hook for memoized chart data transformation
 */
export function useOrderTimelineData(orders: Order[], days: number = 7) {
  return useMemo(() => aggregateOrdersByDate(orders, days), [orders, days]);
}

export function useOrderStatusData(orders: Order[]) {
  return useMemo(() => aggregateOrdersByStatus(orders), [orders]);
}

export function usePaymentMethodData(orders: Order[]) {
  return useMemo(() => aggregateOrdersByPaymentMethod(orders), [orders]);
}

export function useTopProductsData(orders: Order[], limit: number = 5) {
  return useMemo(() => aggregateTopProducts(orders, limit), [orders, limit]);
}
