'use client';

import { useState } from 'react';
import { MapPin, Truck } from 'lucide-react';
import { assignDeliveryDriver, getDeliveryStatus, updateDeliveryStatus } from '@/services/delivery.service';
import { type Delivery, type DeliveryStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const statusOptions: DeliveryStatus[] = [
  'PENDING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED',
];

export default function AdminDeliveryPage() {
  const [orderId, setOrderId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [status, setStatus] = useState<DeliveryStatus>('IN_TRANSIT');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!orderId) return;
    setLoading(true);
    setMessage(null);
    const result = await getDeliveryStatus(orderId);
    setLoading(false);
    setDelivery(result);

    if (!result) {
      setMessage('No delivery record found for this order.');
      return;
    }

    setStatus(result.status);
  };

  const handleAssignDriver = async () => {
    if (!delivery || !driverId) return;
    setLoading(true);
    try {
      await assignDeliveryDriver(delivery.id, driverId);
      toast.success('Driver assigned');
      await handleLookup();
    } catch {
      toast.error('Failed to assign driver');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!delivery) return;
    setLoading(true);
    try {
      await updateDeliveryStatus(delivery.id, status, notes);
      toast.success('Delivery status updated');
      await handleLookup();
    } catch {
      toast.error('Failed to update delivery status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Delivery Tracking</p>
        <h1 className="text-3xl font-semibold">Delivery Status</h1>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Input
            placeholder="Order ID"
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
          />
          <Button onClick={handleLookup} disabled={loading}>
            <Truck className="h-4 w-4" />
            Lookup Delivery
          </Button>
        </CardContent>
      </Card>

      {message && (
        <div className="rounded-design-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      {delivery && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 rounded-design border border-border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivery ID</span>
                  <span className="font-medium">{delivery.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span>{delivery.orderId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Driver ID</span>
                  <span>{delivery.driverId || 'Unassigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span>{delivery.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Notes</span>
                  <span>{delivery.driverNotes || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pickup</span>
                  <span>{delivery.pickupTime ? new Date(delivery.pickupTime).toLocaleString() : '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Delivered</span>
                  <span>{delivery.deliveredTime ? new Date(delivery.deliveredTime).toLocaleString() : '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground">Assign Driver</label>
                <Input
                  placeholder="Driver UUID"
                  value={driverId}
                  onChange={(event) => setDriverId(event.target.value)}
                />
                <Button variant="outline" className="w-full" onClick={handleAssignDriver} disabled={loading || !driverId}>
                  Assign Driver
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase text-muted-foreground">Update Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as DeliveryStatus)}
                  className="h-10 w-full rounded-design border border-input bg-background px-3 text-sm"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace('_', ' ')}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Driver notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  icon={<MapPin className="h-4 w-4" />}
                />
                <Button onClick={handleUpdateStatus} disabled={loading} className="w-full">
                  Save Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
