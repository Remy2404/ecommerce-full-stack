'use client';

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  width?: number;
  render?: (item: T, index: number) => React.ReactNode;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  overscan?: number;
  getRowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
}

/**
 * Virtualized table for large datasets
 */
export function VirtualTable<T>({
  data,
  columns,
  rowHeight = 48,
  overscan = 5,
  getRowKey,
  onRowClick,
  className,
  emptyMessage = 'No data available',
}: VirtualTableProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    setContainerHeight(container.clientHeight);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { startIndex, endIndex, visibleItems, paddingTop, paddingBottom } =
    useMemo(() => {
      const totalHeight = data.length * rowHeight;
      const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
      const end = Math.min(
        data.length,
        Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
      );

      return {
        startIndex: start,
        endIndex: end,
        visibleItems: data.slice(start, end),
        paddingTop: start * rowHeight,
        paddingBottom: Math.max(0, totalHeight - end * rowHeight),
      };
    }, [data, scrollTop, containerHeight, rowHeight, overscan]);

  if (data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-64 text-muted-foreground',
          className
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col border rounded-lg', className)}>
      <div className="flex border-b bg-muted/50">
        {columns.map((column) => (
          <div
            key={column.key}
            className="px-4 py-3 text-sm font-medium text-muted-foreground"
            style={{ width: column.width ?? 'auto', flex: column.width ? 'none' : 1 }}
          >
            {column.header}
          </div>
        ))}
      </div>

      <div
        ref={containerRef}
        className="overflow-auto flex-1"
        style={{ height: '400px' }}
        onScroll={handleScroll}
      >
        <div style={{ paddingTop, paddingBottom }}>
          {visibleItems.map((item, localIndex) => {
            const globalIndex = startIndex + localIndex;
            return (
              <div
                key={getRowKey(item)}
                className={cn(
                  'flex items-center border-b hover:bg-muted/50 transition-colors',
                  onRowClick && 'cursor-pointer'
                )}
                style={{ height: rowHeight }}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="px-4 text-sm truncate"
                    style={{ width: column.width ?? 'auto', flex: column.width ? 'none' : 1 }}
                  >
                    {column.render
                      ? column.render(item, globalIndex)
                      : String((item as Record<string, unknown>)[column.key] ?? '')}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
