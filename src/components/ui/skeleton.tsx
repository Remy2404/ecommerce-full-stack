'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Base Skeleton
const Skeleton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-design bg-muted animate-shimmer',
        className
      )}
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';

// Skeleton Text
interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

const SkeletonText = forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, lines = 3, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
);
SkeletonText.displayName = 'SkeletonText';

// Skeleton Circle (for avatars)
interface SkeletonCircleProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const SkeletonCircle = forwardRef<HTMLDivElement, SkeletonCircleProps>(
  ({ className, size = 'md', ...props }, ref) => {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16',
    };

    return (
      <Skeleton
        ref={ref}
        className={cn('rounded-full', sizes[size], className)}
        {...props}
      />
    );
  }
);
SkeletonCircle.displayName = 'SkeletonCircle';

// Skeleton Card (for product cards)
const SkeletonCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-design border border-border overflow-hidden',
        className
      )}
      {...props}
    >
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
);
SkeletonCard.displayName = 'SkeletonCard';

// Skeleton Image
interface SkeletonImageProps extends HTMLAttributes<HTMLDivElement> {
  aspectRatio?: 'square' | 'video' | 'portrait';
}

const SkeletonImage = forwardRef<HTMLDivElement, SkeletonImageProps>(
  ({ className, aspectRatio = 'square', ...props }, ref) => {
    const aspectClasses = {
      square: 'aspect-square',
      video: 'aspect-video',
      portrait: 'aspect-[3/4]',
    };

    return (
      <Skeleton
        ref={ref}
        className={cn(aspectClasses[aspectRatio], 'w-full', className)}
        {...props}
      />
    );
  }
);
SkeletonImage.displayName = 'SkeletonImage';

// Skeleton Button
const SkeletonButton = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Skeleton
      ref={ref}
      className={cn('h-11 w-24', className)}
      {...props}
    />
  )
);
SkeletonButton.displayName = 'SkeletonButton';

export {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  SkeletonImage,
  SkeletonButton,
};
