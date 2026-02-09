/**
 * Admin Widget Types
 * Types for dashboard stat widgets and metrics
 */

export interface StatWidgetProps {
  title: string;
  value: string | number;
  previousValue?: number;
  currentValue?: number;
  icon?: React.ReactNode;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
  onRefresh?: () => Promise<void>;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  formatValue?: (value: number) => string;
}
