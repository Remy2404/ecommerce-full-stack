/**
 * Feature flag type definitions
 */

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: FeatureFlagCategory;
}

export type FeatureFlagCategory = 
  | 'checkout'
  | 'promotions'
  | 'registration'
  | 'payments'
  | 'notifications'
  | 'experimental';

export interface FeatureFlagState {
  flags: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
}

export interface FeatureToggleConfig {
  flagId: string;
  label: string;
  description?: string;
  category?: FeatureFlagCategory;
  requiresConfirmation?: boolean;
}

/**
 * Default feature flags configuration
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'checkout_enabled',
    name: 'Checkout',
    description: 'Enable/disable the checkout process',
    enabled: true,
    category: 'checkout',
  },
  {
    id: 'promotions_enabled',
    name: 'Promotions',
    description: 'Enable/disable promotional campaigns',
    enabled: true,
    category: 'promotions',
  },
  {
    id: 'new_registrations',
    name: 'New Registrations',
    description: 'Allow new user registrations',
    enabled: true,
    category: 'registration',
  },
  {
    id: 'khqr_payments',
    name: 'KHQR Payments',
    description: 'Enable KHQR payment method',
    enabled: true,
    category: 'payments',
  },
  {
    id: 'email_notifications',
    name: 'Email Notifications',
    description: 'Send email notifications to users',
    enabled: true,
    category: 'notifications',
  },
  {
    id: 'maintenance_mode',
    name: 'Maintenance Mode',
    description: 'Put the site in maintenance mode',
    enabled: false,
    category: 'experimental',
  },
];
