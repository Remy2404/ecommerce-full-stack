'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Info, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { KHQR_COLORS } from '@/constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KhqrCardProps {
  qrString: string;
  amount: number;
  orderNumber: string;
  md5?: string;
  currency?: string;
  onRegenerate?: () => void;
}

/**
 * KhqrCard Component
 * Displays a Bakong KHQR code for payment with deep linking and branding.
 * Following Bakong Design Guidelines (20:29 Aspect Ratio).
 */
export function KhqrCard({ qrString, amount, orderNumber, md5, currency = 'USD', onRegenerate }: KhqrCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (qrString) {
      QRCode.toDataURL(qrString, {
        width: 600, // Higher res for better scanning
        margin: 1,
        color: {
          dark: KHQR_COLORS.BLACK,
          light: KHQR_COLORS.WHITE,
        },
      })
        .then((url) => {
          setQrDataUrl(url);
          setLoading(false);
        })
        .catch((err) => {
          console.error('QR Generation Error:', err);
          setLoading(false);
        });
    }
  }, [qrString]);

  // Deep link for mobile users to open Bakong or other banking apps
  const handleDeepLink = () => {
    if (!qrString) return;
    // Standard Bakong deep link format
    const deepLink = `bakong://pay?qr=${encodeURIComponent(qrString)}`;
    window.location.href = deepLink;
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KHQR Card Standardized Interface (20:29 Aspect Ratio) */}
      <div 
        className="w-full max-w-[300px] bg-white rounded-[1.5rem] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-border flex flex-col relative group mx-auto"
        style={{ aspectRatio: '20/29' }}
      >
        
        {/* Header - Exactly 12% of height */}
        <div className="h-[12%] flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: KHQR_COLORS.BRAND }}>
          {/* Slashed black background for branding */}
          <div 
            className="absolute inset-0 bg-black" 
            style={{ 
              clipPath: 'polygon(0 0, 45% 0, 35% 100%, 0% 100%)',
              opacity: 0.9
            }} 
          />
          <div className="relative z-10 w-[35%] h-[55%] -translate-x-full -ml-[15%]">
             <Image src="/KHQR Logo.svg" alt="KHQR" fill className="object-contain brightness-0 invert" />
          </div>
        </div>

        {/* Info & Content Section */}
        <div className="flex-1 flex flex-col pt-6">
          {/* Receiver & Amount Section (Top) */}
          <div className="px-8 space-y-1">
             <div className="text-center">
                <p className="text-[10px] font-bold text-black/40 truncate uppercase tracking-[0.15em] leading-tight mb-1">
                  Receiver Name
                </p>
                <h3 className="text-sm font-black text-black truncate uppercase leading-tight tracking-tight">
                  {orderNumber || "Merchant Name"}
                </h3>
             </div>
             
             <div className="text-center pt-3">
                <div className="flex items-baseline justify-center gap-1.5">
                   <span className="text-2xl font-black text-black tracking-tighter">
                     {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                   <span className="text-[10px] font-black text-black/40 uppercase tracking-wider">
                     {currency}
                   </span>
                </div>
             </div>
          </div>

          {/* Dotted Separator - Closer to amount */}
          <div className="flex items-center px-10 pt-4">
             <div className="flex-1 border-t-2 border-dashed border-gray-100" />
          </div>

          {/* QR Code Container (Strict Margins: 8% Top/Bottom, 10% Left/Right) */}
          <div className="flex-1 flex items-center justify-center p-[10%] pt-[8%] pb-[10%]">
             <div className="relative w-full aspect-square bg-white flex items-center justify-center">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: KHQR_COLORS.BRAND }} />
                ) : (
                  <div className={cn("relative w-full h-full p-1 border border-gray-50 rounded-xl transition-all duration-500", isExpired && "opacity-20 grayscale")}>
                    <Image src={qrDataUrl} alt="KHQR Code" fill className="object-contain" />
                    {/* Central branding for scanners - Precise Circle with Border */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div 
                        className="w-[18%] aspect-square rounded-full shadow-lg border-[2px] flex items-center justify-center"
                        style={{ 
                          backgroundColor: KHQR_COLORS.BLACK, 
                          borderColor: KHQR_COLORS.WHITE,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                         <span className="text-white font-black text-[14px] leading-none mb-0.5">៛</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {isExpired && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-4 text-center">
                    <Info className="w-6 h-6 text-destructive mb-1" />
                    <span className="text-[10px] font-bold text-destructive uppercase">Expired</span>
                    <button 
                      onClick={onRegenerate}
                      className="mt-2 text-[10px] font-black text-primary hover:underline underline-offset-2"
                    >
                      Regenerate
                    </button>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Footer Branding (Adjusted to be compact) */}
        <div className="px-6 pb-6 flex flex-col items-center gap-2">
            <span className="text-[9px] font-black text-black/30 uppercase tracking-[0.25em]">
              Scan • Pay • Done
            </span>
            <div className="relative w-20 h-5 grayscale opacity-80">
              <Image 
                src="/KHQR - digital payment.svg" 
                alt="KHQR" 
                fill
                className="object-contain" 
              />
            </div>
        </div>
      </div>
    </div>
  );
}
