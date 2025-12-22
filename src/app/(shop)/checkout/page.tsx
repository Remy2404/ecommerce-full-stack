'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckoutStepper, CheckoutStepperMobile, CheckoutStep } from '@/components/checkout/checkout-stepper';
import { ShippingForm, ShippingAddress } from '@/components/checkout/shipping-form';
import { PaymentForm, PaymentData } from '@/components/checkout/payment-form';
import { OrderSummary } from '@/components/checkout/order-summary';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/cart-context';
import { createOrder } from '@/actions/order.actions';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');

  // Form data states
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

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
            Thank you for your order. Your order number is:
          </p>
          <p className="mt-2 text-xl font-mono font-bold">{orderNumber}</p>
          <p className="mt-4 text-sm text-muted-foreground">
            We've sent a confirmation email with order details.
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

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (payment: PaymentData) => {
    setPaymentData(payment);
    setCurrentStep('summary');
  };

  const handleConfirmOrder = async () => {
    if (!shippingAddress || !paymentData) return;
    
    setIsLoading(true);
    
    try {
      const shippingFee = subtotal >= 100 ? 0 : 10;
      const discount = 0; // To be implemented with promo codes
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + shippingFee + tax - discount;

      const response = await createOrder({
        items,
        shippingAddress,
        paymentData,
        subtotal,
        deliveryFee: shippingFee,
        discount,
        tax,
        total,
      });

      if (response.success && response.data) {
        setOrderNumber(response.data.orderNumber);
        clearCart();
        setIsComplete(true);
      } else {
        // Handle error (could add a toast or error state)
        console.error('Order creation failed:', response.error);
        alert(`Order creation failed: ${response.error}`);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('An unexpected error occurred during checkout. Please try again.');
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
                    onSubmit={handleShippingSubmit}
                    isLoading={isLoading}
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
                    shippingFee={subtotal >= 100 ? 0 : 10}
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
    </div>
  );
}
