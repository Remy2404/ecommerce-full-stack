'use client';

import { useEffect, useState } from 'react';
import { verifyPayment } from '@/services/payment.service';

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
  const [polling, setPolling] = useState(true);

  // Reset polling if MD5 changes (e.g., QR regenerated)
  useEffect(() => {
    setPolling(true);
  }, [md5]);

  useEffect(() => {
    if (!polling || !md5) return;

    // Check if QR is expired locally first
    const checkExpiration = () => {
      if (expiresAt) {
        const expirationTime = new Date(expiresAt).getTime();
        const now = new Date().getTime();
        if (now > expirationTime) {
          setPolling(false);
          return true;
        }
      }
      return false;
    };

    if (checkExpiration()) return;

    const pollInterval = setInterval(async () => {
      // Periodic expiration check
      if (checkExpiration()) {
        clearInterval(pollInterval);
        return;
      }

      try {
        const result = await verifyPayment(md5);

        if (result?.paid) {
          setPolling(false);
          clearInterval(pollInterval);
          onSuccess();
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [md5, polling, expiresAt, onSuccess]);

  return null;
}
