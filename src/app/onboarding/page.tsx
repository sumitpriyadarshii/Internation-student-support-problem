'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Compass,
  User,
  Globe2,
  Languages,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  Sparkles,
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COUNTRIES = [
  'Australia',
  'Brazil',
  'Canada',
  'China',
  'France',
  'Germany',
  'India',
  'Indonesia',
  'Ireland',
  'Italy',
  'Japan',
  'Malaysia',
  'Mexico',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'Singapore',
  'South Africa',
  'South Korea',
  'Spain',
  'Sweden',
  'Switzerland',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
];

const INTEREST_OPTIONS = [
  { id: 'academics', label: 'Academics & Research' },
  { id: 'sports', label: 'Sports & Fitness' },
  { id: 'food', label: 'Food & Cooking' },
  { id: 'culture', label: 'Local Culture & Heritage' },
  { id: 'technology', label: 'Technology & Gaming' },
  { id: 'music', label: 'Music & Concerts' },
  { id: 'art', label: 'Art & Design' },
  { id: 'travel', label: 'Travel & Outdoor Adventures' },
];

const SUPPORT_OPTIONS = [
  { id: 'academic', label: 'Academic & Coursework Guidance' },
  { id: 'cultural', label: 'Cultural Adjustment & Socializing' },
  { id: 'language', label: 'Language Practice & Communication' },
  { id: 'housing', label: 'Housing, Accommodation & Tenancy' },
  { id: 'financial', label: 'Banking, Taxes & Budgeting' },
  { id: 'social', label: 'Making Friends & Community Events' },
  { id: 'career', label: 'Part-time Jobs, Internships & Career' },
  { id: 'health', label: 'Healthcare, Insurance & Wellness' },
];

interface OnboardingFormValues {
  name: string;
  profileImage?: string;
  countryOfOrigin: string;
  destinationCountry: string;
  destinationCity: string;
  university: string;
  arrivalDate?: string;
  preferredLanguage: string;
  languagesSpoken: string[];
  interests: string[];
  supportPreferences: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [spokenLangInput, setSpokenLangInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    defaultValues: {
      name: '',
      profileImage: '',
      countryOfOrigin: '',
      destinationCountry: '',
      destinationCity: '',
      university: '',
      arrivalDate: '',
      preferredLanguage: 'English',
      languagesSpoken: ['English'],
      interests: [],
      supportPreferences: [],
    },
  });

  const formValues = watch();

  useEffect(() => {
    async function fetchCurrentState() {
      try {
        const res = await fetch('/api/onboarding');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const data = json.data;
            if (data.onboardingCompleted) {
              window.location.href = '/dashboard';
              return;
            }
            if (data.onboardingStep) {
              setStep(Math.min(Math.max(1, data.onboardingStep), 4));
            }
            if (data.name) setValue('name', data.name);
            if (data.profile) {
              const p = data.profile;
              if (p.profileImage) setValue('profileImage', p.profileImage);
              if (p.countryOfOrigin) setValue('countryOfOrigin', p.countryOfOrigin);
              if (p.destinationCountry) setValue('destinationCountry', p.destinationCountry);
              if (p.destinationCity) setValue('destinationCity', p.destinationCity);
              if (p.university) setValue('university', p.university);
              if (p.arrivalDate) {
                setValue('arrivalDate', new Date(p.arrivalDate).toISOString().split('T')[0]);
              }
              if (p.preferredLanguage) setValue('preferredLanguage', p.preferredLanguage);
              if (p.languagesSpoken && p.languagesSpoken.length > 0) {
                setValue('languagesSpoken', p.languagesSpoken);
              }
              if (p.interests && p.interests.length > 0) {
                setValue('interests', p.interests);
              }
              if (p.supportPreferences && p.supportPreferences.length > 0) {
                setValue('supportPreferences', p.supportPreferences);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load onboarding status:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentState();
  }, [setValue]);

  const handleAddLanguage = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();

    const trimmed = spokenLangInput.trim();
    if (!trimmed) return;

    const current = formValues.languagesSpoken || [];
    if (!current.includes(trimmed)) {
      setValue('languagesSpoken', [...current, trimmed]);
    }
    setSpokenLangInput('');
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    const current = formValues.languagesSpoken || [];
    setValue(
      'languagesSpoken',
      current.filter((l) => l !== langToRemove)
    );
  };

  const toggleInterest = (id: string) => {
    const current = formValues.interests || [];
    if (current.includes(id)) {
      setValue(
        'interests',
        current.filter((i) => i !== id)
      );
    } else {
      setValue('interests', [...current, id]);
    }
  };

  const toggleSupport = (id: string) => {
    const current = formValues.supportPreferences || [];
    if (current.includes(id)) {
      setValue(
        'supportPreferences',
        current.filter((s) => s !== id)
      );
    } else {
      setValue('supportPreferences', [...current, id]);
    }
  };

  const onSubmitStep = async (stepNumber: number) => {
    setSubmitting(true);
    try {
      let payload: Record<string, unknown> = {};

      if (stepNumber === 1) {
        if (!formValues.name.trim()) {
          toast.error('Please enter your full name');
          setSubmitting(false);
          return;
        }
        payload = {
          name: formValues.name.trim(),
          profileImage: formValues.profileImage,
        };
      } else if (stepNumber === 2) {
        if (!formValues.countryOfOrigin) {
          toast.error('Please select your country of origin');
          setSubmitting(false);
          return;
        }
        if (!formValues.destinationCountry) {
          toast.error('Please select your destination country');
          setSubmitting(false);
          return;
        }
        if (!formValues.destinationCity) {
          toast.error('Please enter your destination city');
          setSubmitting(false);
          return;
        }
        if (!formValues.university) {
          toast.error('Please enter your university name');
          setSubmitting(false);
          return;
        }
        payload = {
          countryOfOrigin: formValues.countryOfOrigin,
          destinationCountry: formValues.destinationCountry,
          destinationCity: formValues.destinationCity,
          university: formValues.university,
          arrivalDate: formValues.arrivalDate || undefined,
        };
      } else if (stepNumber === 3) {
        if (!formValues.preferredLanguage) {
          toast.error('Please select or specify your preferred language');
          setSubmitting(false);
          return;
        }
        if (!formValues.languagesSpoken || formValues.languagesSpoken.length === 0) {
          toast.error('Please add at least one spoken language');
          setSubmitting(false);
          return;
        }
        if (!formValues.interests || formValues.interests.length === 0) {
          toast.error('Please select at least one interest');
          setSubmitting(false);
          return;
        }
        if (!formValues.supportPreferences || formValues.supportPreferences.length === 0) {
          toast.error('Please select at least one support preference');
          setSubmitting(false);
          return;
        }
        payload = {
          preferredLanguage: formValues.preferredLanguage,
          languagesSpoken: formValues.languagesSpoken,
          interests: formValues.interests,
          supportPreferences: formValues.supportPreferences,
        };
      } else if (stepNumber === 4) {
        payload = {};
      }

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepNumber, data: payload }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save onboarding step');
      }

      if (stepNumber < 4) {
        setStep(stepNumber + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#6366f1', '#06b6d4', '#10b981', '#f43f5e'],
        });
        toast.success('Welcome aboard! Your personalized journey is live! 🎉');
        if (updateSession) {
          try {
            await updateSession({ onboardingCompleted: true });
          } catch {}
        }
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = ((step - 1) / 3) * 100;

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-cyber opacity-30 pointer-events-none" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8 relative z-10">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] mb-4">
          <Compass className="h-7 w-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Configure Your <span className="text-gradient-aurora">Global Flight Path</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          We use this to auto-generate checklists, match senior peer buddies, and tailor relocation guides.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        {/* Progress Bar & Indicators */}
        <div className="mb-6 px-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span className={step >= 1 ? 'text-cyan-400' : ''}>1. Identity</span>
            <span className={step >= 2 ? 'text-cyan-400' : ''}>2. Campus</span>
            <span className={step >= 3 ? 'text-cyan-400' : ''}>3. Interests</span>
            <span className={step >= 4 ? 'text-cyan-400' : ''}>4. Launch</span>
          </div>
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-300 ease-in-out shadow-[0_0_15px_rgba(6,182,212,0.6)]"
              style={{ width: `${Math.max(10, progressPercentage + (step === 4 ? 33 : 15))}%` }}
            />
          </div>
          <p className="text-right text-[11px] text-slate-400 mt-1 font-semibold">
            Stage {step} of 4
          </p>
        </div>

        {/* Wizard Card Container */}
        <div className="glass-panel glass-card-specular rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: Basic Profile */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Student Identity</h2>
                    <p className="text-xs text-slate-400">
                      Confirm your full name and introduce yourself to the community.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-bold text-slate-300">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Priya Sharma"
                      {...register('name', { required: true })}
                      className="bg-slate-950/60 border-white/10 text-white text-xs rounded-xl"
                    />
                    {errors.name && <p className="text-xs text-rose-400">Your name is required</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300">Avatar Image URL (Optional)</Label>
                    <div className="flex items-center gap-4 p-4 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white text-lg font-black shadow-md">
                        {formValues.name ? formValues.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-xs font-bold text-white">Default initial avatar generated</p>
                        <Input
                          placeholder="Paste image URL (optional)"
                          {...register('profileImage')}
                          className="h-8 text-xs bg-slate-950/60 border-white/10 text-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t border-white/10">
                  <Button
                    onClick={() => onSubmitStep(1)}
                    disabled={submitting}
                    className="btn-shimmer bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    {submitting ? 'Saving...' : 'Next Step: Location'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Location & Institution */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Campus & Travel Destination</h2>
                    <p className="text-xs text-slate-400">
                      Where are you departing from, and where is your university campus?
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Home Country *</Label>
                      <Controller
                        name="countryOfOrigin"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-slate-950/60 border-white/10 text-white text-xs rounded-xl">
                              <SelectValue placeholder="Select home country" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-white/15 text-white">
                              {COUNTRIES.map((c) => (
                                <SelectItem key={c} value={c} className="text-xs">
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Destination Country *</Label>
                      <Controller
                        name="destinationCountry"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-slate-950/60 border-white/10 text-white text-xs rounded-xl">
                              <SelectValue placeholder="Select study destination" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-white/15 text-white">
                              {COUNTRIES.map((c) => (
                                <SelectItem key={c} value={c} className="text-xs">
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Destination City *</Label>
                      <Input
                        placeholder="e.g. Toronto, Melbourne, London, Boston"
                        {...register('destinationCity', { required: true })}
                        className="bg-slate-950/60 border-white/10 text-white text-xs rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Target Arrival Date</Label>
                      <Input
                        type="date"
                        {...register('arrivalDate')}
                        className="bg-slate-950/60 border-white/10 text-white text-xs rounded-xl [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-300">University / Campus Name *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input
                        placeholder="e.g. University of Toronto, Imperial College London"
                        {...register('university', { required: true })}
                        className="pl-9 bg-slate-950/60 border-white/10 text-white text-xs rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 mt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="border-white/10 text-slate-300 hover:text-white rounded-xl text-xs"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={() => onSubmitStep(2)}
                    disabled={submitting}
                    className="btn-shimmer bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    {submitting ? 'Saving...' : 'Next Step: Preferences'}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Language & Preferences */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                    <Languages className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Languages & Buddy Affinity</h2>
                    <p className="text-xs text-slate-400">
                      Help us match you with senior peer buddies with shared languages and backgrounds.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Primary Spoken Language</Label>
                      <Input
                        placeholder="e.g. English, Hindi, Spanish, Mandarin"
                        {...register('preferredLanguage')}
                        className="bg-slate-950/60 border-white/10 text-white text-xs rounded-xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Languages You Speak</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type and press Add"
                          value={spokenLangInput}
                          onChange={(e) => setSpokenLangInput(e.target.value)}
                          onKeyDown={handleAddLanguage}
                          className="bg-slate-950/60 border-white/10 text-white text-xs rounded-xl"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleAddLanguage()}
                          className="bg-white/10 hover:bg-white/15 text-white text-xs rounded-xl"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(formValues.languagesSpoken || []).map((lang) => (
                          <span
                            key={lang}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold"
                          >
                            {lang}
                            <button
                              type="button"
                              onClick={() => handleRemoveLanguage(lang)}
                              className="hover:text-rose-400"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">Your Interests & Passions</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {INTEREST_OPTIONS.map((item) => {
                        const isChecked = (formValues.interests || []).includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleInterest(item.id)}
                            className={`flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-indigo-500/20 border-indigo-500/50 text-white shadow-sm'
                                : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <Checkbox checked={isChecked} onCheckedChange={() => toggleInterest(item.id)} />
                            <span className="text-xs font-semibold">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Support Needed */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-300">Areas Where You Need Guidance</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SUPPORT_OPTIONS.map((item) => {
                        const isChecked = (formValues.supportPreferences || []).includes(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleSupport(item.id)}
                            className={`flex items-center space-x-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-white shadow-sm'
                                : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <Checkbox checked={isChecked} onCheckedChange={() => toggleSupport(item.id)} />
                            <span className="text-xs font-semibold">{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-6 mt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="border-white/10 text-slate-300 hover:text-white rounded-xl text-xs"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={() => onSubmitStep(3)}
                    disabled={submitting}
                    className="btn-shimmer bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    {submitting ? 'Saving...' : 'Review & Confirm'}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Review & Complete */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Review & Ready to Launch</h2>
                    <p className="text-xs text-slate-400">
                      Confirm your setup to auto-assign checklist milestones and buddy matches.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-black/30 border border-white/10 p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Student</p>
                      <p className="text-sm font-bold text-white">{formValues.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Edit
                    </Button>
                  </div>

                  <div className="flex justify-between items-start pb-3 border-b border-white/10">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Target University</p>
                      <p className="text-sm font-bold text-white">
                        {formValues.countryOfOrigin} ➔ {formValues.destinationCity}, {formValues.destinationCountry}
                      </p>
                      <p className="text-xs text-indigo-300 font-semibold">{formValues.university}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(2)}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Edit
                    </Button>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Languages & Support</p>
                      <p className="text-xs text-slate-300 mt-1">
                        Spoken: {(formValues.languagesSpoken || []).join(', ')}
                      </p>
                      <p className="text-xs text-slate-300 capitalize">
                        Interests: {(formValues.interests || []).join(', ')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(3)}
                      className="text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3 mt-5">
                  <CheckCircle2 className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-300 leading-relaxed">
                    By confirming, Far From Home will automatically generate your personalized relocation checklist, unlock survival handbooks, and run the weighted buddy match algorithm!
                  </p>
                </div>

                <div className="flex justify-between pt-6 mt-6 border-t border-white/10">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="border-white/10 text-slate-300 hover:text-white rounded-xl text-xs"
                  >
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={() => onSubmitStep(4)}
                    disabled={submitting}
                    className="btn-shimmer bg-gradient-to-r from-indigo-500 via-violet-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-black text-sm px-7 py-3 rounded-xl shadow-lg shadow-indigo-500/40 cursor-pointer"
                  >
                    {submitting ? 'Launching Cockpit...' : 'Launch Student Cockpit 🚀'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
