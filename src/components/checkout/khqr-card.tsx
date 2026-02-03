'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KHQR_COLORS } from '@/constants';

/**
 * Format amount as USD currency
 * @param amount - The amount to format
 * @returns Formatted string like "5.00 USD" or "199.99 USD"
 */
export function formatUSD(amount: number): string {
  return `${amount.toFixed(2)} USD`;
}

interface KhqrCardProps {
  /** QR code data string */
  qrString: string;
  /** MD5 transaction hash */
  md5: string;
  /** Order total amount in USD */
  amount: number;
  /** Order number/reference */
  orderNumber: string;
  /** QR Expiration Timestamp (ISO string) */
  expiresAt?: string;
  /** Optional callback to regenerate QR code */
  onRegenerate?: () => Promise<void>;
}

/**
 * Official KHQR Card Component
 * Displays a payment card matching the official KHQR layout with:
 * - Red header with KHQR logo
 * - Merchant name and order information
 * - USD-only currency display
 * - Centered QR code (no decorations)
 * - Accessibility features
 * 
 * @example
 * ```tsx
 * <KhqrCard
 *   qrString="khqr://payment/..."
 *   md5="a1b2c3d4..."
 *   amount={25.50}
 *   orderNumber="ORD-20260203-001"
 *   onRegenerate={async () => {
 *     // Fetch new QR code
 *   }}
 * />
 * ```
 */
export function KhqrCard({
  qrString,
  md5,
  amount,
  orderNumber,
  expiresAt,
  onRegenerate,
}: KhqrCardProps) {
  /* Expiration Logic */
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Validation: Amount must be greater than zero
  if (amount <= 0) {
    throw new Error('Amount must be greater than zero');
  }

  const handleRegenerate = async () => {
    if (!onRegenerate || isRegenerating) return;
    
    setIsRegenerating(true);
    try {
      await onRegenerate();
    } catch (error) {
      console.error('Failed to regenerate QR code:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  React.useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const expirationTime = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const difference = expirationTime - now;

      if (difference <= 0) {
        setTimeLeft('00:00');
        setIsExpired(true);
        // Normally we'd stop polling here, handled by parent via isExpired check if passed up
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      setIsExpired(false);
    };

    calculateTimeLeft(); // Initial call
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return (
    <div className="w-full max-w-[360px] mx-auto">
      <div className="rounded-3xl overflow-hidden shadow-2xl bg-white border border-gray-100">
        {/* Red Header with KHQR Logo */}
        <div 
          className="relative h-24 flex items-center justify-center"
          style={{ backgroundColor: KHQR_COLORS.BRAND }}
        >
          {/* KHQR Logo */}
          <div className="relative w-32 h-12">
            <Image
              src="/KHQR Logo red.svg"
              alt="KHQR"
              fill
              className="object-contain brightness-0 invert"
              priority
            />
          </div>
          
          {/* Optional Regenerate Button */}
          {onRegenerate && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Regenerate QR Code"
              title="Regenerate QR Code"
            >
              <RefreshCw 
                className={`w-4 h-4 text-white ${isRegenerating ? 'animate-spin' : ''}`} 
              />
            </button>
          )}
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-6">
          {/* Merchant Name and Order ID */}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-gray-900">
              MyStore
            </h3>
            <p className="text-xs text-gray-500">
              Order: {orderNumber}
            </p>
          </div>

          {/* Amount Display - USD Only */}
          <div className="space-y-1">
            <p className="text-[28px] font-bold text-gray-900 leading-none">
              {formatUSD(amount)}
            </p>
          </div>

          {/* Expiration Timer or Expired Message */}
          {expiresAt && (
             <div className={`text-center py-1 rounded-lg ${isExpired ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-600'}`}>
               {isExpired ? (
                 <p className="text-sm font-medium">QR Code Expired</p>
               ) : (
                 <p className="text-sm">
                   Expires in: <span className="font-mono font-medium">{timeLeft}</span>
                 </p>
               )}
             </div>
          )}

          {/* QR Code - Centered, No Decorations */}
          <div className="flex items-center justify-center py-4 relative">
             {isExpired && (
                <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                   <p className="text-sm font-medium text-gray-500 mb-2">QR Code Invalid</p>
                   {onRegenerate && (
                     <Button 
                       size="sm" 
                       variant="outline" 
                       onClick={handleRegenerate}
                       className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-700"
                     >
                       Regenerate
                     </Button>
                   )}
                </div>
             )}
            <div className={`bg-white p-4 rounded-2xl border-2 border-gray-100 transition-opacity ${isExpired ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
              <QRCodeSVG
                value={qrString}
                size={230}
                level="H"
                includeMargin={false}
                className="block"
                aria-label="KHQR Payment Code"
              />
            </div>
          </div>

          {/* Transaction ID */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-500 uppercase tracking-wider">
              Transaction ID
            </span>
            <code className="font-mono font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
              {md5.slice(0, 8)}...{md5.slice(-4)}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
