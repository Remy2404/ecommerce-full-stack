'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Loader2, Mail, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { resendVerificationByToken, verifyEmailAndAutoLogin } from '@/services/auth.service';
import { useAuth } from '@/hooks/auth-context';
import { isAdminRole, isMerchantRole } from '@/lib/roles';

interface VerifyEmailFormProps {
  token?: string;
}

type VerificationState = 'verifying' | 'success' | 'error' | 'no-token';

export default function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [state, setState] = useState<VerificationState>(token ? 'verifying' : 'no-token');
  const [errorMessage, setErrorMessage] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (!token || hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const verify = async () => {
      const result = await verifyEmailAndAutoLogin(token);

      if (!result.success) {
        const message = result.error || 'Verification failed. The link may be invalid or expired.';
        setErrorMessage(message);
        setCanResend(message.toLowerCase().includes('expired'));
        setState('error');
        toast.error('Verification failed', { description: message });
        return;
      }

      if (result.user) {
        login(result.user);
      }

      setState('success');
      toast.success('Email verified successfully');

      const redirectPath = isAdminRole(result.user?.role)
        ? '/admin'
        : isMerchantRole(result.user?.role)
          ? '/merchant'
          : '/profile';
      setTimeout(() => router.replace(redirectPath), 2000);
    };

    void verify();
  }, [login, router, token]);

  const handleResend = async () => {
    if (!token) return;
    setIsResending(true);
    const result = await resendVerificationByToken(token);
    setIsResending(false);

    if (!result.success) {
      toast.error(result.error || 'Unable to resend verification email.');
      return;
    }

    toast.success('Verification email sent. Check your inbox.');
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div className="mx-auto w-full max-w-sm lg:w-96">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/" className="text-2xl font-bold text-white">
            Store
          </Link>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Email Verification</h1>
        </motion.div>

        <div className="mt-10">
          {state === 'verifying' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Verifying your email...</h3>
                <p className="mt-2 text-sm text-gray-400">Please wait while we activate your account.</p>
              </div>
            </div>
          )}

          {state === 'success' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-500">Email verified</h3>
                <p className="mt-2 text-sm text-gray-400">Your account is now active.</p>
              </div>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {state === 'error' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-500">Verification failed</h3>
                <p className="mt-2 text-sm text-gray-400">{errorMessage}</p>
              </div>
              <div className="space-y-3">
                {canResend && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="block w-full rounded-xl bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200 disabled:opacity-60"
                  >
                    {isResending ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
                <Link
                  href="/register"
                  className="block w-full rounded-xl bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200"
                >
                  Create new account
                </Link>
                <Link href="/login" className="block text-sm text-gray-400 transition-colors hover:text-white">
                  Back to login
                </Link>
              </div>
            </div>
          )}

          {state === 'no-token' && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <Mail className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">No verification token</h3>
                <p className="mt-2 text-sm text-gray-400">Please open the verification link from your email.</p>
              </div>
              <div className="space-y-3">
                <Link
                  href="/register"
                  className="block w-full rounded-xl bg-white px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-200"
                >
                  Register
                </Link>
                <Link href="/login" className="block text-sm text-gray-400 transition-colors hover:text-white">
                  Back to login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
