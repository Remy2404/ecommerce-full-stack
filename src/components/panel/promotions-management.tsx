'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Trash2 } from 'lucide-react';
import {
  createPromotion,
  deletePromotion,
  getPromotions,
  updatePromotion,
  type PromotionUpsertPayload,
} from '@/services/promotion.service';
import { type Promotion } from '@/types';
import { AdminDateTimePicker } from '@/components/admin/admin-datetime-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const defaultForm = (): PromotionUpsertPayload => ({
  code: '',
  name: '',
  description: '',
  type: 'PERCENTAGE',
  value: 0,
  minOrderAmount: 0,
  maxDiscount: 0,
  usageLimit: 1,
  perUserLimit: 1,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 86_400_000).toISOString(),
  isActive: true,
  applicableCategories: '',
  applicableMerchants: '',
});
const EMPTY_PROMOTIONS: Promotion[] = [];

export function PromotionsManagement() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [form, setForm] = useState<PromotionUpsertPayload>(defaultForm);

  const promotionsQuery = useQuery({
    queryKey: ['admin-promotions'],
    queryFn: getPromotions,
  });

  const createMutation = useMutation({
    mutationFn: createPromotion,
    onSuccess: () => {
      toast.success('Promotion created');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
    onError: () => toast.error('Failed to create promotion'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PromotionUpsertPayload> }) =>
      updatePromotion(id, payload),
    onSuccess: () => {
      toast.success('Promotion updated');
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
    onError: () => toast.error('Failed to update promotion'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePromotion(id),
    onSuccess: () => {
      toast.success('Promotion deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-promotions'] });
    },
    onError: () => toast.error('Failed to delete promotion'),
  });

  const promotions = promotionsQuery.data ?? EMPTY_PROMOTIONS;

  const rows = useMemo(
    () =>
      promotions.map((promotion) => ({
        ...promotion,
        discountDisplay:
          promotion.type === 'PERCENTAGE'
            ? `${promotion.value}%`
            : `$${promotion.value.toFixed(2)}`,
      })),
    [promotions]
  );

  const openCreate = () => {
    setEditingPromotion(null);
    setForm(defaultForm());
    setIsDialogOpen(true);
  };

  const openEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setForm({
      ...defaultForm(),
      code: promotion.code,
      name: promotion.name,
      description: promotion.description || '',
      type: promotion.type,
      value: promotion.value,
      minOrderAmount: promotion.minOrderAmount,
      maxDiscount: promotion.maxDiscount || 0,
      endDate: promotion.endDate,
      isActive: promotion.isActive,
    });
    setIsDialogOpen(true);
  };

  const submit = () => {
    if (!form.code || !form.name || !form.endDate) {
      toast.error('Code, name, and end date are required.');
      return;
    }

    const startAt = new Date(form.startDate).getTime();
    const endAt = new Date(form.endDate).getTime();
    if (!Number.isFinite(startAt) || !Number.isFinite(endAt)) {
      toast.error('Start and end date must be valid.');
      return;
    }

    if (endAt <= startAt) {
      toast.error('End date must be after start date.');
      return;
    }

    if (editingPromotion) {
      updateMutation.mutate({
        id: editingPromotion.id,
        payload: {
          ...form,
          startDate: form.startDate,
          endDate: form.endDate,
        },
      });
      return;
    }

    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Promotions</p>
          <h1 className="text-3xl font-semibold">Promotion Rules</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Promotion
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-design border border-border">
            <table className="min-w-[880px] w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Discount</th>
                  <th className="px-4 py-3 text-left font-semibold">Min Order</th>
                  <th className="px-4 py-3 text-left font-semibold">End Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium">{promotion.code}</td>
                    <td className="px-4 py-3">{promotion.name}</td>
                    <td className="px-4 py-3">{promotion.discountDisplay}</td>
                    <td className="px-4 py-3">${promotion.minOrderAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(promotion.endDate).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${promotion.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        {promotion.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(promotion)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(promotion.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No promotions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPromotion ? 'Edit Promotion' : 'Create Promotion'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Code</label>
                <Input value={form.code} onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Name</label>
                <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Description</label>
              <Textarea value={form.description || ''} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} rows={3} />
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Type</label>
                <select
                  value={form.type}
                  onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as PromotionUpsertPayload['type'] }))}
                  className="h-11 w-full rounded-design border border-input bg-background px-3 text-sm"
                >
                  <option value="PERCENTAGE">PERCENTAGE</option>
                  <option value="FIXED_AMOUNT">FIXED_AMOUNT</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Value</label>
                <Input type="number" step="0.01" min="0" value={form.value} onChange={(event) => setForm((prev) => ({ ...prev, value: Number(event.target.value) }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Min Order</label>
                <Input type="number" step="0.01" min="0" value={form.minOrderAmount || 0} onChange={(event) => setForm((prev) => ({ ...prev, minOrderAmount: Number(event.target.value) }))} />
              </div>
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Max Discount</label>
                <Input type="number" step="0.01" min="0" value={form.maxDiscount || 0} onChange={(event) => setForm((prev) => ({ ...prev, maxDiscount: Number(event.target.value) }))} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminDateTimePicker
                label="Start Date"
                valueIso={form.startDate}
                onChangeIso={(startDate) => setForm((prev) => ({ ...prev, startDate }))}
                required
              />
              <AdminDateTimePicker
                label="End Date"
                valueIso={form.endDate}
                onChangeIso={(endDate) => setForm((prev) => ({ ...prev, endDate }))}
                minIso={form.startDate}
                rangeStartIso={form.startDate}
                showRangePreview={true}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={Boolean(form.isActive)} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
              Active
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={submit} isLoading={createMutation.isPending || updateMutation.isPending}>
                {editingPromotion ? 'Update Promotion' : 'Create Promotion'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
