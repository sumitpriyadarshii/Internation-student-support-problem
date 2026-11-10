'use client';

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn, signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setErrorCode(null);

    try {
      const res = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        const parsedCode =
          res.code ||
          (res.url
            ? new URL(res.url, window.location.origin).searchParams.get('code')
            : null) ||
          '';

        setErrorCode(parsedCode);

        const errorMessages: Record<string, string> = {
          USER_NOT_FOUND: 'No administrator account found with that email.',
          GOOGLE_ACCOUNT:
            'This account uses Google sign-in and cannot log in with an administrator password.',
          INVALID_PASSWORD: 'Incorrect password. Please try again.',
          WARNING_LAST_ATTEMPT:
            'Warning: 4 incorrect attempts recorded. One more failed attempt will lock this account for 15 minutes.',
          ACCOUNT_LOCKED:
            'Account temporarily locked due to multiple failed attempts. Try again in 15 minutes.',
          IP_BLOCKED:
            'Too many failed attempts from this network. Access suspended for 15 minutes.',
        };

        const message =
          errorMessages[parsedCode] || 'Authentication failed. Please check your credentials.';
        setErrorMessage(message);
        toast.error(message);
        setIsLoading(false);
      } else {
        // After sign-in, verify the user is actually admin
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();
        const role = (session?.user as { role?: string })?.role;

        if (role !== 'admin') {
          // Signed in but not admin — sign them out properly and show error
          await signOut({ redirect: false });
          setErrorMessage(
            'Access denied. This portal is restricted to administrators only.'
          );
          toast.error('Access denied. This portal is restricted to administrators only.');
          setIsLoading(false);
          return;
        }

        toast.success('Welcome, Administrator!');
        window.location.href = '/admin';
      }
    } catch (err: any) {
      console.error('Admin sign-in error:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      toast.error('Sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 py-12">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-rose-900/20 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 mb-4">
            <ShieldCheck className="w-7 h-7 text-rose-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="mt-1.5 text-sm text-stone-500">Far From Home — Restricted Access</p>
        </div>

        {/* Warning banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-300 leading-relaxed">
            This is a <strong className="text-rose-200">restricted administrative portal</strong>.
            Unauthorized access attempts are logged and monitored. If you are not an administrator,
            please use the{' '}
            <a href="/login" className="underline text-rose-200 hover:text-white">
              student login
            </a>
            .
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Error message */}
          {errorMessage && (
            <div
              className={`mb-5 p-4 rounded-2xl flex items-start gap-3 text-xs leading-relaxed ${
                errorCode === 'ACCOUNT_LOCKED' || errorCode === 'IP_BLOCKED'
                  ? 'bg-rose-500/20 border border-rose-500/50 text-rose-200'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-bold text-white mb-0.5">Authentication Failed</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-stone-600 text-sm focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.08] transition-all"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-stone-600 text-sm focus:outline-none focus:border-rose-500/50 focus:bg-white/[0.08] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In to Admin Console</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-stone-600 mt-6">
          All access attempts are logged for security.
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <AdminLoginForm />
    </Suspense>
  );
}
