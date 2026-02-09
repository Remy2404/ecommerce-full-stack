'use client';

import { useMemo, useState } from 'react';
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
import { useOrderTimelineData, formatChartDate, formatCurrency, CHART_COLORS } from './chart-utils';
import { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RevenueBarChartProps {
  orders: Order[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  className?: string;
}

type TimeRange = 7 | 14 | 30;

/**
 * Bar chart showing daily revenue with gradient coloring
 */
export function RevenueBarChart({
  orders,
  isLoading = false,
  isError = false,
  errorMessage,
  onRetry,
  className,
}: RevenueBarChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>(7);
  const data = useOrderTimelineData(orders, timeRange);

  const isEmpty = useMemo(() => {
    return !isLoading && !isError && data.every((d) => d.revenue === 0);
  }, [data, isLoading, isError]);

  const maxRevenue = useMemo(() => {
    return Math.max(...data.map((d) => d.revenue), 0);
  }, [data]);

  return (
    <ChartContainer
      title="Revenue Overview"
      description="Daily revenue breakdown"
      isLoading={isLoading}
      isError={isError}
      isEmpty={isEmpty}
      errorMessage={errorMessage}
      emptyMessage="No revenue in the selected period"
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
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => formatChartDate(v, true)}
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              className="text-xs fill-muted-foreground"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              labelFormatter={(label) => formatChartDate(label as string)}
              formatter={(value) => [formatCurrency(value as number), 'Revenue']}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => {
                const opacity = maxRevenue > 0 ? 0.4 + (entry.revenue / maxRevenue) * 0.6 : 0.6;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS.secondary}
                    fillOpacity={opacity}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
