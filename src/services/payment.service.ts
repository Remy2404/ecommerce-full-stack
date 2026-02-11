import api from './api';
import { toHttpError } from '@/lib/http-error';
import { 
  KHQRResult, 
  KHQRVerificationResponse, 
  KHQRApiResponse, 
  KHQRVerificationApiResponse 
} from '@/types/payment';

/**
 * Generate KHQR for an order
 */
export async function createKHQR(orderId: string): Promise<KHQRResult | null> {
  try {
    const response = await api.post<KHQRApiResponse>(`/payments/khqr/${orderId}`);
    if (response.data.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to generate KHQR:', error);
    return null;
  }
}

/**
 * Verify payment status by MD5 hash
 */
export async function verifyPayment(md5: string): Promise<KHQRVerificationResponse | null> {
  try {
    const response = await api.post<KHQRVerificationApiResponse>(`/payments/verify/md5/${md5}`);
    return response.data.data ?? null;
  } catch (error) {
    throw toHttpError(error, 'Failed to verify payment');
  }
}

/**
 * Service object for payment operations
 */
const paymentService = {
  createKHQR,
  verifyPayment,
};

export default paymentService;
