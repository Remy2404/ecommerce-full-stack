'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer } from './chart-container';
import { useOrderStatusData, ORDER_STATUS_COLORS } from './chart-utils';
import { Order, ORDER_STATUS_LABELS } from '@/types/order';

interface OrderStatusPieChartProps {
  orders: Order[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Pie chart showing distribution of orders by status
 */
export function OrderStatusPieChart({
  orders,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  className,
}: OrderStatusPieChartProps) {
  const data = useOrderStatusData(orders);

  const isEmpty = useMemo(() => {
    return !isLoading && !isError && data.length === 0;
  }, [data, isLoading, isError]);

  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: ORDER_STATUS_LABELS[item.status] || item.status,
      value: item.count,
      status: item.status,
      percentage: item.percentage,
    }));
  }, [data]);

  return (
    <ChartContainer
      title="Order Status Distribution"
      description="Breakdown of orders by current status"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      errorMessage={errorMessage}
      emptyMessage="No orders to display"
      onRetry={onRetry}
      className={className}
      height={300}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={50}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            label={({ percent }: { percent?: number }) => `${Math.round((percent ?? 0) * 100)}%`}
            labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.status}`}
                fill={ORDER_STATUS_COLORS[entry.status]}
                strokeWidth={0}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value, name) => [
              `${value} orders (${chartData.find((d) => d.name === name)?.percentage || 0}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
