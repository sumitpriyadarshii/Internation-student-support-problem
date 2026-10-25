'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Compass,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be under 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the Terms of Use and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const passwordValue = watch('password', '');
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasNumber = /[0-9]/.test(passwordValue);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setErrorMessage(resData.error?.message || 'Registration failed. Please try again.');
        toast.error(resData.error?.message || 'Registration failed');
        setIsLoading(false);
        return;
      }

      toast.success('Account created successfully! Signing you in...');

      const signInResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.info('Please sign in with your new credentials');
        router.push('/login');
      } else {
        window.location.href = '/onboarding';
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred. Please try again.');
      toast.error('An error occurred during registration.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-[#f7f5f0]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Warm Sunset Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-600/15 via-orange-600/10 to-rose-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-warm opacity-30 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ios-pill text-amber-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Free Student Registration</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Begin Your <span className="text-gradient-sunset">Global Chapter</span>
            </h1>
            <p className="mt-2 text-sm text-stone-400 max-w-md mx-auto">
              Join thousands of international scholars receiving warm, tailored relocation guidance
            </p>
          </div>

          {/* Form Card: Apple Frosted Glass */}
          <div className="ios-glass-prominent rounded-3xl p-6 sm:p-10 shadow-2xl relative">
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    {...register('name')}
                    type="text"
                    placeholder="e.g. Priya Sharma"
                    disabled={isLoading}
                    autoComplete="name"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-black/30 border text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                      errors.name ? 'border-rose-500' : 'border-white/10'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="student@university.edu"
                    disabled={isLoading}
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-black/30 border text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                      errors.email ? 'border-rose-500' : 'border-white/10'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 8 characters"
                    disabled={isLoading}
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-black/30 border text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                      errors.password ? 'border-rose-500' : 'border-white/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength visualizer */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <div className={`h-1.5 rounded-full transition-all ${hasMinLength ? 'bg-emerald-400' : 'bg-white/10'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${hasUppercase ? 'bg-emerald-400' : 'bg-white/10'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${hasLowercase ? 'bg-emerald-400' : 'bg-white/10'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${hasNumber ? 'bg-emerald-400' : 'bg-white/10'}`} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[11px] text-stone-400">
                  <span className={hasMinLength ? 'text-emerald-400' : ''}>8+ chars</span>
                  <span className={hasUppercase ? 'text-emerald-400' : ''}>1 uppercase</span>
                  <span className={hasLowercase ? 'text-emerald-400' : ''}>1 lowercase</span>
                  <span className={hasNumber ? 'text-emerald-400' : ''}>1 number</span>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    disabled={isLoading}
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-black/30 border text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                      errors.confirmPassword ? 'border-rose-500' : 'border-white/10'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-400 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-stone-300 cursor-pointer">
                  <input
                    {...register('agreeTerms')}
                    type="checkbox"
                    className="mt-0.5 rounded border-white/20 bg-black/40 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" className="text-amber-400 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-amber-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-rose-400 mt-1">{errors.agreeTerms.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="btn-ios-primary w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all text-sm cursor-pointer mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Account...
                  </span>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-stone-400">
                Already registered?{' '}
                <Link
                  href="/login"
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
