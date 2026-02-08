'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import {
  clearPendingTwoFactorToken,
  completeTwoFactorLogin,
  getPendingTwoFactorToken,
} from '@/services/auth.service';
import { isAdminRole, isMerchantRole } from '@/lib/roles';
import { useAuth } from '@/hooks/auth-context';

export default function TwoFactorPage() {
  const router = useRouter();
  const { login } = useAuth();
  const tempToken = getPendingTwoFactorToken();
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tempToken) {
      toast.error('2FA session expired');
      router.replace('/login');
    }
  }, [router, tempToken]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tempToken) return;
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    const result = await completeTwoFactorLogin(tempToken, otp);
    setIsLoading(false);

    if (!result.success) {
      if (result.error?.includes('TEMP_TOKEN_EXPIRED')) {
        clearPendingTwoFactorToken();
        toast.error('2FA session expired. Please login again.');
        router.replace('/login');
        return;
      }

      toast.error(result.error || 'Verification failed');
      return;
    }

    if (result.user) {
      login(result.user);
    }

    const role = result.user?.role;
    const redirectPath = isAdminRole(role) ? '/admin' : isMerchantRole(role) ? '/merchant' : '/';
    toast.success('Two-factor verification successful');
    router.replace(redirectPath);
  };

  if (!tempToken) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h1>
            <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-mono text-2xl tracking-widest text-gray-900 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                clearPendingTwoFactorToken();
                router.replace('/login');
              }}
              className="mx-auto flex items-center justify-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
