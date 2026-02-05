import api from './api';

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
  message: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

/**
 * Setup 2FA - generates secret and QR code
 */
export async function setup2FA(): Promise<TwoFactorSetupResponse> {
  const response = await api.post<TwoFactorSetupResponse>('/auth/2fa/setup');
  return response.data;
}

/**
 * Enable 2FA after verifying code
 */
export async function enable2FA(code: string): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>('/auth/2fa/enable', { code });
  return response.data;
}

/**
 * Disable 2FA
 */
export async function disable2FA(): Promise<MessageResponse> {
  const response = await api.post<MessageResponse>('/auth/2fa/disable');
  return response.data;
}
