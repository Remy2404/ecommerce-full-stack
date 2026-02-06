'use client';

import { useState } from 'react';
import { MapPin, Truck } from 'lucide-react';
import { getDeliveryStatus, updateDeliveryStatus } from '@/services/delivery.service';
import { Delivery, DeliveryStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusOptions: DeliveryStatus[] = [
  'PENDING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED'
];

export default function AdminDeliveryPage() {
  const [orderId, setOrderId] = useState('');
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [status, setStatus] = useState<DeliveryStatus>('IN_TRANSIT');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!orderId) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await getDeliveryStatus(orderId);
      setDelivery(result);
      if (result) {
        setStatus(result.status);
      } else {
        setMessage('No delivery record found for this order.');
      }
    } catch (err) {
      setMessage('Unable to fetch delivery information.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!delivery) return;
    setLoading(true);
    setMessage(null);
    try {
      await updateDeliveryStatus(delivery.id, status, notes);
      setMessage('Delivery status updated.');
    } catch (err) {
      setMessage('Failed to update delivery status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Delivery Tracking</p>
        <h1 className="text-3xl font-semibold">Delivery Status</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Lookup an order delivery and adjust status updates in real time.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 pt-6">
          <Input
            placeholder="Enter order ID"
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
              <div>
                <p className="text-xs uppercase text-muted-foreground">Delivery ID</p>
                <p className="text-sm font-semibold">{delivery.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Order ID</p>
                <p className="text-sm">{delivery.orderId}</p>
              </div>
              <div className="grid gap-3 rounded-design border border-border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{delivery.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Carrier</span>
                  <span>{delivery.carrier || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tracking</span>
                  <span>{delivery.trackingNumber || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ETA</span>
                  <span>{delivery.estimatedArrival || '—'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="text-xs uppercase text-muted-foreground">New Status</label>
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
                placeholder="Update notes or location"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                icon={<MapPin className="h-4 w-4" />}
              />
              <Button onClick={handleUpdate} disabled={loading} className="w-full">
                Save Update
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
