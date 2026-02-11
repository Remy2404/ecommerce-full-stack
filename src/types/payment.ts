/**
 * Payment-related type definitions
 */

// --- Backend API Responses (DTOs) ---

export interface PaymentApiResponse {
  id: string;
  orderId: string;
  transactionId?: string;
  paymentMethod: string;
  amount: number;
  status: PaymentStatus;
  paymentProvider?: string;
  checkoutUrl?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KHQRResult {
  qrString: string;
  md5: string;
  expiresAt?: string;
}

export interface KHQRVerificationResponse {
  isPaid: boolean;
  expired?: boolean;
  paidAmount?: number;
  currency: string;
  message: string;
}

export interface KHQRApiResponse {
  success: boolean;
  message: string;
  data: KHQRResult;
}

export interface KHQRVerificationApiResponse {
  success: boolean;
  message: string;
  data: KHQRVerificationResponse;
}

// --- Frontend Domain Models ---

export type PaymentMethod = 'COD' | 'CARD' | 'KHQR';
export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface Payment {
  id: string;
  orderId: string;
  transactionId?: string;
  paymentMethod: string;
  amount: number;
  status: PaymentStatus;
  paymentProvider?: string;
  checkoutUrl?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Transformation Logic ---

export function mapPayment(raw: PaymentApiResponse): Payment {
  return {
    ...raw,
    amount: Number(raw.amount),
  };
}

// --- UI Logic Types & Constants ---

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  CARD: 'Credit/Debit Card',
  KHQR: 'KHQR (Bakong)',
};
