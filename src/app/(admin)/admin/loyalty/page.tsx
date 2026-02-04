'use client';

import { useEffect, useState } from 'react';
import { Gift, Sparkles } from 'lucide-react';
import { getPromotions, validatePromotion } from '@/services/promotion.service';
import { getWingPointsBalance, getWingPointTransactions } from '@/services/wing-points.service';
import { Promotion, WingPointTransaction, WingPoints } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminLoyaltyPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [points, setPoints] = useState<WingPoints | null>(null);
  const [transactions, setTransactions] = useState<WingPointTransaction[]>([]);
  const [promoQuery, setPromoQuery] = useState('');
  const [promoResult, setPromoResult] = useState<Promotion | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const results = await Promise.allSettled([
        getPromotions(),
        getWingPointsBalance(),
        getWingPointTransactions(0, 10)
      ]);

      if (!active) return;

      const [promoResult, balanceResult, txResult] = results;

      if (promoResult.status === 'fulfilled') {
        setPromotions(promoResult.value || []);
      } else {
        setStatus((prev) => prev || 'Unable to load promotions.');
      }

      if (balanceResult.status === 'fulfilled') {
        setPoints(balanceResult.value || null);
      } else {
        setStatus((prev) => prev || 'Unable to load Wing Points balance.');
      }

      if (txResult.status === 'fulfilled') {
        setTransactions(txResult.value?.transactions || []);
      } else {
        setStatus((prev) => prev || 'Unable to load Wing Points activity.');
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const formatCurrency = (value?: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  const handleValidate = async () => {
    if (!promoQuery) return;
    setStatus(null);
    const result = await validatePromotion(promoQuery);
    setPromoResult(result);
    if (!result) {
      setStatus('Promotion code not found or inactive.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Loyalty & Promotions</p>
        <h1 className="text-3xl font-semibold">Promotions and Wing Points</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage promotional activity and monitor Wing Points engagement.
        </p>
      </div>

      {status && (
        <div className="rounded-design-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {status}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Active Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-design border border-border">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Code</th>
                    <th className="px-4 py-3 text-left font-semibold">Discount</th>
                    <th className="px-4 py-3 text-left font-semibold">Minimum</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Ends</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {promotions.map((promo) => (
                    <tr key={promo.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{promo.code}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {promo.discountType === 'PERCENTAGE'
                          ? `${promo.discountValue}%`
                          : formatCurrency(promo.discountValue)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatCurrency(promo.minOrderAmount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={promo.isActive ? 'success' : 'secondary'}>
                          {promo.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                  {promotions.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={5}>
                        No promotions available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validate Promotion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Enter promo code"
              value={promoQuery}
              onChange={(event) => setPromoQuery(event.target.value)}
            />
            <Button onClick={handleValidate} className="w-full">
              <Sparkles className="h-4 w-4" />
              Validate Code
            </Button>
            {promoResult && (
              <div className="rounded-design-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="font-semibold">{promoResult.code}</p>
                <p className="text-muted-foreground">
                  {promoResult.discountType === 'PERCENTAGE'
                    ? `${promoResult.discountValue}% off`
                    : `${formatCurrency(promoResult.discountValue)} off`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Wing Points Balance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-design bg-primary/10 text-primary">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-semibold">{points?.balance ?? 0}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Balance shown for the active admin account.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Wing Points Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-design border border-border">
              <table className="min-w-[720px] w-full text-sm">
                <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Type</th>
                    <th className="px-4 py-3 text-left font-semibold">Amount</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium">{tx.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{tx.amount}</td>
                      <td className="px-4 py-3 text-muted-foreground">{tx.description || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={4}>
                        No Wing Points activity available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
