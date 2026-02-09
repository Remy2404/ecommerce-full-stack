'use client';

import { useMemo } from 'react';
import {
  Clock,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderTimelineEvent } from '@/types/order-intelligence';
import type { OrderStatus } from '@/types/order';

const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  PENDING: <Clock className="h-4 w-4" />,
  CONFIRMED: <CheckCircle2 className="h-4 w-4" />,
  PREPARING: <Package className="h-4 w-4" />,
  READY: <Package className="h-4 w-4" />,
  DELIVERING: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
  PAID: <CheckCircle2 className="h-4 w-4" />,
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-500',
  CONFIRMED: 'bg-blue-500',
  PREPARING: 'bg-indigo-500',
  READY: 'bg-purple-500',
  DELIVERING: 'bg-cyan-500',
  DELIVERED: 'bg-green-500',
  CANCELLED: 'bg-red-500',
  PAID: 'bg-emerald-500',
};

interface OrderTimelineProps {
  events: OrderTimelineEvent[];
  className?: string;
}

/**
 * Visual timeline for order status history
 */
export function OrderTimeline({ events, className }: OrderTimelineProps) {
  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    [events]
  );

  if (events.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-muted-foreground', className)}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">No timeline events available</span>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
      <ul className="space-y-4">
        {sortedEvents.map((event, index) => (
          <li key={event.id} className="relative pl-10">
            <div
              className={cn(
                'absolute left-2 top-1 flex h-5 w-5 items-center justify-center rounded-full text-white',
                STATUS_COLORS[event.status]
              )}
            >
              {STATUS_ICONS[event.status]}
            </div>
            <div className="rounded-lg border bg-card p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{event.status}</span>
                <time className="text-xs text-muted-foreground">
                  {new Date(event.timestamp).toLocaleString()}
                </time>
              </div>
              {event.actor && (
                <p className="mt-1 text-xs text-muted-foreground">
                  by {event.actor}
                </p>
              )}
              {event.note && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {event.note}
                </p>
              )}
            </div>
            {index < sortedEvents.length - 1 && (
              <div className="absolute left-[1.125rem] top-8 h-4 w-0.5 bg-border" />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
