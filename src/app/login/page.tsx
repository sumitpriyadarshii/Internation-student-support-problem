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
import {
  Globe2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Plane,
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
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

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
        setErrorMessage('Invalid email or password. Please check your credentials.');
        toast.error('Invalid credentials. Please try again.');
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Brand Header with Boarding Pass vibe */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-md">
          <Plane className="w-3.5 h-3.5 text-cyan-400 rotate-45" />
          <span>Student Terminal Portal</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Welcome <span className="text-gradient-aurora">Back</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access your checklist, buddy chats, and relocation guides
        </p>
      </div>

      {/* Card Wrapper with Specular Glass highlight */}
      <div className="glass-panel glass-card-specular rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white/10">
        
        {/* Quick Demo Login Pills for Instant User Delight */}
        <div className="mb-6 p-3 rounded-2xl bg-white/[0.03] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-indigo-400" />
              <span>Instant Demo Accounts</span>
            </span>
            <span className="text-[10px] text-slate-400">1-Click Fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('priya@example.com', 'Student123!')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 border border-indigo-500/30 text-xs font-semibold transition-all text-left truncate flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="truncate">Student: Priya</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@farfromhome.com', 'Admin123!')}
              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all text-left truncate flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="truncate">Admin Console</span>
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                {...register('email')}
                type="email"
                placeholder="student@university.edu"
                disabled={isLoading}
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/70 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <Link
                href="/contact"
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="current-password"
                className={`w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/70 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                  errors.password ? 'border-rose-500' : 'border-white/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
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
            className="btn-shimmer w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 via-violet-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 active:scale-[0.99] disabled:opacity-60 transition-all text-sm cursor-pointer shadow-lg shadow-indigo-500/25 mt-2"
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

        {/* Register Link */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-sm text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            >
              Create free account
            </Link>
          </p>
        </div>
      </div>

      {/* Security Footer Note */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>256-bit encrypted secure student authentication</span>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-cyber opacity-30 pointer-events-none" />

        <Suspense
          fallback={
            <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-white/10 animate-pulse text-center text-slate-400">
              Loading student authentication...
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
