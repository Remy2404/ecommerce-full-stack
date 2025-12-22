'use client';

import { useState } from 'react';
import { MapPin, Home, Building2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, FormField, Label } from '@/components/ui/input';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  label: 'home' | 'office' | 'other';
  isDefault: boolean;
}

interface ShippingFormProps {
  savedAddresses?: ShippingAddress[];
  onSubmit: (address: ShippingAddress) => void;
  isLoading?: boolean;
}

const addressLabels = [
  { value: 'home', label: 'Home', icon: Home },
  { value: 'office', label: 'Office', icon: Building2 },
  { value: 'other', label: 'Other', icon: MapPin },
] as const;

export function ShippingForm({ savedAddresses = [], onSubmit, isLoading }: ShippingFormProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    savedAddresses.find((a) => a.isDefault)?.id || null
  );
  const [isNewAddress, setIsNewAddress] = useState(savedAddresses.length === 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Cambodia',
    label: 'home',
    isDefault: savedAddresses.length === 0,
  });

  const handleInputChange = (field: keyof ShippingAddress, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.street.trim()) newErrors.street = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.province.trim()) newErrors.province = 'Province is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isNewAddress && selectedAddressId) {
      const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId);
      if (selectedAddress) {
        onSubmit(selectedAddress);
        return;
      }
    }

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="space-y-3">
          <Label>Select Address</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {savedAddresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => {
                  setSelectedAddressId(address.id || null);
                  setIsNewAddress(false);
                }}
                className={cn(
                  'relative rounded-design border p-4 text-left transition-all',
                  selectedAddressId === address.id && !isNewAddress
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {selectedAddressId === address.id && !isNewAddress && (
                  <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <p className="font-medium">
                  {address.firstName} {address.lastName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {address.street}, {address.city}
                </p>
                <p className="text-xs text-muted-foreground">
                  {address.phone}
                </p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setIsNewAddress(true)}
              className={cn(
                'flex min-h-[120px] flex-col items-center justify-center rounded-design border-2 border-dashed transition-all',
                isNewAddress
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <MapPin className="h-6 w-6 text-muted-foreground" />
              <span className="mt-2 text-sm font-medium">Add New Address</span>
            </button>
          </div>
        </div>
      )}

      {/* New Address Form */}
      {isNewAddress && (
        <div className="space-y-4">
          {savedAddresses.length > 0 && (
            <h3 className="font-medium">New Shipping Address</h3>
          )}

          {/* Address Label */}
          <div>
            <Label className="mb-2 block">Address Type</Label>
            <div className="flex gap-2">
              {addressLabels.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleInputChange('label', value)}
                  className={cn(
                    'flex items-center gap-2 rounded-design border px-4 py-2 text-sm transition-all',
                    formData.label === value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First Name" error={errors.firstName} required>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                error={!!errors.firstName}
                placeholder="John"
              />
            </FormField>
            <FormField label="Last Name" error={errors.lastName} required>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                error={!!errors.lastName}
                placeholder="Doe"
              />
            </FormField>
          </div>

          {/* Contact Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Email" error={errors.email} required>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!errors.email}
                placeholder="john@example.com"
              />
            </FormField>
            <FormField label="Phone" error={errors.phone} required>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                error={!!errors.phone}
                placeholder="+855 12 345 678"
              />
            </FormField>
          </div>

          {/* Address Fields */}
          <FormField label="Street Address" error={errors.street} required>
            <Input
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              error={!!errors.street}
              placeholder="123 Main Street, Apt 4B"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="City" error={errors.city} required>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={!!errors.city}
                placeholder="Phnom Penh"
              />
            </FormField>
            <FormField label="Province" error={errors.province} required>
              <Input
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                error={!!errors.province}
                placeholder="Phnom Penh"
              />
            </FormField>
            <FormField label="Postal Code" error={errors.postalCode}>
              <Input
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="12000"
              />
            </FormField>
          </div>

          {/* Save as default */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleInputChange('isDefault', e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <span className="text-sm">Save as default address</span>
          </label>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
        Continue to Payment
      </Button>
    </form>
  );
}
