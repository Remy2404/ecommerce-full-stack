'use server';

import { signIn, signOut } from '@/lib/auth/auth.config';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { loginSchema, registerSchema } from '@/lib/validations/auth';
import { AuthError } from 'next-auth';

export type AuthResult = {
  success: boolean;
  error?: string;
};

/**
 * Sign in with credentials (email/password)
 */
export async function signInWithCredentials(
  email: string,
  password: string,
  callbackUrl?: string
): Promise<AuthResult> {
  try {
    const validatedFields = loginSchema.safeParse({ email, password });

    if (!validatedFields.success) {
      return { success: false, error: 'Invalid email or password format' };
    }

    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || '/',
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password' };
        default:
          return { success: false, error: 'Something went wrong. Please try again.' };
      }
    }
    // NextAuth redirects throw NEXT_REDIRECT which we should re-throw
    throw error;
  }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(callbackUrl?: string): Promise<void> {
  await signIn('google', { redirectTo: callbackUrl || '/' });
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}

/**
 * Register a new user with email/password
 */
export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}): Promise<AuthResult> {
  try {
    const validatedFields = registerSchema.safeParse(data);

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten().fieldErrors;
      const firstError = Object.values(errors).flat()[0];
      return { success: false, error: firstError || 'Invalid form data' };
    }

    const { firstName, lastName, email, phone, password } = validatedFields.data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    // Check if phone already exists
    const existingPhone = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    if (existingPhone) {
      return { success: false, error: 'This phone number is already registered' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    await db.insert(users).values({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role: 'customer',
      isActive: true,
    });

    // Auto sign in after registration
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    // Re-throw redirect errors
    throw error;
  }
}

/**
 * Get current user from session (for client components)
 */
export async function getCurrentUser() {
  const { auth } = await import('@/lib/auth/auth.config');
  const session = await auth();
  return session?.user || null;
}
