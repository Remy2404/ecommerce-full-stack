'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, QrCode, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createKHQR, verifyPayment } from '@/services/payment.service';
import type { KHQRResult, KHQRVerificationResponse } from '@/types/payment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type PaymentsManagementProps = {
  role: 'ADMIN' | 'MERCHANT';
};

export function PaymentsManagement({ role }: PaymentsManagementProps) {
  const [orderId, setOrderId] = useState('');
  const [md5, setMd5] = useState('');
  const [qrResult, setQrResult] = useState<KHQRResult | null>(null);
  const [verification, setVerification] = useState<KHQRVerificationResponse | null>(null);

  const readOnly = role === 'MERCHANT';

  const generateMutation = useMutation({
    mutationFn: createKHQR,
    onSuccess: (result) => {
      if (!result) {
        toast.error('Unable to generate QR');
        return;
      }
      setQrResult(result);
      setMd5(result.md5);
      setVerification(null);
      toast.success('KHQR generated');
    },
    onError: () => toast.error('Failed to generate KHQR'),
  });

  const verifyMutation = useMutation({
    mutationFn: verifyPayment,
    onSuccess: (result) => {
      if (!result) {
        toast.error('Unable to verify payment');
        return;
      }
      setVerification(result);
      toast.success(result.isPaid ? 'Payment verified as paid' : 'Payment not completed yet');
    },
    onError: () => toast.error('Verification request failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Payments</p>
        <h1 className="text-3xl font-semibold">KHQR Payment Center</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {readOnly
            ? 'Merchant access is read-only. You can verify payment status using MD5.'
            : 'Generate KHQR codes and verify payment settlements.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Generate KHQR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Order ID"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              disabled={readOnly}
            />
            <Button
              disabled={!orderId || readOnly}
              onClick={() => generateMutation.mutate(orderId)}
              isLoading={generateMutation.isPending}
            >
              <QrCode className="h-4 w-4" />
              Generate QR
            </Button>
            {readOnly && (
              <p className="text-xs text-muted-foreground">
                QR generation is restricted to admin users.
              </p>
            )}

            {qrResult && (
              <div className="rounded-design border border-border p-4">
                <div className="flex justify-center">
                  <QRCodeSVG value={qrResult.qrString} size={220} includeMargin />
                </div>
                <p className="mt-3 break-all text-xs text-muted-foreground">MD5: {qrResult.md5}</p>
                <p className="text-xs text-muted-foreground">
                  Expires: {qrResult.expiresAt ? new Date(qrResult.expiresAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verify Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Payment MD5 hash" value={md5} onChange={(event) => setMd5(event.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!md5}
                onClick={() => verifyMutation.mutate(md5)}
                isLoading={verifyMutation.isPending}
              >
                Verify
              </Button>
              <Button
                variant="outline"
                disabled={!md5 || verifyMutation.isPending}
                onClick={() => verifyMutation.mutate(md5)}
              >
                <RotateCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>

            {verifyMutation.isPending && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking payment status...
              </p>
            )}

            {verification && (
              <div className="rounded-design border border-border p-4 text-sm">
                <p className="font-semibold">
                  Status: {verification.isPaid ? 'PAID' : verification.expired ? 'EXPIRED' : 'PENDING'}
                </p>
                <p className="mt-2 text-muted-foreground">Amount: {verification.paidAmount || 0} {verification.currency}</p>
                <p className="mt-1 text-muted-foreground">{verification.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
