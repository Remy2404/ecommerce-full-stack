'use client';

import { useEffect } from 'react';
import { verifyPayment } from '@/services/payment.service';
import { toast } from 'sonner';

interface PaymentStatusListenerProps {
  md5: string;
  expiresAt?: string;
  onSuccess: () => void;
}

export function PaymentStatusListener({
  md5,
  expiresAt,
  onSuccess,
}: PaymentStatusListenerProps) {
  useEffect(() => {
    if (!md5) return;

    // Check if QR is expired locally first
    const checkExpiration = () => {
      if (expiresAt) {
        const expirationTime = new Date(expiresAt).getTime();
        const now = new Date().getTime();
        if (now > expirationTime) return true;
      }
      return false;
    };

    if (checkExpiration()) return;

    let cancelled = false;
    const pollInterval = setInterval(async () => {
      // Periodic expiration check
      if (checkExpiration()) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const result = await verifyPayment(md5);
        if (!result) return;

        if (result.paid) {
          clearInterval(pollInterval);
          if (cancelled) return;
          onSuccess();
          return;
        }

        const isExpired =
          result.expired === true ||
          /expired|time.?out|timed out/i.test(result.message || '');

        if (isExpired) {
          clearInterval(pollInterval);
          if (!cancelled) {
            toast.error(result.message || 'Transaction timed out. Please generate a new QR code.');
          }
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      cancelled = true;
      clearInterval(pollInterval);
    };
  }, [md5, expiresAt, onSuccess]);

  return null;
}
