'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GoogleIcon from '@/components/ui/GoogleIcon';
import {
  Compass,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  let callbackUrl = '/dashboard';
  if (rawCallbackUrl.startsWith('/')) {
    callbackUrl = rawCallbackUrl;
  } else {
    try {
      const parsed = new URL(rawCallbackUrl);
      callbackUrl = parsed.pathname + parsed.search;
    } catch {
      callbackUrl = '/dashboard';
    }
  }

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const fillCredentials = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    toast.info(`Filled credentials for ${email}`);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        const errorMessages: Record<string, string> = {
          USER_NOT_FOUND:
            'We could not find an account with that email. Create a free account to get started.',
          GOOGLE_ACCOUNT:
            'This email is connected to Google sign-in. Please use “Continue with Google”.',
          INVALID_PASSWORD: 'That password is incorrect. Please try again or reset it.',
        };
        const message =
          errorMessages[res.code || ''] ||
          'We could not sign you in. Please check your details and try again.';
        setErrorMessage(message);
        toast.error(message);
        setIsLoading(false);
      } else {
        toast.success('Welcome back to Far From Home!');
        window.location.href = callbackUrl;
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setErrorMessage(
        err?.message || 'An unexpected error occurred during sign-in. Please try again.'
      );
      toast.error('Sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ios-pill text-amber-300 text-xs font-semibold mb-4">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>Student Portal Access</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Welcome <span className="text-gradient-sunset">Back</span>
        </h1>
        <p className="mt-2 text-sm text-stone-400">
          Sign in to access your checklist, senior buddy chats, and relocation guides
        </p>
      </div>

      {/* Card Wrapper with iOS Frosted Glass */}
      <div className="ios-glass-prominent rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        
        {/* Quick Demo Login Pills */}
        <div className="mb-6 p-3 rounded-2xl bg-white/[0.04] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>Instant 1-Click Demo</span>
            </span>
            <span className="text-[10px] text-stone-400">Testing credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('priya@example.com', 'Student123!')}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 text-xs font-semibold transition-all text-left truncate flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="truncate">Student: Priya</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@farfromhome.com', 'Admin123!')}
              className="px-3 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 text-orange-200 border border-orange-500/30 text-xs font-semibold transition-all text-left truncate flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="truncate">Admin Console</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
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

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-300">
                Password
              </label>
              <Link
                href="/contact"
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
                className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-black/30 border text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                  errors.password ? 'border-rose-500' : 'border-white/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-ios-primary w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full font-bold text-white shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all text-sm cursor-pointer mt-3"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In To Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="border-t border-white/10" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#15151b] px-3 text-xs text-stone-500">
            OR
          </span>
        </div>

        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center gap-3 py-3 rounded-full border border-white/15 bg-white/[0.06] text-sm font-bold text-white hover:bg-white/[0.12] disabled:opacity-60 transition-all cursor-pointer"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        {/* Register Link */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-stone-400">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
            >
              Create free account
            </Link>
          </p>
        </div>
      </div>

      {/* Security Footer Note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>256-bit encrypted secure student authentication</span>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-[#f7f5f0]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Warm Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-warm opacity-30 pointer-events-none" />

        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto p-8 rounded-3xl ios-glass animate-pulse text-center text-stone-400">
              Loading student portal...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
