'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
  setDefaultPaymentMethod,
} from '@/services/payment-method.service';
import { SavedPaymentMethod } from '@/types/user';

const DEFAULT_FORM = {
  method: 'CARD',
  brand: '',
  last4: '',
  expMonth: '',
  expYear: '',
  providerToken: '',
  isDefault: false,
};

export function PaymentMethodsTab() {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getPaymentMethods();
        setMethods(data);
      } catch (error) {
        toast.error('Failed to load payment methods');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const handleCreate = async () => {
    if (!form.method || !form.providerToken) {
      toast.error('Method and provider token are required');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createPaymentMethod({
        method: form.method,
        brand: form.brand || undefined,
        last4: form.last4 || undefined,
        expMonth: form.expMonth ? Number(form.expMonth) : undefined,
        expYear: form.expYear ? Number(form.expYear) : undefined,
        providerToken: form.providerToken,
        isDefault: form.isDefault,
      });
      setMethods((prev) => [...prev, created]);
      setForm({ ...DEFAULT_FORM });
      toast.success('Payment method saved');
    } catch (error) {
      toast.error('Failed to save payment method');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePaymentMethod(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      toast.success('Payment method deleted');
    } catch (error) {
      toast.error('Failed to delete payment method');
    }
  };

  const handleDefault = async (id: string) => {
    try {
      const updated = await setDefaultPaymentMethod(id);
      setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === updated.id })));
      toast.success('Default payment method updated');
    } catch (error) {
      toast.error('Failed to set default payment method');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved Payment Methods</CardTitle>
          <CardDescription>Manage your saved cards and payment methods.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : methods.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved payment methods yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {methods.map((method) => (
                <div key={method.id} className="rounded-design border border-border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{method.brand || method.method}</p>
                      {method.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <div className="flex gap-2">
                      {!method.isDefault && (
                        <Button size="sm" variant="outline" onClick={() => handleDefault(method.id)}>
                          Set Default
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(method.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {method.last4 ? `**** ${method.last4}` : method.method}
                  </p>
                  {method.expMonth && method.expYear && (
                    <p className="text-xs text-muted-foreground">Exp {method.expMonth}/{method.expYear}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Payment Method</CardTitle>
          <CardDescription>Save a payment method for faster checkout.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Method</Label>
              <Input value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Last 4</Label>
              <Input value={form.last4} onChange={(e) => setForm({ ...form, last4: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Exp Month</Label>
              <Input value={form.expMonth} onChange={(e) => setForm({ ...form, expMonth: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Exp Year</Label>
              <Input value={form.expYear} onChange={(e) => setForm({ ...form, expYear: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Provider Token</Label>
            <Input value={form.providerToken} onChange={(e) => setForm({ ...form, providerToken: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default
          </label>
          <Button onClick={handleCreate} isLoading={isSaving}>Save Payment Method</Button>
        </CardContent>
      </Card>
    </div>
  );
}
