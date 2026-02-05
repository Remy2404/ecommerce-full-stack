'use client';

import { useState } from 'react';
import { CreditCard, Wallet, Banknote, Lock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, FormField, Label } from '@/components/ui/input';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { KhqrPaymentMethod } from './khqr-payment-method';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export type PaymentMethod = 'card' | 'KHQR' | 'cash';

export interface PaymentData {
  method: PaymentMethod;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  cardName?: string;
}

interface PaymentFormProps {
  onSubmit: (payment: PaymentData) => void;
  onBack: () => void;
  isLoading?: boolean;
  total: number;
}

const paymentMethods = [
  {
    id: 'card' as const,
    label: 'Credit / Debit Card',
    description: 'Visa, Mastercard, JCB',
    icon: CreditCard,
  },
  {
    id: 'KHQR' as const,
    label: 'KHQR Payment',
    description: 'Pay with any banking app',
    icon: Wallet,
  },
  {
    id: 'cash' as const,
    label: 'Cash on Delivery',
    description: 'Pay when you receive',
    icon: Banknote,
  },
];

export function PaymentForm({ onSubmit, onBack, isLoading, total }: PaymentFormProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '');
    }
    return v;
  };

  const handleCardChange = (field: keyof typeof cardData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'cardExpiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cardCvc') {
      formattedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    }

    setCardData((prev) => ({ ...prev, [field]: formattedValue }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    if (selectedMethod !== 'card') return true;

    const newErrors: Record<string, string> = {};
    const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');

    if (!cardNumberClean || cardNumberClean.length < 16) {
      newErrors.cardNumber = 'Valid card number required';
    }
    if (!cardData.cardExpiry || cardData.cardExpiry.length < 5) {
      newErrors.cardExpiry = 'Valid expiry required';
    }
    if (!cardData.cardCvc || cardData.cardCvc.length < 3) {
      newErrors.cardCvc = 'Valid CVC required';
    }
    if (!cardData.cardName.trim()) {
      newErrors.cardName = 'Cardholder name required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({
        method: selectedMethod,
        ...(selectedMethod === 'card' && cardData),
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Methods */}
      <div className="space-y-3">
        <Label>Payment Method</Label>
        <div className="grid gap-3">
          {paymentMethods.map((method) => (
            method.id === 'KHQR' ? (
              <KhqrPaymentMethod 
                key={method.id}
                selected={selectedMethod === 'KHQR'}
                onSelect={() => setSelectedMethod('KHQR')}
              />
            ) : (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  'relative flex items-center gap-4 rounded-design border p-4 text-left transition-all',
                  selectedMethod === method.id
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-design-sm',
                    selectedMethod === method.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <method.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{method.label}</p>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                {selectedMethod === method.id && (
                  <div className="absolute right-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            )
          ))}
        </div>
      </div>

      {/* Card Details */}
      {selectedMethod === 'card' && (
        <div className="space-y-4 rounded-design border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Your card details are secure and encrypted</span>
          </div>

          <FormField label="Card Number" error={errors.cardNumber} required>
            <Input
              value={cardData.cardNumber}
              onChange={(e) => handleCardChange('cardNumber', e.target.value)}
              error={!!errors.cardNumber}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              icon={<CreditCard className="h-4 w-4" />}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Expiry Date" error={errors.cardExpiry} required>
              <Input
                value={cardData.cardExpiry}
                onChange={(e) => handleCardChange('cardExpiry', e.target.value)}
                error={!!errors.cardExpiry}
                placeholder="MM/YY"
                maxLength={5}
              />
            </FormField>
            <FormField label="CVC" error={errors.cardCvc} required>
              <Input
                type="password"
                value={cardData.cardCvc}
                onChange={(e) => handleCardChange('cardCvc', e.target.value)}
                error={!!errors.cardCvc}
                placeholder="•••"
                maxLength={4}
              />
            </FormField>
          </div>

          <FormField label="Cardholder Name" error={errors.cardName} required>
            <Input
              value={cardData.cardName}
              onChange={(e) => handleCardChange('cardName', e.target.value)}
              error={!!errors.cardName}
              placeholder="John Doe"
            />
          </FormField>
        </div>
      )}


      {/* Cash on Delivery Info */}
      {selectedMethod === 'cash' && (
        <div className="rounded-design border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Please have {formatPrice(total)} ready when your order arrives. 
            Our delivery partner will collect the payment upon delivery.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Shipping
        </Button>
        <Button type="submit" size="lg" isLoading={isLoading}>
          {selectedMethod === 'cash' 
            ? 'Place Order' 
            : `Pay ${formatPrice(total)}`
          }
        </Button>
      </div>
    </form>
  );
}
