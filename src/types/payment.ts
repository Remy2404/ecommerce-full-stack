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

// --- Frontend Domain Models ---

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

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
  };
}

// --- UI Logic Types & Constants ---

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  CARD: 'Credit/Debit Card',
  KHQR: 'KHQR (Bakong)',
  WING: 'Wing Bank',
};
