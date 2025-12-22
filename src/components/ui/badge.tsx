'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'default' | 'sm' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-input bg-background text-foreground',
      success: 'bg-success text-success-foreground',
      warning: 'bg-warning text-warning-foreground',
    };

    const sizes = {
      default: 'px-3 py-1 text-xs',
      sm: 'px-2 py-0.5 text-[10px]',
      lg: 'px-4 py-1.5 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full',
          'transition-colors duration-base',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

// Low Stock Badge - Special badge for stock indicator
interface LowStockBadgeProps {
  stock: number;
  threshold?: number;
  className?: string;
}

const LowStockBadge = ({ stock, threshold = 10, className }: LowStockBadgeProps) => {
  if (stock >= threshold) return null;

  const isOutOfStock = stock === 0;
  
  return (
    <Badge
      variant={isOutOfStock ? 'destructive' : 'warning'}
      size="sm"
      className={cn('animate-pulse-soft', className)}
    >
      {isOutOfStock ? 'Out of Stock' : `Only ${stock} left`}
    </Badge>
  );
};

// Featured Badge
const FeaturedBadge = ({ className }: { className?: string }) => (
  <Badge
    variant="default"
    size="sm"
    className={cn('bg-gradient-to-r from-amber-500 to-orange-500', className)}
  >
    Featured
  </Badge>
);

// Sale Badge
interface SaleBadgeProps {
  discount: number;
  className?: string;
}

const SaleBadge = ({ discount, className }: SaleBadgeProps) => (
  <Badge
    variant="destructive"
    size="sm"
    className={className}
  >
    -{discount}%
  </Badge>
);

// New Badge
const NewBadge = ({ className }: { className?: string }) => (
  <Badge
    variant="success"
    size="sm"
    className={className}
  >
    New
  </Badge>
);

export { Badge, LowStockBadge, FeaturedBadge, SaleBadge, NewBadge };
