'use client';

import { useCallback } from 'react';
import { exportToCsv } from '@/utils/csv-export';
import { ExportButton } from './export-button';
import type { Order } from '@/types/order';
import type { CsvColumn } from '@/types/export';

/**
 * Column definitions for order CSV export
 */
const ORDER_COLUMNS: CsvColumn<Order>[] = [
  { header: 'Order Number', accessor: 'orderNumber' },
  { header: 'Status', accessor: 'status' },
  { header: 'Payment Status', accessor: 'paymentStatus' },
  { header: 'Payment Method', accessor: (o) => o.paymentMethod ?? '' },
  { header: 'Subtotal', accessor: 'subtotal' },
  { header: 'Delivery Fee', accessor: 'deliveryFee' },
  { header: 'Discount', accessor: 'discount' },
  { header: 'Tax', accessor: 'tax' },
  { header: 'Total', accessor: 'total' },
  { header: 'Items Count', accessor: (o) => o.items.length },
  { header: 'Customer Address', accessor: (o) => {
    if (!o.shippingAddress) return '';
    const addr = o.shippingAddress;
    return [addr.street, addr.city, addr.state, addr.zipCode, addr.country]
      .filter(Boolean)
      .join(', ');
  }},
  { header: 'Notes', accessor: (o) => o.notes ?? '' },
  { header: 'Created At', accessor: 'createdAt' },
  { header: 'Updated At', accessor: 'updatedAt' },
];

interface ExportOrdersButtonProps {
  orders: Order[];
  disabled?: boolean;
  className?: string;
}

/**
 * Export orders to CSV
 */
export function ExportOrdersButton({
  orders,
  disabled = false,
  className,
}: ExportOrdersButtonProps) {
  const handleExport = useCallback(() => {
    return exportToCsv(ORDER_COLUMNS, orders, 'orders_export');
  }, [orders]);

  return (
    <ExportButton
      onExport={handleExport}
      label="Export Orders"
      disabled={disabled || orders.length === 0}
      className={className}
    />
  );
}
