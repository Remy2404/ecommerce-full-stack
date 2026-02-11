'use client';

import { useEffect } from 'react';
import axios from 'axios';
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
    let consecutiveFailures = 0;
    let pollCount = 0;
    let pollInterval: NodeJS.Timeout;

    const startPolling = (intervalMs: number) => {
      if (pollInterval) clearInterval(pollInterval);
      
      pollInterval = setInterval(async () => {
        if (cancelled) {
          clearInterval(pollInterval);
          return;
        }

        // Periodic expiration check
        if (checkExpiration()) {
          clearInterval(pollInterval);
          return;
        }

        pollCount++;
        // Back-off strategy: Increase interval after 10 attempts (~30s-50s)
        if (pollCount === 11 && intervalMs === 3000) {
          clearInterval(pollInterval);
          startPolling(6000); // Slow down to 6 seconds
          return;
        }

        try {
          const result = await verifyPayment(md5);
          consecutiveFailures = 0;
          if (!result) return;

          if (result.isPaid) {
            clearInterval(pollInterval);
            if (cancelled) return;
            onSuccess();
            return;
          }

          // Semantic Pending Check - silently keep polling
          const isPending = /pending|processing|not found/i.test(result.message || '');
          if (isPending) {
            return;
          }

          const isExpired =
            result.expired === true ||
            /expired|time.?out|timed out/i.test(result.message || '');
          
          // Terminal failure should only be for definitive project-level errors
          const isTerminalFailure =
            /amount or currency mismatch|does not belong to you|unauthorized/i.test(
              result.message || ''
            );

          if (isExpired) {
            clearInterval(pollInterval);
            if (!cancelled) {
              toast.error(result.message || 'Transaction timed out. Please generate a new QR code.');
            }
            return;
          }

          if (isTerminalFailure) {
            clearInterval(pollInterval);
            if (!cancelled) {
              toast.error(result.message || 'Payment verification failed. Please check your order details.');
            }
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
          if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
            clearInterval(pollInterval);
            if (!cancelled) {
              toast.error('Session expired. Please sign in again.');
            }
            return;
          }

          if (axios.isAxiosError(error) && !error.response) {
            clearInterval(pollInterval);
            if (!cancelled) {
              toast.error('Network error while verifying payment. Please check your connection.');
            }
            return;
          }

          consecutiveFailures += 1;
          if (consecutiveFailures >= 5) {
            clearInterval(pollInterval);
            if (!cancelled) {
              toast.error('Payment verification is taking longer than expected. Please check your order history.');
            }
          }
        }
      }, intervalMs);
    };

    startPolling(3000); // Start with 3s interval

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [md5, expiresAt, onSuccess]);

  return null;
}
