'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { ChartContainer } from './chart-container';
import { useTopProductsData, formatCurrency, CHART_COLORS } from './chart-utils';
import { Order } from '@/types/order';

interface TopProductsChartProps {
  orders: Order[];
  limit?: number;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

const PRODUCT_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.tertiary,
  CHART_COLORS.quaternary,
  CHART_COLORS.quinary,
];

/**
 * Horizontal bar chart showing top products by sales count
 */
export function TopProductsChart({
  orders,
  limit = 5,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  className,
}: TopProductsChartProps) {
  const data = useTopProductsData(orders, limit);

  const isEmpty = useMemo(() => {
    return !isLoading && !isError && data.length === 0;
  }, [data, isLoading, isError]);

  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      shortName:
        item.productName.length > 20
          ? `${item.productName.substring(0, 18)}...`
          : item.productName,
    }));
  }, [data]);

  return (
    <ChartContainer
      title="Top Products"
      description="Best-selling products by quantity"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      errorMessage={errorMessage}
      emptyMessage="No product sales data"
      onRetry={onRetry}
      className={className}
      height={300}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" horizontal={false} />
          <XAxis
            type="number"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 11 }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 11 }}
            width={75}
          />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            labelFormatter={(_, payload) => {
              if (payload && payload[0]) {
                return payload[0].payload.productName;
              }
              return '';
            }}
            formatter={(value, name) => {
              if (name === 'count') {
                return [`${value} units`, 'Sold'];
              }
              if (name === 'revenue') {
                return [formatCurrency(value as number), 'Revenue'];
              }
              return [value, name];
            }}
          />
          <Bar dataKey="count" name="count" radius={[0, 4, 4, 0]} maxBarSize={30}>
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
