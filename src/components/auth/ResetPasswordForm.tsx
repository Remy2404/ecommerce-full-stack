'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { forgotPassword, resetPassword } from '@/actions/auth.actions';
import { 
  resetPasswordSchema, 
  newPasswordSchema, 
  type ResetPasswordFormData, 
  type NewPasswordFormData 
} from '@/validations/auth';

interface ResetPasswordFormProps {
  token?: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Forgot Password Form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  // Reset Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    watch,
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const password = watch('password');

  // Password strength checks
  const passwordChecks = {
    length: password?.length >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    lowercase: /[a-z]/.test(password || ''),
    number: /\d/.test(password || ''),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const onSubmitEmail = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const result = await forgotPassword(data.email);

      if (result.success) {
        setEmailSent(true);
        toast.success('Email sent!', {
          description: 'Check your inbox for password reset instructions.',
        });
      } else if (result.error) {
        toast.error('Failed to send email', {
          description: result.error,
        });
      }
    } catch (err) {
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: NewPasswordFormData) => {
    if (!token) {
      toast.error('Invalid reset link', {
        description: 'Please request a new password reset.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(token, data.password);

      if (result.success) {
        toast.success('Password reset successful!', {
          description: 'You can now sign in with your new password.',
        });
        router.push('/login');
      } else if (result.error) {
        toast.error('Password reset failed', {
          description: result.error,
        });
      }
    } catch (err) {
      toast.error('Something went wrong', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordCheck = ({ passed, label }: { passed: boolean; label: string }) => (
    <div className={`flex items-center gap-2 text-xs ${passed ? 'text-green-500 font-medium' : 'text-gray-500'}`}>
      {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {label}
    </div>
  );

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
            {token ? 'Set new password' : 'Reset password'}
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            {token ? (
              <>
                Enter your new password below
              </>
            ) : (
              <>
                Remember your password?{' '}
                <Link href="/login" className="text-white hover:underline font-medium">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </motion.div>

        <div className="mt-10">
          {!token ? (
            // Forgot Password Form
            emailSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Check your email</h3>
                  <p className="mt-2 text-sm text-gray-400">
                    We&apos;ve sent password reset instructions to your email address.
                  </p>
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-white hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                    <input
                      {...registerEmail('email')}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      disabled={isLoading}
                      className={`w-full rounded-xl border bg-gray-900 pl-10 pr-4 py-3 text-sm transition-colors focus:outline-none focus:ring-1 ${
                        emailErrors.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-700 focus:border-white focus:ring-white'
                      }`}
                    />
                  </div>
                  {emailErrors.email && <p className="text-xs text-red-400">{emailErrors.email.message}</p>}
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-white text-black py-3 font-semibold transition-colors hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </motion.div>

                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </form>
            )
          ) : (
            // Reset Password Form
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">New password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
                  <input
                    {...registerPassword('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-gray-900 pl-10 pr-10 py-3 text-sm transition-colors focus:outline-none focus:ring-1 ${
                      passwordErrors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-700 focus:border-white focus:ring-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.password && <p className="text-xs text-red-400">{passwordErrors.password.message}</p>}

                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-colors ${
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm password *</label>
                <input
                  {...registerPassword('confirmPassword')}
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`w-full rounded-xl border bg-gray-900 px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-1 ${
                    passwordErrors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-700 focus:border-white focus:ring-white'
                  }`}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-red-400">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-white text-black py-3 font-semibold transition-colors hover:bg-gray-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </button>
              </motion.div>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
