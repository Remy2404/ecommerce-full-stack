'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { createAddress, deleteAddress, getAddresses, setDefaultAddress, updateAddress } from '@/services/address.service';
import { Address } from '@/types/address';

const DEFAULT_FORM = {
  label: 'home',
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'Cambodia',
  isDefault: false,
};

export function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getAddresses();
        setAddresses(data);
      } catch (error) {
        toast.error('Failed to load addresses');
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const isValid = () => {
    if (!form.fullName || !form.phone || !form.street || !form.city || !form.state || !form.postalCode || !form.country) {
      return false;
    }
    if (!/^[-+()\d\s]{6,}$/.test(form.phone)) return false;
    if (form.postalCode.length < 3) return false;
    return true;
  };

  const handleSave = async () => {
    if (!isValid()) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await updateAddress(editingId, {
          ...form,
          label: form.label as 'home' | 'office' | 'other',
        } as any);
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        toast.success('Address updated');
      } else {
        const created = await createAddress({
          ...form,
          label: form.label as 'home' | 'office' | 'other',
        } as any);
        setAddresses((prev) => [...prev, created]);
        toast.success('Address saved');
      }
      setForm({ ...DEFAULT_FORM });
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleDefault = async (id: string) => {
    try {
      const updated = await setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === updated.id })));
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to set default address');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saved Addresses</CardTitle>
          <CardDescription>Manage your shipping addresses.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-design border border-border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{address.fullName}</p>
                      {address.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(address.id);
                          setForm({
                            label: address.label || 'home',
                            fullName: address.fullName,
                            phone: address.phone,
                            street: address.street,
                            city: address.city,
                            state: address.state || '',
                            postalCode: address.postalCode,
                            country: address.country,
                            isDefault: address.isDefault,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      {!address.isDefault && (
                        <Button size="sm" variant="outline" onClick={() => handleDefault(address.id)}>
                          Set Default
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(address.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{address.phone}</p>
                  <p className="text-sm text-muted-foreground">
                    {address.street}, {address.city}, {address.state} {address.postalCode}, {address.country}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{address.label}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Address' : 'Add New Address'}</CardTitle>
          <CardDescription>Save a shipping address for faster checkout.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Street</Label>
            <Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>State/Province</Label>
              <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Postal Code</Label>
              <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Label (home, office, other)</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
            />
            Set as default
          </label>
          <div className="flex gap-2">
            <Button onClick={handleSave} isLoading={isSaving}>
              {editingId ? 'Update Address' : 'Save Address'}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  setForm({ ...DEFAULT_FORM });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
