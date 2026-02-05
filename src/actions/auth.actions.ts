'use server';

import * as authService from '@/services/auth.service';
import { loginSchema, registerSchema } from '@/validations/auth';
import { redirect } from 'next/navigation';

import { AuthUser } from '@/types';

export type AuthResult = {
  success: boolean;
  error?: string;
  user?: AuthUser;
  token?: string;
  tempToken?: string;
};

/**
 * Sign in with credentials (email/password)
 * Calls Spring Boot backend /api/auth/login
 */
export async function signInWithCredentials(
  email: string,
  password: string
): Promise<AuthResult> {
  const validatedFields = loginSchema.safeParse({ email, password });

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid email or password format' };
  }

  return await authService.login(email, password);
}

/**
 * Sign in with Google OAuth
 * Note: The actual Google OAuth flow should be handled client-side
 * using the Google Sign-In SDK, then the ID token is sent to this action
 */
export async function signInWithGoogle(idToken: string): Promise<AuthResult> {
  return await authService.loginWithGoogle(idToken);
}

/**
 * Sign out the current user
 * Calls Spring Boot backend /api/auth/logout
 */
export async function signOutUser(): Promise<void> {
  await authService.logout();
  // We can keep redirect here as logout doesn't need to save token (it clears it)
  // But strictly speaking, client should clear token first.
  // We'll leave it for now or assume client clears it.
  redirect('/login');
}

/**
 * Register a new user with email/password
 * Calls Spring Boot backend /api/auth/register
 */
export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}): Promise<AuthResult> {
  const validatedFields = registerSchema.safeParse(data);

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    const firstError = Object.values(errors).flat()[0];
    return { success: false, error: firstError || 'Invalid form data' };
  }

  const { firstName, lastName, email, phone, password, confirmPassword } = validatedFields.data;

  return await authService.register({
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
  });
}

/**
 * Get current user from JWT token
 * Note: For server components, this reads from the stored token
 */
export async function getCurrentUser() {
  return await authService.getCurrentUser();
}

/**
 * Verify email with verification code
 */
export async function verifyEmail(email: string, code: string): Promise<AuthResult> {
  return authService.verifyEmail(email, code);
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<AuthResult> {
  return authService.forgotPassword(email);
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<AuthResult> {
  return authService.resetPassword(token, newPassword);
}
