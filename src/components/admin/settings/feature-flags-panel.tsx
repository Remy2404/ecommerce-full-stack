'use client';

import { useMemo } from 'react';
import { Settings2, ShoppingCart, Tag, UserPlus, CreditCard, Bell, FlaskConical } from 'lucide-react';
import { FeatureToggle } from './feature-toggle';
import { cn } from '@/lib/utils';
import type { FeatureFlag, FeatureFlagCategory } from '@/types/feature-flags';

const CATEGORY_ICONS: Record<FeatureFlagCategory, React.ReactNode> = {
  checkout: <ShoppingCart className="h-4 w-4" />,
  promotions: <Tag className="h-4 w-4" />,
  registration: <UserPlus className="h-4 w-4" />,
  payments: <CreditCard className="h-4 w-4" />,
  notifications: <Bell className="h-4 w-4" />,
  experimental: <FlaskConical className="h-4 w-4" />,
};

const CATEGORY_LABELS: Record<FeatureFlagCategory, string> = {
  checkout: 'Checkout',
  promotions: 'Promotions',
  registration: 'Registration',
  payments: 'Payments',
  notifications: 'Notifications',
  experimental: 'Experimental',
};

interface FeatureFlagsPanelProps {
  flags: FeatureFlag[];
  onToggle: (flagId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Panel with all feature toggles grouped by category
 */
export function FeatureFlagsPanel({
  flags,
  onToggle,
  isLoading = false,
  className,
}: FeatureFlagsPanelProps) {
  const groupedFlags = useMemo(() => {
    const groups: Record<FeatureFlagCategory, FeatureFlag[]> = {
      checkout: [],
      promotions: [],
      registration: [],
      payments: [],
      notifications: [],
      experimental: [],
    };

    flags.forEach((flag) => {
      if (groups[flag.category]) {
        groups[flag.category].push(flag);
      }
    });

    return groups;
  }, [flags]);

  const categories = Object.keys(groupedFlags) as FeatureFlagCategory[];

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Feature Flags</h2>
      </div>

      {categories.map((category) => {
        const categoryFlags = groupedFlags[category];
        if (categoryFlags.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              {CATEGORY_ICONS[category]}
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-2">
              {categoryFlags.map((flag) => (
                <FeatureToggle
                  key={flag.id}
                  id={flag.id}
                  label={flag.name}
                  description={flag.description}
                  enabled={flag.enabled}
                  onToggle={async () => onToggle(flag.id)}
                  requiresConfirmation={category === 'experimental'}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
