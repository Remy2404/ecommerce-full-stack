'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Truck, Zap, ShieldCheck } from 'lucide-react';

import { signInWithCredentials, signInWithGoogle } from '@/actions/auth.actions';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, dirtyFields },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const emailValue = watch('email');

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signInWithCredentials(
        data.email,
        data.password,
        callbackUrl
      );

      if (result.success) {
        toast.success('Login successful!', {
          description: 'Welcome back to our store.',
        });
      } else if (result.error) {
        toast.error('Login failed', {
          description: result.error,
        });
      }
    } catch (err) {
      if ((err as any)?.message === 'NEXT_REDIRECT') return;

      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle(callbackUrl);
    } catch (err) {
      if ((err as any)?.message === 'NEXT_REDIRECT') return;

      toast.error('Google Sign In failed', {
        description: 'Please try again later.',
      });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24"
      >
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link href="/" className="text-2xl font-bold text-white">
              Store
            </Link>
            <h1 className="mt-8 text-3xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-white hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
            {/* Google Sign In */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-800 disabled:opacity-50"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                Continue with Google
              </button>
            </motion.div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-black px-2 text-gray-500">or</span>
              </div>
            </div>

            {/* Email/Password Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-gray-900 pl-10 pr-10 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-colors ${errors.email
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-700 focus:border-white focus:ring-white'
                      }`}
                  />
                  <AnimatePresence>
                    {emailValue && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      >
                        {!errors.email && dirtyFields.email ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : errors.email ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-gray-900 pl-10 pr-10 py-3 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-colors ${errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-700 focus:border-white focus:ring-white'
                      }`}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </motion.button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-700 bg-gray-900 text-white focus:ring-0 focus:ring-offset-0" />
                  <span className="text-gray-400">Remember me</span>
                </label>
                <Link href="/reset-password" className="text-white hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Sign In Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-white text-black py-3 font-medium transition-colors hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
              </motion.div>
            </div>
          </form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-xs text-gray-500"
          >
            Demo: rosexmee1122@gmail.com / password
          </motion.p>
        </div>
      </motion.div>

      {/* Right side - Animated Background with Image */}
      <div className="relative hidden w-0 flex-1 lg:block overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')"
            }}
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />

          {/* Animated Circles */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"
          />

          <div className="flex h-full items-center justify-center p-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="max-w-lg text-center"
            >
              <h2 className="text-4xl font-bold mb-4">Shop the best products</h2>
              <p className="text-gray-400 text-lg">
                Discover our curated collection of premium products at unbeatable prices.
              </p>

              {/* Feature Cards */}
              <div className="mt-12 flex justify-center gap-6">
                {[
                  { icon: Truck, title: "Free Shipping", desc: "On orders $50+" },
                  { icon: Zap, title: "Fast Delivery", desc: "2-3 business days" },
                  { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected" },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    whileHover={{ y: -5, scale: 1.05 }}
                    className="w-32 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center cursor-pointer group"
                  >
                    <div className="mb-2 group-hover:scale-110 transition-transform flex justify-center">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-sm font-semibold mb-1">{feature.title}</div>
                    <div className="text-xs text-gray-400">{feature.desc}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}