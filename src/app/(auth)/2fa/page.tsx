'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import api, { setAccessToken } from '@/services/api';
import { useAuth } from '@/hooks/auth-context';
import { UserApiResponse, mapAuthUser } from '@/types';

export default function TwoFactorPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('2fa_temp_token');
    if (!token) {
      toast.error('Session expired');
      router.push('/login');
      return;
    }
    setTempToken(token);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tempToken) {
      toast.error('Session expired');
      router.push('/login');
      return;
    }

    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.post<{
        token: string;
        user: UserApiResponse;
      }>('/auth/verify-2fa', {
        tempToken,
        otp,
      });

      // Clear temp token
      sessionStorage.removeItem('2fa_temp_token');

      // Save tokens and redirect
      setAccessToken(result.data.token);
      if (result.data.user) {
        const authUser = mapAuthUser(result.data.user);
        login(authUser);
      }
      
      toast.success('Login successful!');
      const redirectPath = result.data.user?.role === 'ADMIN' ? '/admin' : '/';
      router.push(redirectPath);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      
      if (errorMessage === 'TEMP_TOKEN_EXPIRED') {
        sessionStorage.removeItem('2fa_temp_token');
        toast.error('Session expired', {
          description: 'Please login again',
        });
        router.push('/login');
      } else if (errorMessage === 'INVALID_OTP') {
        toast.error('Invalid verification code', {
          description: 'Please check your authenticator app and try again',
        });
        setOtp('');
      } else {
        toast.error('Verification failed', {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    // Only allow digits
    const sanitized = value.replace(/\D/g, '').slice(0, 6);
    setOtp(sanitized);
  };

  if (!tempToken) {
    return null; 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mt-2">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                sessionStorage.removeItem('2fa_temp_token');
                router.push('/login');
              }}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
