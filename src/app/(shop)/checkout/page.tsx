'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, CheckCircle2, X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutStepper, CheckoutStepperMobile, CheckoutStep } from '@/components/checkout/checkout-stepper';
import { ShippingForm, ShippingAddress } from '@/components/checkout/shipping-form';
import { PaymentForm, PaymentData } from '@/components/checkout/payment-form';
import { OrderSummary } from '@/components/checkout/order-summary';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/cart-context';
import { cancelOrder as cancelOrderRequest, createOrder as createOrderRequest } from '@/services/order.service';
import { AuthGuard } from '@/components/providers/auth-guard';
import { KHQR_COLORS } from '@/constants';
import { KhqrCard } from '@/components/checkout/khqr-card';
import { PaymentStatusListener } from '@/components/checkout/payment-status-listener';
import { createKHQR } from '@/services/payment.service';
import { createAddress, getAddresses } from '@/services/address.service';
import { KHQRResult } from '@/types/payment';
import { toast } from 'sonner';
import { SHIPPING_CONFIG } from '@/constants';
import { validatePromotion } from '@/services/promotion.service';
import type { Promotion } from '@/types';
import {
  buildCheckoutFingerprint,
  getOrCreateCheckoutAttemptSeed,
  clearCheckoutAttemptSeed,
  groupItemsByMerchantDeterministic,
  buildCheckoutIdempotencyKey,
} from '@/lib/checkout-attempt';

type CheckoutCreatedOrder = { orderId: string; orderNumber: string; total: number };

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutPageContent />
    </AuthGuard>
  );
}

function CheckoutPageContent() {
  // const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]);
  const [orderId, setOrderId] = useState<string>('');

  // Form data states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);

  // KHQR Payment states
  const [khqrResult, setKhqrResult] = useState<KHQRResult | null>(null);
  const [showKhqrModal, setShowKhqrModal] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | undefined>(undefined);
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [promoMessage, setPromoMessage] = useState<string>('');
  const [khqrOrders, setKhqrOrders] = useState<CheckoutCreatedOrder[]>([]);
  const [createdCheckoutOrders, setCreatedCheckoutOrders] = useState<CheckoutCreatedOrder[]>([]);
  const [partialCheckoutMessage, setPartialCheckoutMessage] = useState('');
  const [currentKhqrIndex, setCurrentKhqrIndex] = useState(0);
  const [isCancellingKhqr, setIsCancellingKhqr] = useState(false);

  const clearCheckoutAttemptState = () => {
    clearCheckoutAttemptSeed();
    setCreatedCheckoutOrders([]);
    setPartialCheckoutMessage('');
  };

  const openKhqrForOrder = async (order: CheckoutCreatedOrder) => {
    const khqr = await createKHQR(order.orderId);
    if (!khqr) {
      return false;
    }

    setKhqrResult(khqr);
    setOrderId(order.orderId);
    setOrderNumber(order.orderNumber);
    setOrderTotal(order.total);
    setShowKhqrModal(true);
    return true;
  };

  const cancelPendingKhqrOrders = async () => {
    if (isCancellingKhqr) return;

    setIsCancellingKhqr(true);
    try {
      const pendingOrders = khqrOrders.slice(currentKhqrIndex);
      let cancelledCount = 0;

      for (const pendingOrder of pendingOrders) {
        const result = await cancelOrderRequest(pendingOrder.orderId);
        if (result.success) {
          cancelledCount += 1;
        }
      }

      setShowKhqrModal(false);
      setKhqrResult(null);
      setKhqrOrders([]);
      setCurrentKhqrIndex(0);
      clearCheckoutAttemptState();

      if (cancelledCount > 0) {
        toast.success(`${cancelledCount} pending order(s) cancelled.`);
      } else {
        toast.info('Payment closed. No pending orders were cancelled.');
      }
    } catch (error) {
      console.error('Failed to cancel pending KHQR orders:', error);
      toast.error('Failed to cancel pending orders. Please check your order history.');
    } finally {
      setIsCancellingKhqr(false);
    }
  };

  const handleCloseKhqrModal = async () => {
    const confirmed = window.confirm(
      'Cancel KHQR payment and cancel all pending orders from this checkout?'
    );
    if (!confirmed) return;
    await cancelPendingKhqrOrders();
  };

  const handleResumeKhqr = async () => {
    const nextOrder = khqrOrders[currentKhqrIndex];
    if (!nextOrder) return;

    const opened = await openKhqrForOrder(nextOrder);
    if (!opened) {
      toast.error('Unable to resume KHQR payment right now. Please try again.');
      return;
    }
    setPartialCheckoutMessage('');
  };

  useEffect(() => {
    let isMounted = true;
    async function loadAddresses() {
      setAddressesLoading(true);
      try {
        const addresses = await getAddresses();
        if (!isMounted) return;
        const mapped = addresses.map((addr) => {
          const [firstName, ...rest] = (addr.fullName || '').split(' ');
          return {
            id: addr.id,
            firstName: firstName || '',
            lastName: rest.join(' '),
            email: '',
            phone: addr.phone,
            street: addr.street,
            city: addr.city,
            province: addr.state || '',
            postalCode: addr.postalCode,
            country: addr.country,
            label: (addr.label as 'home' | 'office' | 'other') || 'home',
            isDefault: addr.isDefault,
          } as ShippingAddress;
        });
        setSavedAddresses(mapped);
      } catch (error) {
        console.error('Failed to load addresses', error);
      } finally {
        if (isMounted) setAddressesLoading(false);
      }
    }

    loadAddresses();
    return () => {
      isMounted = false;
    };
  }, []);

  // Empty cart state
  if (items.length === 0 && !isComplete) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-2 text-muted-foreground">
            Add some items to your cart to proceed with checkout.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Order complete state
  if (isComplete) {
    return (
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-md text-center"
        >
          <div className="mb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-foreground"
            >
              <CheckCircle2 className="h-10 w-10" />
            </motion.div>
          </div>
          <h1 className="text-2xl font-bold">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for your order.
          </p>
          {orderNumbers.length > 1 ? (
            <div className="mt-3 space-y-1">
              <p className="text-sm text-muted-foreground">Order numbers:</p>
              {orderNumbers.map((number) => (
                <p key={number} className="text-lg font-mono font-bold">{number}</p>
              ))}
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">Your order number is:</p>
              <p className="mt-2 text-xl font-mono font-bold">{orderNumber}</p>
            </>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            We&apos;ve sent a confirmation email with order details.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/orders">View Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleShippingSubmit = async (address: ShippingAddress) => {
    const normalize = (value: string) => value.trim().toLowerCase();
    const candidateFullName = `${address.firstName} ${address.lastName}`.trim();

    const matchingSaved = !address.id
      ? savedAddresses.find((saved) => {
          const savedFullName = `${saved.firstName} ${saved.lastName}`.trim();
          return (
            normalize(saved.label) === normalize(address.label) &&
            normalize(savedFullName) === normalize(candidateFullName) &&
            normalize(saved.phone) === normalize(address.phone) &&
            normalize(saved.street) === normalize(address.street) &&
            normalize(saved.city) === normalize(address.city) &&
            normalize(saved.province) === normalize(address.province) &&
            normalize(saved.postalCode) === normalize(address.postalCode) &&
            normalize(saved.country) === normalize(address.country)
          );
        })
      : undefined;

    if (!address.id && matchingSaved?.id) {
      setShippingAddress({ ...address, id: matchingSaved.id });
      setCurrentStep('payment');
      return;
    }

    if (!address.id) {
      try {
        const created = await createAddress({
          label: address.label,
          fullName: candidateFullName,
          phone: address.phone,
          street: address.street,
          city: address.city,
          state: address.province,
          postalCode: address.postalCode,
          country: address.country,
          isDefault: address.isDefault,
        });
        setSavedAddresses((prev) => [
          ...prev.filter((a) => a.id !== created.id),
          {
            id: created.id,
            firstName: address.firstName,
            lastName: address.lastName,
            email: address.email,
            phone: created.phone,
            street: created.street,
            city: created.city,
            province: created.state || '',
            postalCode: created.postalCode,
            country: created.country,
            label: (created.label as 'home' | 'office' | 'other') || 'home',
            isDefault: created.isDefault,
          },
        ]);

        // Ensure we use the persisted address id for the order, so "back/continue" won't re-create it.
        setShippingAddress({ ...address, id: created.id });
        setCurrentStep('payment');
        return;
      } catch (error) {
        console.error('Failed to save address:', error);
      }
    }

    setShippingAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (payment: PaymentData) => {
    setPaymentData(payment);
    setCurrentStep('summary');
  };

  const calculatePromotionDiscount = (baseSubtotal: number, promotion?: Promotion | null): number => {
    if (!promotion) return 0;
    if (baseSubtotal < (promotion.minOrderAmount || 0)) return 0;

    if (promotion.type === 'PERCENTAGE') {
      let discount = Number((baseSubtotal * (promotion.value / 100)).toFixed(2));
      if (promotion.maxDiscount !== undefined) {
        discount = Math.min(discount, promotion.maxDiscount);
      }
      return Math.max(0, discount);
    }

    if (promotion.type === 'FIXED_AMOUNT') {
      return Math.max(0, Math.min(baseSubtotal, promotion.value));
    }

    return 0;
  };

  const getPromotionRejectionMessage = (errorCode?: string, fallback?: string) => {
    const normalizedCode = (errorCode || '').toUpperCase();
    if (normalizedCode.includes('EXPIRED')) return 'This coupon has expired.';
    if (normalizedCode.includes('PER_USER') || normalizedCode.includes('ALREADY_USED')) {
      return 'This coupon has already been used on your account.';
    }
    if (normalizedCode.includes('USAGE_LIMIT')) return 'This coupon has reached its usage limit.';
    if (normalizedCode.includes('INVALID') || normalizedCode.includes('NOT_FOUND')) {
      return 'This coupon is invalid.';
    }
    return fallback || 'Promotion code not found or inactive.';
  };

  const handleApplyPromo = async () => {
    const normalized = promoCodeInput.trim().toUpperCase();
    if (!normalized) {
      setAppliedCouponCode(undefined);
      setAppliedPromotion(null);
      setPromoMessage('Enter a promo code first.');
      return;
    }

    const validation = await validatePromotion(normalized);
    const promotion = validation.promotion;
    if (!promotion) {
      setAppliedCouponCode(undefined);
      setAppliedPromotion(null);
      setPromoMessage(getPromotionRejectionMessage(validation.errorCode, validation.error));
      return;
    }

    const previewDiscount = calculatePromotionDiscount(subtotal, promotion);
    if (subtotal < (promotion.minOrderAmount || 0)) {
      setAppliedCouponCode(undefined);
      setAppliedPromotion(null);
      setPromoMessage(`Order must be at least $${promotion.minOrderAmount} for this code.`);
      return;
    }

    setAppliedCouponCode(normalized);
    setAppliedPromotion(promotion);
    setPromoMessage(
      previewDiscount > 0
        ? `Promo applied as estimate: ${promotion.code}. Final discount is confirmed at checkout.`
        : `Promo ${promotion.code} is valid but currently estimates $0 discount. Final totals are confirmed at checkout.`
    );
  };

  const handleConfirmOrder = async () => {
    if (!shippingAddress || !paymentData) return;

    setIsLoading(true);
    setPartialCheckoutMessage('');

    try {
      const shippingFee = subtotal >= SHIPPING_CONFIG.FREE_THRESHOLD ? 0 : SHIPPING_CONFIG.DEFAULT_FEE;
      const discount = calculatePromotionDiscount(subtotal, appliedPromotion);
      const tax = subtotal * 0.1; // 10% tax
      const estimatedTotal = subtotal + shippingFee + tax - discount;
      setOrderTotal(estimatedTotal);

      const checkoutFingerprint = buildCheckoutFingerprint({
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          merchantId: item.merchantId,
        })),
        shippingAddressId: shippingAddress.id,
        paymentMethod: paymentData.method,
        couponCode: appliedCouponCode,
      });
      const checkoutAttemptSeed = getOrCreateCheckoutAttemptSeed(checkoutFingerprint);

      const merchantGroups = groupItemsByMerchantDeterministic(items);
      const createdOrders: CheckoutCreatedOrder[] = [];
      const paymentMethodMap: Record<string, 'KHQR' | 'COD' | 'CARD'> = {
        cash: 'COD',
        card: 'CARD',
        KHQR: 'KHQR',
      };

      for (let groupIndex = 0; groupIndex < merchantGroups.length; groupIndex++) {
        const group = merchantGroups[groupIndex].items;
        const merchantId = group[0]?.merchantId || undefined;
        const idempotencyKey = buildCheckoutIdempotencyKey(checkoutAttemptSeed, groupIndex);
        const response = await createOrderRequest(
          {
            merchantId,
            shippingAddressId: shippingAddress.id,
            shippingAddress: {
              fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
              phone: shippingAddress.phone || '',
              street: shippingAddress.street,
              city: shippingAddress.city,
              state: shippingAddress.province || shippingAddress.city,
              zipCode: shippingAddress.postalCode,
              country: shippingAddress.country || 'Cambodia',
            },
            paymentMethod: paymentMethodMap[paymentData.method] || 'COD',
            couponCode: appliedCouponCode,
          },
          idempotencyKey
        );

        if (!response.success) {
          const backendMessage = response.error || 'Failed to create order';
          const retryHint =
            response.statusCode === 429
              ? ` Retry after ${response.retryAfterSeconds ?? 60}s.`
              : '';

          if (appliedCouponCode && response.errorCode) {
            setPromoMessage(getPromotionRejectionMessage(response.errorCode, backendMessage));
          }

          if (createdOrders.length > 0) {
            setCreatedCheckoutOrders(createdOrders);
            setOrderNumbers(createdOrders.map((order) => order.orderNumber));
            setOrderNumber(createdOrders[0].orderNumber);
            setOrderId(createdOrders[0].orderId);
            setPartialCheckoutMessage(
              'Some orders were already created. Retry will safely resume without duplicates using the same checkout attempt.'
            );
            toast.error(`Checkout partially completed: ${backendMessage}.${retryHint}`);
            return;
          }

          toast.error(`Order creation failed: ${backendMessage}.${retryHint}`);
          return;
        }

        if (!response.order) {
          toast.error('Order creation response was incomplete. Please retry safely.');
          return;
        }

        createdOrders.push({
          orderId: response.order.id,
          orderNumber: response.order.orderNumber,
          total: response.order.total,
        });
        setCreatedCheckoutOrders([...createdOrders]);
      }

      if (createdOrders.length === 0) {
        toast.error('No orders were created.');
        return;
      }

      setCreatedCheckoutOrders(createdOrders);
      setOrderNumbers(createdOrders.map((o) => o.orderNumber));
      setOrderNumber(createdOrders[0].orderNumber);
      setOrderId(createdOrders[0].orderId);
      setPartialCheckoutMessage('');

      if (appliedCouponCode) {
        const backendTotal = createdOrders.reduce((sum, order) => sum + order.total, 0);
        if (Math.abs(backendTotal - estimatedTotal) > 0.01) {
          setPromoMessage(
            `Coupon ${appliedCouponCode} was revalidated at checkout. Final backend total is $${backendTotal.toFixed(2)}.`
          );
        }
      }

      if (paymentData.method === 'KHQR') {
        try {
          setKhqrOrders(createdOrders);
          setCurrentKhqrIndex(0);
          const opened = await openKhqrForOrder(createdOrders[0]);
          if (opened) {
            return;
          }

          setPartialCheckoutMessage(
            'Orders were created, but KHQR could not be generated. Retry will resume safely and you can also complete payment from order history.'
          );
          toast.error('Orders were created, but KHQR could not be generated. Please retry safely.');
          return;
        } catch (err) {
          console.error('KHQR generation error:', err);
          setPartialCheckoutMessage(
            'Orders were created, but payment QR generation failed. Retry will resume safely and you can use order history as fallback.'
          );
          toast.error('An error occurred while generating payment QR.');
          return;
        }
      }

      clearCheckoutAttemptState();
      clearCart();
      setIsComplete(true);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('An unexpected error occurred during checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link 
            href="/cart"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-2 text-xl font-bold"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-design-sm bg-primary text-primary-foreground text-sm">
              S
            </div>
            <span className="hidden sm:inline">Store</span>
          </Link>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-3xl">
          {/* Stepper - Desktop */}
          <div className="mb-8 hidden sm:block">
            <CheckoutStepper 
              currentStep={currentStep}
              onStepClick={(step) => {
                // Only allow going back to completed steps
                const steps: CheckoutStep[] = ['shipping', 'payment', 'summary'];
                const currentIndex = steps.indexOf(currentStep);
                const targetIndex = steps.indexOf(step);
                if (targetIndex < currentIndex) {
                  setCurrentStep(step);
                }
              }}
            />
          </div>

          {/* Stepper - Mobile */}
          <div className="mb-6 sm:hidden">
            <CheckoutStepperMobile currentStep={currentStep} />
          </div>

          {partialCheckoutMessage && (
            <div className="mb-6 rounded-design-lg border border-warning/40 bg-warning/10 p-4">
              <p className="text-sm font-medium text-foreground">{partialCheckoutMessage}</p>
              {createdCheckoutOrders.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Created orders: {createdCheckoutOrders.map((order) => order.orderNumber).join(', ')}
                </p>
              )}
              {!showKhqrModal && khqrOrders[currentKhqrIndex] && (
                <div className="mt-3">
                  <Button type="button" variant="outline" size="sm" onClick={handleResumeKhqr}>
                    Resume KHQR Payment
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 'shipping' && (
                <div className="rounded-design-lg border border-border bg-background p-6 shadow-soft lg:p-8">
                  <h2 className="mb-6 text-xl font-semibold">Shipping Information</h2>
                  <ShippingForm 
                    savedAddresses={savedAddresses}
                    onSubmit={handleShippingSubmit}
                    isLoading={isLoading || addressesLoading}
                  />
                </div>
              )}

              {currentStep === 'payment' && (
                <div className="rounded-design-lg border border-border bg-background p-6 shadow-soft lg:p-8">
                  <h2 className="mb-6 text-xl font-semibold">Payment Method</h2>
                  <PaymentForm
                    onSubmit={handlePaymentSubmit}
                    onBack={() => setCurrentStep('shipping')}
                    isLoading={isLoading}
                    total={subtotal}
                  />
                </div>
              )}

              {currentStep === 'summary' && shippingAddress && paymentData && (
                <div className="rounded-design-lg border border-border bg-background p-6 shadow-soft lg:p-8">
                  <h2 className="mb-6 text-xl font-semibold">Review Your Order</h2>
                  <OrderSummary
                    items={items}
                    shippingAddress={shippingAddress}
                    paymentData={paymentData}
                    subtotal={subtotal}
                    shippingFee={subtotal >= SHIPPING_CONFIG.FREE_THRESHOLD ? 0 : SHIPPING_CONFIG.DEFAULT_FEE}
                    tax={subtotal * 0.1}
                    discount={calculatePromotionDiscount(subtotal, appliedPromotion)}
                    promoCode={promoCodeInput}
                    promoMessage={promoMessage}
                    totalsAreEstimate
                    onPromoCodeChange={setPromoCodeInput}
                    onApplyPromo={handleApplyPromo}
                    onBack={() => setCurrentStep('payment')}
                    onConfirm={handleConfirmOrder}
                    isLoading={isLoading}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* KHQR Payment Modal */}
      <AnimatePresence>
        {showKhqrModal && khqrResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background rounded-[2.5rem] p-4 sm:p-8 max-w-[95vw] md:max-w-4xl w-full relative max-h-[95vh] overflow-y-auto soft-scrollbar border border-border shadow-2xl"
            >
              <button 
                onClick={handleCloseKhqrModal}
                disabled={isCancellingKhqr}
                className="absolute top-6 right-6 z-20 p-2 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Column: Card & Actions */}
                <div className="flex flex-col items-center gap-6">
                  <div className="w-full">
                    <KhqrCard 
                      qrString={khqrResult.qrString}
                      amount={orderTotal}
                      orderNumber={orderNumber}
                      expiresAt={khqrResult.expiresAt}
                      onRegenerate={async () => {
                        if (orderId) {
                          const newKhqr = await createKHQR(orderId);
                          if (newKhqr) setKhqrResult(newKhqr);
                        }
                      }}
                    />
                  </div>

                  {/* Actions & Feedback (Moved from Card) */}
                  <div className="w-full max-w-[300px] space-y-4">
                    <Button 
                      onClick={() => {
                        const deepLink = `bakong://pay?qr=${encodeURIComponent(khqrResult.qrString)}`;
                        window.location.href = deepLink;
                      }}
                      className="w-full text-white rounded-2xl h-14 font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                      style={{ 
                        backgroundColor: KHQR_COLORS.BRAND,
                        boxShadow: `0 10px 15px -3px ${KHQR_COLORS.BRAND}33` // 20% opacity shadow
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = KHQR_COLORS.BRAND_HOVER)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = KHQR_COLORS.BRAND)}
                      aria-label="Open Bakong App"
                    >
                      Open Bakong App
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-2xl h-12 font-semibold"
                      onClick={cancelPendingKhqrOrders}
                      isLoading={isCancellingKhqr}
                    >
                      Cancel KHQR Payment
                    </Button>
                    
                    <div className="flex items-center justify-between px-2">
                       <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Trace ID</span>
                       <span className="text-xs font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded-lg border border-border">
                          {khqrResult.md5.slice(0, 8)}...{khqrResult.md5.slice(-4)}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Instructions */}
                <div className="flex flex-col h-full justify-center space-y-8 py-4 md:py-12 border-t md:border-t-0 md:border-l border-border md:pl-8">
                  <div className="space-y-6">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">How to make the payment?</h2>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ backgroundColor: KHQR_COLORS.BRAND_LIGHT, color: KHQR_COLORS.BRAND }}>1</div>
                         <p className="text-sm font-bold text-foreground">Open Bakong App</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ backgroundColor: KHQR_COLORS.BRAND_LIGHT, color: KHQR_COLORS.BRAND }}>2</div>
                         <p className="text-sm font-bold text-foreground">Tap &quot;QR Pay&quot;</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ backgroundColor: KHQR_COLORS.BRAND_LIGHT, color: KHQR_COLORS.BRAND }}>3</div>
                         <p className="text-sm font-bold text-foreground">Scan QR Code</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ backgroundColor: KHQR_COLORS.BRAND_LIGHT, color: KHQR_COLORS.BRAND }}>4</div>
                         <p className="text-sm font-bold text-foreground">Confirm Payment</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-border flex flex-col items-center gap-2">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">KHQR • Scan. Pay. Done.</p>
                  </div>
                </div>
              </div>

              <PaymentStatusListener 
                md5={khqrResult.md5}
                expiresAt={khqrResult.expiresAt}
                onSuccess={async () => {
                  const nextIndex = currentKhqrIndex + 1;
                  if (nextIndex < khqrOrders.length) {
                    setCurrentKhqrIndex(nextIndex);
                    const opened = await openKhqrForOrder(khqrOrders[nextIndex]);
                    if (opened) {
                      toast.success(`Payment received. Continue with order ${nextIndex + 1} of ${khqrOrders.length}.`);
                      return;
                    }

                    setShowKhqrModal(false);
                    setKhqrResult(null);
                    setPartialCheckoutMessage(
                      'Payment was received for one order, but the next KHQR could not be generated. Retry will resume safely and remaining orders are in your order history.'
                    );
                    toast.error('Payment received, but next KHQR could not be generated. Retry will safely resume.');
                    return;
                  }

                  setShowKhqrModal(false);
                  setKhqrResult(null);
                  clearCheckoutAttemptState();
                  clearCart();
                  setIsComplete(true);
                }}
                onTerminalFailure={(message) => {
                  setPartialCheckoutMessage(
                    `Payment verification ended with a terminal state: ${message}. No duplicate orders were created.`
                  );
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
