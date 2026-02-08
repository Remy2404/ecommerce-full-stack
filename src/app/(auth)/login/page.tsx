'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { useAuth } from '@/hooks/auth-context';
import { isAdminRole, isMerchantRole } from '@/lib/roles';
import { login as loginWithCredentials, loginWithGoogle } from '@/services/auth.service';
import { loginSchema, type LoginFormData } from '@/validations/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { login, isAuthenticated, setPendingTwoFactor } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const safeCallbackUrl = useMemo(() => {
    if (callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')) return callbackUrl;
    return '/';
  }, [callbackUrl]);

  useEffect(() => {
    if (isAuthenticated) router.replace('/');
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const redirectByRole = (role?: string) => {
    if (isAdminRole(role)) return '/admin';
    if (isMerchantRole(role)) return '/merchant';
    return safeCallbackUrl;
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    const result = await loginWithCredentials(data.email, data.password);
    setIsLoading(false);

    if (!result.success) {
      toast.error('Login failed', { description: result.error || 'Invalid credentials' });
      return;
    }

    if (result.tempToken) {
      setPendingTwoFactor(result.tempToken);
      toast.info('2FA verification required');
      router.replace('/2fa');
      return;
    }

    if (result.user) {
      login(result.user);
      toast.success('Login successful');
      router.replace(redirectByRole(result.user.role));
      return;
    }

    toast.error('Login failed', { description: 'Unexpected authentication response' });
  };

  const handleGoogleSuccess = async (idToken: string) => {
    setIsGoogleLoading(true);
    const result = await loginWithGoogle(idToken);
    setIsGoogleLoading(false);

    if (!result.success || !result.user) {
      toast.error('Google Sign-In failed', {
        description: result.error || 'Authentication failed',
      });
      return;
    }

    login(result.user);
    toast.success('Login successful');
    router.replace(redirectByRole(result.user.role));
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24"
      >
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link href="/" className="text-2xl font-bold text-white">
            Store
          </Link>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-white hover:underline">
              Sign up
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5">
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
              {isGoogleLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                <GoogleAuthButton
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    toast.error('Google Sign-In failed', {
                      description: 'Could not connect to Google. Please try again.',
                    })
                  }
                />
              )}
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black px-2 text-gray-500">or</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-10 pr-4 text-sm placeholder:text-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 pl-10 pr-10 text-sm placeholder:text-gray-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Secure login with refresh-cookie sessions</span>
              <Link href="/reset-password" className="font-medium text-white hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-medium text-black transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </motion.div>

      <div className="relative hidden w-0 flex-1 overflow-hidden lg:block">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />

        <div className="relative z-10 flex h-full items-center justify-center p-12">
          <div className="max-w-lg text-center">
            <h2 className="mb-4 text-4xl font-bold">Shop the best products</h2>
            <p className="text-lg text-gray-400">
              Discover our curated collection of premium products at unbeatable prices.
            </p>
            <div className="mt-12 flex justify-center gap-6">
              <div className="w-32 rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <Truck className="mx-auto mb-2 h-8 w-8 text-white" />
                <div className="text-sm font-semibold">Free Shipping</div>
                <div className="text-xs text-gray-400">On orders $50+</div>
              </div>
              <div className="w-32 rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <Zap className="mx-auto mb-2 h-8 w-8 text-white" />
                <div className="text-sm font-semibold">Fast Delivery</div>
                <div className="text-xs text-gray-400">2-3 business days</div>
              </div>
              <div className="w-32 rounded-2xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm">
                <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-white" />
                <div className="text-sm font-semibold">Secure Payment</div>
                <div className="text-xs text-gray-400">100% protected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
