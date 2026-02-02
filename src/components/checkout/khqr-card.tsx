'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Info, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KhqrCardProps {
  qrString: string;
  amount: number;
  orderNumber: string;
  onRegenerate?: () => void;
}

/**
 * KhqrCard Component
 * Displays a Bakong KHQR code for payment with deep linking and branding.
 * Following Bakong Design Guidelines (20:29 Aspect Ratio).
 */
export function KhqrCard({ qrString, amount, orderNumber, onRegenerate }: KhqrCardProps) {
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
          dark: '#000000',
          light: '#ffffff',
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
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div 
        className="w-full max-w-[340px] bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col relative"
        style={{ aspectRatio: '20/29' }}
      >
        {/* Red Header - Bakong Identity */}
        <div className="bg-[#D32F2F] pt-6 pb-4 px-4 flex flex-col items-center">
          <div className="relative w-32 h-12 mb-1">
            <Image 
              src="/KHQR Logo red.svg" 
              alt="KHQR Logo" 
              fill
              className="object-contain brightness-0 invert" 
              priority
            />
          </div>
          <p className="text-white/80 text-[11px] font-medium tracking-wide uppercase">
            Scan to Pay Securely
          </p>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-between p-6 bg-white">
          {/* Amount Section */}
          <div className="text-center animate-in fade-in zoom-in duration-700 delay-200">
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
              Payment Amount
            </h3>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-gray-900 text-3xl font-extrabold">$</span>
              <p className="text-5xl font-black text-gray-900 tracking-tight leading-none">
                {amount.toFixed(2)}
              </p>
            </div>
            <p className="text-gray-400 text-[11px] mt-3 font-medium bg-gray-50 px-3 py-1 rounded-full inline-block">
              Order: #{orderNumber}
            </p>
          </div>

          {/* QR Code Container */}
          <div className="relative w-full aspect-square flex items-center justify-center border-[6px] border-[#D32F2F]/5 rounded-3xl p-4 bg-gray-50/50 shadow-inner group overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#D32F2F]" />
                <span className="text-xs text-gray-400 font-medium animate-pulse">Generating QR...</span>
              </div>
            ) : (
              qrDataUrl && (
                <div className={cn(
                  "relative w-full h-full p-2 bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-500",
                  isExpired ? "opacity-20 blur-sm grayscale" : "group-hover:scale-[1.02]"
                )}>
                  <Image 
                    src={qrDataUrl} 
                    alt="Payment QR Code" 
                    fill 
                    className="object-contain p-1"
                    priority
                    unoptimized
                  />
                  
                  {/* Bakong/KHQR Center Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-lg border-2 border-gray-50 p-1.5 flex items-center justify-center overflow-hidden">
                      <Image 
                        src="/KHQR Logo.png" 
                        alt="KHQR" 
                        width={32} 
                        height={32} 
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              )
            )}

            {/* Expired Overlay */}
            {isExpired && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] animate-in fade-in duration-300">
                <div className="bg-white/90 p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center gap-2">
                  <span className="text-rose-600 font-black text-xs uppercase tracking-widest">QR Expired</span>
                  <p className="text-[10px] text-gray-500 font-bold mb-1">Security timeout reached</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRegenerate}
                    className="h-9 px-4 rounded-xl border-[#D32F2F] text-[#D32F2F] hover:bg-rose-50 font-bold active:scale-95"
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Timer & Help */}
          <div className="w-full space-y-4 pt-4">
             <div className="flex items-center justify-between px-2 mb-1">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full animate-pulse",
                    isExpired ? "bg-gray-300" : "bg-emerald-500"
                  )} />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {isExpired ? 'Session Expired' : 'Secure Session Active'}
                  </span>
                </div>
                {!isExpired && (
                  <div className="bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-[#D32F2F] font-mono">{formatTime(timeLeft)}</span>
                  </div>
                )}
             </div>

             <Button 
                onClick={handleDeepLink}
                disabled={isExpired}
                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-2xl h-14 font-bold text-base transition-all active:scale-[0.98] shadow-xl shadow-rose-100 flex items-center justify-center gap-3 group disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
             >
                <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
                  <ExternalLink className="w-5 h-5" />
                </div>
                Open in Banking App
             </Button>
             
             <div className="flex flex-col items-center gap-1">
               <p className="text-[10px] text-gray-400 text-center px-4 leading-relaxed font-medium mt-1">
                  Compatible with Bakong, ABA, Wing, and all Microfinance apps.
               </p>
               <div className="h-1 w-8 bg-gray-100 rounded-full mt-2" />
             </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="bg-gray-50/80 backdrop-blur-sm p-4 border-t border-gray-100 flex items-center justify-center gap-3">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Powered by</span>
            <div className="relative w-20 h-5 opacity-70 hover:opacity-100 transition-opacity">
              <Image 
                src="/KHQR - digital payment.svg" 
                alt="Bakong" 
                fill
                className="object-contain" 
              />
            </div>
        </div>
      </div>
    </div>
  );
}
