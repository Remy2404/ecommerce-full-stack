'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth-context';
import { GoogleAuthButton } from '@/components/auth/google-auth-button';
import { register as registerAccount, loginWithGoogle } from '@/services/auth.service';
import { registerSchema, type RegisterFormData } from '@/validations/auth';

type PasswordCheckProps = {
  passed: boolean;
  label: string;
};

function PasswordCheck({ passed, label }: PasswordCheckProps) {
  return (
    <div className={`flex items-center gap-2 text-xs ${passed ? 'font-medium text-green-500' : 'text-gray-500'}`}>
      <span>{passed ? '✓' : '•'}</span>
      {label}
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    mode: 'onChange',
  });

  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);

    const result = await registerAccount({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    setIsLoading(false);

    if (!result.success) {
      toast.error('Registration failed', {
        description: result.error || 'Unable to register account.',
      });
      return;
    }

    toast.success('Registration successful', {
      description: 'Check your email and verify your account before logging in.',
      duration: 6000,
    });
    router.replace(`/login?email=${encodeURIComponent(data.email)}`);
  };

  const handleGoogleSignIn = async (idToken: string) => {
    setIsGoogleLoading(true);
    const result = await loginWithGoogle(idToken);
    setIsGoogleLoading(false);

    if (!result.success || !result.user) {
      toast.error('Google Sign In failed', {
        description: result.error || 'Unable to complete Google authentication',
      });
      return;
    }

    login(result.user);
    toast.success('Signed in with Google');
    router.replace('/');
  };

  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div className="mx-auto w-full max-w-sm lg:w-96">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/" className="text-2xl font-bold text-white">
            Store
          </Link>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-white hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>

        <div className="mt-10 space-y-6">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
            {isGoogleLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <GoogleAuthButton
                onSuccess={handleGoogleSignIn}
                onError={() =>
                  toast.error('Google Sign In failed', {
                    description: 'Could not connect to Google. Please try again.',
                  })
                }
              />
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black px-2 text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">First name *</label>
                <input
                  {...register('firstName')}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Last name *</label>
                <input
                  {...register('lastName')}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email address *</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Phone number *</label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="+85512345678"
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password *</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 pr-10 text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}

              {password && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full ${
                          passwordStrength >= level
                            ? level <= 1
                              ? 'bg-red-500'
                              : level <= 2
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            : 'bg-gray-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <PasswordCheck passed={passwordChecks.length} label="8+ characters" />
                    <PasswordCheck passed={passwordChecks.uppercase} label="Uppercase" />
                    <PasswordCheck passed={passwordChecks.lowercase} label="Lowercase" />
                    <PasswordCheck passed={passwordChecks.number} label="Number" />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Confirm password *</label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input
                {...register('agreeToTerms')}
                type="checkbox"
                className="mt-1 rounded border-gray-700 bg-gray-900"
              />
              <span className="text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="text-white hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-white hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreeToTerms && <p className="text-xs text-red-400">{errors.agreeToTerms.message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 font-semibold text-black transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
