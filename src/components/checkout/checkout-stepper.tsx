'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export type CheckoutStep = 'shipping' | 'payment' | 'summary';

interface CheckoutStepperProps {
  currentStep: CheckoutStep;
  onStepClick?: (step: CheckoutStep) => void;
}

const steps: { id: CheckoutStep; label: string; description: string }[] = [
  { id: 'shipping', label: 'Shipping', description: 'Delivery address' },
  { id: 'payment', label: 'Payment', description: 'Payment method' },
  { id: 'summary', label: 'Summary', description: 'Review order' },
];

export function CheckoutStepper({ currentStep, onStepClick }: CheckoutStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = isCompleted && onStepClick;

          return (
            <li key={step.id} className="relative flex flex-1 items-center">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={cn(
                    'absolute left-0 top-5 h-0.5 w-full -translate-x-1/2',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                  style={{ width: 'calc(100% - 2.5rem)', left: 'calc(-50% + 1.25rem)' }}
                />
              )}

              {/* Step circle and label */}
              <div className="relative z-10 flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    !isCompleted && !isCurrent && 'border-border bg-muted text-muted-foreground',
                    isClickable && 'cursor-pointer hover:opacity-80'
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      (isCompleted || isCurrent) ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Mobile stepper variant
export function CheckoutStepperMobile({ currentStep }: { currentStep: CheckoutStep }) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const current = steps[currentIndex];

  return (
    <div className="flex items-center justify-between border-b border-border pb-4">
      <div>
        <p className="text-xs text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </p>
        <p className="font-medium">{current.label}</p>
      </div>
      <div className="flex gap-1">
        {steps.map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-2 w-8 rounded-full transition-colors',
              index <= currentIndex ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
    </div>
  );
}
