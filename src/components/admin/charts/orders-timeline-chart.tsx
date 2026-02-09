'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartContainer } from './chart-container';
import { useOrderTimelineData, formatChartDate, CHART_COLORS } from './chart-utils';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OrdersTimelineChartProps {
  orders: Order[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

type TimeRange = 7 | 14 | 30;

/**
 * Line chart showing order count and revenue over time
 * with toggleable time ranges (7, 14, 30 days)
 */
export function OrdersTimelineChart({
  orders,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  className,
}: OrdersTimelineChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(7);
  const data = useOrderTimelineData(orders, timeRange);

  const isEmpty = useMemo(() => {
    return !isLoading && !isError && data.every((d) => d.count === 0);
  }, [data, isLoading, isError]);

  return (
    <ChartContainer
      title="Orders Timeline"
      description="Daily order volume and revenue trends"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      errorMessage={errorMessage}
      emptyMessage="No orders in the selected period"
      onRetry={onRetry}
      className={className}
      height={320}
    >
      <div className="w-full">
        <div className="flex justify-end gap-1 mb-4">
          {([7, 14, 30] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(range)}
              className={cn(
                'h-7 px-2 text-xs',
                timeRange === range && 'font-medium'
              )}
            >
              {range}D
            </Button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => formatChartDate(v, true)}
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 11 }}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              labelFormatter={(label) => formatChartDate(label as string)}
              formatter={(value, name) => [
                name === 'revenue' ? `$${(value as number).toLocaleString()}` : value,
                name === 'revenue' ? 'Revenue' : 'Orders',
              ]}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="count"
              name="Orders"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.primary, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={CHART_COLORS.secondary}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.secondary, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
