'use client';

import { useEffect, useRef } from 'react';
import { verifyPayment } from '@/services/payment.service';
import { toast } from 'sonner';

interface PaymentStatusListenerProps {
  md5: string;
  onSuccess: () => void;
  interval?: number; 
}

/**
 * PaymentStatusListener Component
 * Auto-polls the backend for payment status and triggers success callback.
 */
export function PaymentStatusListener({ md5, onSuccess, interval = 3000 }: PaymentStatusListenerProps) {
  const isPollingRef = useRef(true);

  useEffect(() => {
    if (!md5) return;

    let timer: NodeJS.Timeout;

    const checkStatus = async () => {
      if (!isPollingRef.current) return;

      try {
        const response = await verifyPayment(md5);
        
        if (response?.isPaid) {
          isPollingRef.current = false;
          toast.success('Payment Received!', {
            description: `Payment confirmed. Thank you!`,
          });
          onSuccess();
          return;
        }

        // Continue polling if not paid
        timer = setTimeout(checkStatus, interval);
      } catch (error) {
        console.error('KHQR Polling error:', error);
        // Only retry if we are still polling
        if (isPollingRef.current) {
          timer = setTimeout(checkStatus, interval);
        }
      }
    };

    checkStatus();

    return () => {
      isPollingRef.current = false;
      if (timer) clearTimeout(timer);
    };
  }, [md5, onSuccess, interval]);

  return null;
}
