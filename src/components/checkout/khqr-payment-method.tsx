'use client';

import React from 'react';
import Image from 'next/image';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Check } from 'lucide-react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface KhqrPaymentMethodProps {
  selected: boolean;
  onSelect: () => void;
}

/**
 * KhqrPaymentMethod Component
 * A premium selection card for KHQR payment method.
 */
export function KhqrPaymentMethod({ selected, onSelect }: KhqrPaymentMethodProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all duration-300 w-full',
        selected
          ? 'border-[#D32F2F] bg-rose-50/30 ring-4 ring-[#D32F2F]/10'
          : 'border-gray-100 hover:border-[#D32F2F]/30 hover:bg-gray-50'
      )}
    >
      <div
        className={cn(
          'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300',
        selected
          ? 'bg-[#D32F2F] text-white shadow-lg shadow-rose-200'
          : 'bg-white text-gray-500 border border-gray-100 group-hover:bg-[#D32F2F]/5 group-hover:text-[#D32F2F]'
        )}
      >
        <div className="relative w-10 h-10">
           <Image 
              src="/KHQR Logo.svg" 
              alt="KHQR" 
              fill 
              className={cn("object-contain", selected && "brightness-0 invert")}
           />
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
            <p className={cn("font-bold text-lg leading-tight transition-colors", selected ? "text-[#B71C1C]" : "text-gray-900")}>
                KHQR Payment
            </p>
            {selected && (
                <span className="bg-[#D32F2F] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Official
                </span>
            )}
        </div>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Scan to pay with any banking app
        </p>
      </div>

      <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Supports</span>
          <div className="flex -space-x-1.5 transition-all duration-300 group-hover:scale-110">
             <div className="w-5 h-5 rounded-full border border-white bg-white overflow-hidden shadow-sm">
                <Image src="/KHQR Logo.png" alt="Bakong" width={20} height={20} />
             </div>
             <div className="w-5 h-5 rounded-full border border-white bg-[#D32F2F] flex items-center justify-center shadow-sm">
                <span className="text-[6px] text-white font-black">QR</span>
             </div>
          </div>
      </div>

      {selected && (
        <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#D32F2F] text-white shadow-md animate-in zoom-in duration-300">
          <Check className="h-4 w-4 stroke-[3]" />
        </div>
      )}
    </button>
  );
}
