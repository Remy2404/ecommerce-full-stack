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
import { usePaymentMethodData, PAYMENT_METHOD_COLORS } from './chart-utils';
import { Order } from '@/types/order';
import { PAYMENT_METHOD_LABELS, PaymentMethod } from '@/types/payment';

interface PaymentMethodPieChartProps {
  orders: Order[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Pie chart showing distribution of orders by payment method
 */
export function PaymentMethodPieChart({
  orders,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  className,
}: PaymentMethodPieChartProps) {
  const data = usePaymentMethodData(orders);

  const isEmpty = useMemo(() => {
    return !isLoading && !isError && data.length === 0;
  }, [data, isLoading, isError]);

  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: PAYMENT_METHOD_LABELS[item.method] || item.method,
      value: item.count,
      method: item.method,
      percentage: item.percentage,
    }));
  }, [data]);

  return (
    <ChartContainer
      title="Payment Methods"
      description="Orders by payment method used"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      errorMessage={errorMessage}
      emptyMessage="No payment data available"
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
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''}: ${Math.round((percent ?? 0) * 100)}%`}
            labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
          >
            {chartData.map((entry) => (
              <Cell
                key={`cell-${entry.method}`}
                fill={PAYMENT_METHOD_COLORS[entry.method as PaymentMethod]}
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
              `${value} orders`,
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
