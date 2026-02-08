'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Filter, Search } from 'lucide-react';
import { getAdminOrders } from '@/services/admin.service';
import {
  cancelOrder,
  getMerchantOrders,
  getOrderByNumber,
  updateOrderStatus,
} from '@/services/order.service';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, type Order, type OrderStatus } from '@/types';
import { AdminDateTimePicker } from '@/components/admin/admin-datetime-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

type PanelRole = 'ADMIN' | 'MERCHANT';

const statusOptions = ['ALL', ...Object.keys(ORDER_STATUS_LABELS)];

const currency = (value = 0) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export function OrdersManagement({ role }: { role: PanelRole }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<OrderStatus>('PENDING');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const queryKey = ['panel-orders', role, page, size];

  const ordersQuery = useQuery({
    queryKey,
    queryFn: async () => {
      if (role === 'ADMIN') return getAdminOrders(page, size);
      return getMerchantOrders(page, size);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Unable to update order');
        return;
      }
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['panel-orders'] });
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: statusUpdate });
      }
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || 'Unable to cancel order');
        return;
      }
      toast.success('Order cancelled');
      queryClient.invalidateQueries({ queryKey: ['panel-orders'] });
    },
  });

  const detailQuery = useQuery({
    queryKey: ['order-detail', selectedOrder?.orderNumber],
    enabled: Boolean(drawerOpen && selectedOrder?.orderNumber),
    queryFn: async () => getOrderByNumber(selectedOrder!.orderNumber),
  });

  const filteredOrders = useMemo(() => {
    const orders = ordersQuery.data?.orders || [];
    return orders.filter((order) => {
      const matchesQuery =
        !query ||
        order.orderNumber.toLowerCase().includes(query.toLowerCase()) ||
        order.userId.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

      const createdAt = order.createdAt ? new Date(order.createdAt) : null;
      const withinFrom = dateFrom ? createdAt && createdAt >= new Date(dateFrom) : true;
      const withinTo = dateTo ? createdAt && createdAt <= new Date(dateTo) : true;

      return matchesQuery && matchesStatus && withinFrom && withinTo;
    });
  }, [dateFrom, dateTo, ordersQuery.data?.orders, query, statusFilter]);

  const selectedDetail = detailQuery.data || selectedOrder;
  const pagination = ordersQuery.data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Order Management</p>
        <h1 className="text-3xl font-semibold">{role === 'ADMIN' ? 'All Orders' : 'Merchant Orders'}</h1>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Input
            placeholder="Search by order number or user ID"
            icon={<Search className="h-4 w-4" />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 rounded-design border border-input bg-background px-3 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'ALL' ? 'All statuses' : ORDER_STATUS_LABELS[status as OrderStatus]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <AdminDateTimePicker
              valueIso={dateFrom || undefined}
              onChangeIso={(nextFrom) => {
                setDateFrom(nextFrom);
                if (dateTo && new Date(dateTo).getTime() < new Date(nextFrom).getTime()) {
                  setDateTo('');
                }
              }}
              format="y-MM-dd"
              disableClock
              showClearIcon={false}
              className="w-[220px] sm:w-[240px]"
            />
            <span className="text-muted-foreground">to</span>
            <AdminDateTimePicker
              valueIso={dateTo || undefined}
              onChangeIso={setDateTo}
              minIso={dateFrom || undefined}
              rangeStartIso={dateFrom || undefined}
              showRangePreview={Boolean(dateFrom)}
              format="y-MM-dd"
              disableClock
              showClearIcon={false}
              className="w-[220px] sm:w-[240px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-design border border-border">
            <table className="min-w-[860px] w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Placed</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.userId || '—'}</td>
                    <td className="px-4 py-3">{currency(order.total)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_COLORS[order.status]}`}
                      >
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setStatusUpdate(order.status);
                          setDrawerOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {!ordersQuery.isLoading && filteredOrders.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      No matching orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {(pagination?.page || 0) + 1} of {Math.max(pagination?.totalPages || 1, 1)}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((prev) => prev - 1)}>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(pagination?.totalPages || 0) <= page + 1}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Order Detail</DialogTitle>
          </DialogHeader>
          {selectedDetail ? (
            <div className="space-y-4">
              <div className="rounded-design border border-border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order #</span>
                  <span className="font-semibold">{selectedDetail.orderNumber}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="max-w-[260px] truncate">{selectedDetail.userId || '—'}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span>{selectedDetail.paymentStatus}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{currency(selectedDetail.total)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground">Update Status</label>
                <select
                  value={statusUpdate}
                  onChange={(event) => setStatusUpdate(event.target.value as OrderStatus)}
                  className="h-11 w-full rounded-design border border-input bg-background px-3 text-sm"
                >
                  {Object.keys(ORDER_STATUS_LABELS).map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_LABELS[status as OrderStatus]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      orderId: selectedDetail.id,
                      status: statusUpdate,
                    })
                  }
                  isLoading={updateStatusMutation.isPending}
                >
                  Save Status
                </Button>
                {selectedDetail.status !== 'CANCELLED' && (
                  <Button
                    variant="destructive"
                    onClick={() => cancelOrderMutation.mutate(selectedDetail.id)}
                    isLoading={cancelOrderMutation.isPending}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No order selected.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
