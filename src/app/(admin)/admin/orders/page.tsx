'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';
import { getAdminOrders } from '@/services/admin.service';
import { updateOrderStatus } from '@/services/order.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, Order, PaymentStatus } from '@/types';

const statusOptions = ['ALL', ...Object.keys(ORDER_STATUS_LABELS)];
const paymentOptions: Array<'ALL' | PaymentStatus> = ['ALL', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusUpdate, setStatusUpdate] = useState<Order['status'] | ''>('');
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getAdminOrders(page, size);
        if (!active) return;
        setOrders(result.orders);
        setTotalPages(result.pagination.totalPages);
        setSelectedOrder(result.orders[0] || null);
      } catch (err) {
        if (!active) return;
        setError('Unable to load orders.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadOrders();
    return () => {
      active = false;
    };
  }, [page, size]);

  useEffect(() => {
    if (selectedOrder) {
      setStatusUpdate(selectedOrder.status);
    }
  }, [selectedOrder?.id]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesQuery =
        !query ||
        order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
        (order.userId ? order.userId.toLowerCase().includes(query.toLowerCase()) : false);
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesPayment = paymentFilter === 'ALL' || order.paymentStatus === paymentFilter;

      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      const withinFrom = dateFrom ? createdAt && createdAt >= new Date(dateFrom) : true;
      const withinTo = dateTo ? createdAt && createdAt <= new Date(dateTo) : true;

      return matchesQuery && matchesStatus && matchesPayment && withinFrom && withinTo;
    });
  }, [orders, query, statusFilter, paymentFilter, dateFrom, dateTo]);

  const formatCurrency = (value?: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusUpdate) return;
    setUpdateLoading(true);
    setUpdateMessage(null);

    const result = await updateOrderStatus(selectedOrder.id, statusUpdate);

    if (result.success) {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id ? { ...order, status: statusUpdate } : order
        )
      );
      setSelectedOrder((prev) => (prev ? { ...prev, status: statusUpdate } : prev));
      setUpdateMessage('Order status updated.');
    } else {
      setUpdateMessage(result.error || 'Unable to update order status.');
    }

    setUpdateLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Order Management</p>
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track, filter, and action orders across the entire store.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Search by order number or user ID"
                icon={<Search className="h-4 w-4" />}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-design border border-input bg-background px-3 text-sm"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Statuses' : ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]}
                  </option>
                ))}
              </select>
              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value as PaymentStatus | 'ALL')}
                className="h-10 rounded-design border border-input bg-background px-3 text-sm"
              >
                {paymentOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Payments' : status}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="h-10 rounded-design border border-input bg-background px-3 text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
                className="h-10 rounded-design border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-design-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-design border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Order</th>
                    <th className="px-4 py-3 text-left font-semibold">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold">Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Payment</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`cursor-pointer hover:bg-muted/40 ${
                        selectedOrder?.id === order.id ? 'bg-muted/50' : ''
                      }`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {order.userId ? order.userId.slice(0, 8) : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.paymentStatus}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ORDER_STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                  {!isLoading && filteredOrders.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={6}>
                        No orders match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {page + 1} of {Math.max(totalPages, 1)}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, Math.max(totalPages - 1, 0)))}
                  disabled={page + 1 >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOrder ? (
              <>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Order</p>
                  <p className="text-lg font-semibold">{selectedOrder.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">Placed {formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="grid gap-3 rounded-design border border-border p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Customer</span>
                    <span>{selectedOrder.userId || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment</span>
                    <span>{selectedOrder.paymentStatus}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <span>{selectedOrder.items?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Current Status</p>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      ORDER_STATUS_COLORS[selectedOrder.status] || 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase text-muted-foreground">Update Status</label>
                  <select
                    value={statusUpdate}
                    onChange={(event) => setStatusUpdate(event.target.value as Order['status'])}
                    className="h-10 w-full rounded-design border border-input bg-background px-3 text-sm"
                  >
                    {Object.keys(ORDER_STATUS_LABELS).map((status) => (
                      <option key={status} value={status}>
                        {ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS]}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleStatusUpdate} disabled={updateLoading} className="w-full">
                    Save Status
                  </Button>
                  {updateMessage && (
                    <p className="text-xs text-muted-foreground">{updateMessage}</p>
                  )}
                  <Button variant="outline" className="w-full">
                    Contact Customer
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Select an order to inspect details.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
