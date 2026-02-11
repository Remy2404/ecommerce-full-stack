'use client';

import { Check, Package, MapPin, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { type CartItem } from '@/hooks/cart-context';
import { type ShippingAddress } from './shipping-form';
import { type PaymentData } from './payment-form';

interface OrderSummaryProps {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentData: PaymentData;
  subtotal: number;
  shippingFee?: number;
  tax?: number;
  discount?: number;
  promoCode?: string;
  promoMessage?: string;
  totalsAreEstimate?: boolean;
  onPromoCodeChange?: (value: string) => void;
  onApplyPromo?: () => void;
  onBack: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function OrderSummary({
  items,
  shippingAddress,
  paymentData,
  subtotal,
  shippingFee = 0,
  tax = 0,
  discount = 0,
  promoCode = '',
  promoMessage,
  totalsAreEstimate = false,
  onPromoCodeChange,
  onApplyPromo,
  onBack,
  onConfirm,
  isLoading,
}: OrderSummaryProps) {
  const total = subtotal + shippingFee + tax - discount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getPaymentMethodLabel = (method: PaymentData['method']) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'KHQR':
        return 'KHQR';
      case 'cash':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <div className="rounded-design border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Order Items ({items.length})</h3>
        </div>
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-design-sm bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="font-medium line-clamp-1">{item.name}</p>
                {item.variantName && (
                  <p className="text-sm text-muted-foreground">{item.variantName}</p>
                )}
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="rounded-design border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Shipping Address</h3>
        </div>
        <div className="p-4">
          <p className="font-medium">
            {shippingAddress.firstName} {shippingAddress.lastName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{shippingAddress.street}</p>
          <p className="text-sm text-muted-foreground">
            {shippingAddress.city}, {shippingAddress.province} {shippingAddress.postalCode}
          </p>
          <p className="text-sm text-muted-foreground">{shippingAddress.phone}</p>
          <p className="text-sm text-muted-foreground">{shippingAddress.email}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-design border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Payment Method</h3>
        </div>
        <div className="p-4">
          <p className="font-medium">{getPaymentMethodLabel(paymentData.method)}</p>
          {paymentData.method === 'card' && paymentData.cardNumber && (
            <p className="text-sm text-muted-foreground">
              •••• •••• •••• {paymentData.cardNumber.slice(-4)}
            </p>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="rounded-design border border-border bg-card p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between text-lg font-semibold">
              <span>{totalsAreEstimate ? 'Estimated Total' : 'Total'}</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
      {totalsAreEstimate && (
        <p className="text-xs text-muted-foreground">
          Final totals and discounts are confirmed by the backend during order creation.
        </p>
      )}

      {/* Promo Code */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter promo code"
          value={promoCode}
          onChange={(event) => onPromoCodeChange?.(event.target.value)}
          className="flex-1 h-11 rounded-design border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button variant="outline" onClick={onApplyPromo} type="button">
          Apply
        </Button>
      </div>
      {promoMessage && <p className="text-sm text-muted-foreground">{promoMessage}</p>}

      {/* Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Payment
        </Button>
        <Button size="lg" onClick={onConfirm} isLoading={isLoading}>
          <Check className="mr-2 h-5 w-5" />
          Confirm Order
        </Button>
      </div>
    </div>
  );
}
