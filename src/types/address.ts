/**
 * Address-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface AddressApiResponse {
  id: string;
  userId: string;
  label: string; // Home, Work, etc.
  inUse?: boolean;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Frontend Domain Models ---

export interface Address {
  id: string;
  userId: string;
  label: string;
  inUse?: boolean;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- Transformation Logic ---

export function mapAddress(raw: AddressApiResponse): Address {
  return {
    ...raw,
  };
}
