'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import api from '@/services/api/client';
import { setAccessToken } from '@/services/api/client';
import { getErrorMessage } from '@/lib/http-error';

interface VerifyEmailFormProps {
  token?: string;
}

type VerificationState = 'verifying' | 'success' | 'error' | 'no-token';
type VerifyAndLoginResponse = {
  token?: string;
};

export default function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const router = useRouter();
  const [state, setState] = useState<VerificationState>(() =>
    token ? 'verifying' : 'no-token'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    const verifyEmail = async () => {
      try {
        const response = await api.post<VerifyAndLoginResponse>('/auth/verify-email/auto-login', { token });
        if (response.data?.token) {
          setAccessToken(response.data.token);
        }
        
        setState('success');
        toast.success('Email verified!', {
          description: 'Your account has been activated and you are now logged in.',
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/profile');
        }, 3000);
      } catch (error: unknown) {
        const message = getErrorMessage(
          error,
          'Verification failed. The link may be invalid or expired.'
        );
        setErrorMessage(message);
        setCanResend(message.toLowerCase().includes('expired'));
        setState('error');
        
        toast.error('Verification failed', {
          description: message,
        });
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResend = async () => {
    if (!token) return;
    setIsResending(true);
    try {
      await api.post('/auth/resend-verification/by-token', { token });
      toast.success('Verification email sent', {
        description: 'Please check your inbox for a new verification link.',
      });
    } catch (error: unknown) {
      toast.error('Failed to resend verification email', {
        description: getErrorMessage(error, 'Please try again later.'),
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div className="mx-auto w-full max-w-sm lg:w-96">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="text-2xl font-bold text-white">
            Store
          </Link>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">
            Email Verification
          </h1>
        </motion.div>

        <div className="mt-10">
          {state === 'verifying' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Verifying your email...</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Please wait while we confirm your email address.
                </p>
              </div>
            </motion.div>
          )}

          {state === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </motion.div>
              <div>
                <h3 className="text-xl font-semibold text-green-500">Email verified!</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Your account has been successfully activated.
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Redirecting to your account...
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-6 py-3 font-semibold transition-colors hover:bg-gray-200"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-red-500">Verification failed</h3>
                <p className="mt-2 text-sm text-gray-400">
                  {errorMessage}
                </p>
              </div>
              <div className="space-y-3">
                {canResend && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleResend}
                    disabled={isResending}
                    className="block w-full rounded-xl bg-white text-black px-6 py-3 font-semibold transition-colors hover:bg-gray-200 disabled:opacity-60"
                  >
                    {isResending ? 'Sending...' : 'Resend verification email'}
                  </motion.button>
                )}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/register"
                    className="block w-full rounded-xl bg-white text-black px-6 py-3 font-semibold transition-colors hover:bg-gray-200"
                  >
                    Create new account
                  </Link>
                </motion.div>
                <Link
                  href="/login"
                  className="block text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </motion.div>
          )}

          {state === 'no-token' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">No verification token</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Please check your email for the verification link.
                </p>
              </div>
              <div className="space-y-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/register"
                    className="block w-full rounded-xl bg-white text-black px-6 py-3 font-semibold transition-colors hover:bg-gray-200"
                  >
                    Register
                  </Link>
                </motion.div>
                <Link
                  href="/login"
                  className="block text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
