'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Compass,
  User,
  Globe,
  Languages,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  Sparkles,
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

interface OnboardingFormData {
  // Step 1
  name: string;
  profileImage: string;
  // Step 2
  countryOfOrigin: string;
  destinationCountry: string;
  destinationCity: string;
  university: string;
  arrivalDate: string;
  // Step 3
  preferredLanguage: string;
  languagesSpoken: string[];
  interests: string[];
  supportPreferences: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [spokenLangInput, setSpokenLangInput] = useState('');

  const {
    register,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
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
      interests: ['culture', 'travel'],
      supportPreferences: ['academic', 'housing'],
    },
  });

  const formValues = watch();

  // Load existing profile if available
  useEffect(() => {
    async function loadInitialData() {
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
            if (data.name) setValue('name', data.name);
            if (data.profile?.profileImage) setValue('profileImage', data.profile.profileImage);
            if (data.profile?.countryOfOrigin) setValue('countryOfOrigin', data.profile.countryOfOrigin);
            if (data.profile?.destinationCountry) setValue('destinationCountry', data.profile.destinationCountry);
            if (data.profile?.destinationCity) setValue('destinationCity', data.profile.destinationCity);
            if (data.profile?.university) setValue('university', data.profile.university);
            if (data.profile?.arrivalDate) {
              setValue('arrivalDate', new Date(data.profile.arrivalDate).toISOString().split('T')[0]);
            }
            if (data.profile?.preferredLanguage) setValue('preferredLanguage', data.profile.preferredLanguage);
            if (data.profile?.languagesSpoken?.length) setValue('languagesSpoken', data.profile.languagesSpoken);
            if (data.profile?.interests?.length) setValue('interests', data.profile.interests);
            if (data.profile?.supportPreferences?.length) setValue('supportPreferences', data.profile.supportPreferences);
          }
        }
      } catch {
        // Silently proceed with defaults
      }
    }

    if (session?.user?.name && !formValues.name) {
      setValue('name', session.user.name);
    }
    loadInitialData();
  }, [session, setValue]);

  // Handle adding spoken language
  const handleAddLanguage = (e?: React.KeyboardEvent) => {
    if (e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    const trimmed = spokenLangInput.trim();
    if (!trimmed) return;
    const current = formValues.languagesSpoken || [];
    if (!current.includes(trimmed)) {
      setValue('languagesSpoken', [...current, trimmed]);
    }
    setSpokenLangInput('');
  };

  const handleRemoveLanguage = (lang: string) => {
    const current = formValues.languagesSpoken || [];
    setValue(
      'languagesSpoken',
      current.filter((l) => l !== lang)
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
        // Final completion
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
        toast.success('Welcome to Far From Home! Your profile is ready.');
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-teal-500 text-white shadow-xl shadow-teal-500/20 mb-4">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Welcome to Far From Home
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Let’s set up your personal journey and match you with guides, tasks, and buddies.
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Progress Bar & Indicators */}
        <div className="mb-6 px-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            <span className={step >= 1 ? 'text-teal-400' : 'text-slate-500'}>1. Profile</span>
            <span className={step >= 2 ? 'text-teal-400' : 'text-slate-500'}>2. Location</span>
            <span className={step >= 3 ? 'text-teal-400' : 'text-slate-500'}>3. Preferences</span>
            <span className={step >= 4 ? 'text-teal-400' : 'text-slate-500'}>4. Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-700/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-300 ease-in-out"
              style={{ width: `${Math.max(10, progressPercentage + (step === 4 ? 33 : 15))}%` }}
            />
          </div>
          <p className="text-right text-xs text-slate-400 mt-1.5">Step {step} of 4</p>
        </div>

        {/* Wizard Card Container */}
        <Card className="border border-slate-700/80 bg-slate-800/90 backdrop-blur-md shadow-2xl text-slate-100">
          {/* STEP 1: Basic Profile */}
          {step === 1 && (
            <div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Basic Profile</CardTitle>
                    <CardDescription className="text-slate-400">
                      Confirm your full name and introduce yourself.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">
                    Full Name <span className="text-teal-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Alex Morgan"
                    {...register('name', { required: true })}
                    className="bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500 focus:ring-teal-500"
                  />
                  {errors.name && <p className="text-xs text-red-400">Your name is required</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Profile Picture (Optional)</Label>
                  <div className="flex items-center gap-4 p-4 border border-dashed border-slate-700 rounded-xl bg-slate-900/50">
                    <div className="h-16 w-16 rounded-full bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300 text-xl font-bold">
                      {formValues.name ? formValues.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-slate-200">Default avatar generated</p>
                      <p className="text-xs text-slate-400">
                        You can paste an image URL or update your photo later in your Profile settings.
                      </p>
                      <Input
                        placeholder="Avatar image URL (optional)"
                        {...register('profileImage')}
                        className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end pt-4 border-t border-slate-700/60">
                <Button
                  onClick={() => onSubmitStep(1)}
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-medium cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Next Step'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </div>
          )}

          {/* STEP 2: Location & Institution */}
          {step === 2 && (
            <div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Location & University</CardTitle>
                    <CardDescription className="text-slate-400">
                      Where are you moving from, and where is your study destination?
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="countryOfOrigin" className="text-slate-200">
                      Country of Origin <span className="text-teal-400">*</span>
                    </Label>
                    <Controller
                      name="countryOfOrigin"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                            <SelectValue placeholder="Select home country" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c} value={c} className="hover:bg-slate-800">
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destinationCountry" className="text-slate-200">
                      Destination Country <span className="text-teal-400">*</span>
                    </Label>
                    <Controller
                      name="destinationCountry"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                            <SelectValue placeholder="Select destination country" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c} value={c} className="hover:bg-slate-800">
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
                  <div className="space-y-2">
                    <Label htmlFor="destinationCity" className="text-slate-200">
                      Destination City <span className="text-teal-400">*</span>
                    </Label>
                    <Input
                      id="destinationCity"
                      placeholder="e.g. Melbourne, London, Toronto"
                      {...register('destinationCity', { required: true })}
                      className="bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrivalDate" className="text-slate-200">
                      Estimated Arrival Date (Optional)
                    </Label>
                    <Input
                      id="arrivalDate"
                      type="date"
                      {...register('arrivalDate')}
                      className="bg-slate-900 border-slate-700 text-white focus:border-teal-500 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university" className="text-slate-200">
                    University / College Name <span className="text-teal-400">*</span>
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="university"
                      placeholder="e.g. University of Melbourne, Imperial College"
                      {...register('university', { required: true })}
                      className="pl-9 bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500"
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    We use your institution to connect you with peers studying on the same campus.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t border-slate-700/60">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => onSubmitStep(2)}
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-medium cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Next Step'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </div>
          )}

          {/* STEP 3: Language & Preferences */}
          {step === 3 && (
            <div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Languages className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Languages & Interests</CardTitle>
                    <CardDescription className="text-slate-400">
                      Help us customize checklists, guides, and peer buddy suggestions.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferredLanguage" className="text-slate-200">
                      Primary / Preferred Language
                    </Label>
                    <Input
                      id="preferredLanguage"
                      placeholder="e.g. English, Spanish, Mandarin"
                      {...register('preferredLanguage')}
                      className="bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Languages You Speak</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a language (Press Enter)"
                        value={spokenLangInput}
                        onChange={(e) => setSpokenLangInput(e.target.value)}
                        onKeyDown={handleAddLanguage}
                        className="bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-teal-500 text-sm"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleAddLanguage()}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3"
                      >
                        Add
                      </Button>
                    </div>
                    {/* Language Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(formValues.languagesSpoken || []).map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium"
                        >
                          {lang}
                          <button
                            type="button"
                            onClick={() => handleRemoveLanguage(lang)}
                            className="hover:text-red-400 focus:outline-none ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Interests Checkboxes */}
                <div className="space-y-2.5">
                  <Label className="text-slate-200 font-medium">
                    What are your interests & hobbies?
                  </Label>
                  <p className="text-xs text-slate-400">Select all that apply to find buddies with shared passions.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {INTEREST_OPTIONS.map((item) => {
                      const isChecked = (formValues.interests || []).includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleInterest(item.id)}
                          className={`flex items-center space-x-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-teal-500/15 border-teal-500/50 text-white'
                              : 'bg-slate-900/40 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <Checkbox checked={isChecked} onCheckedChange={() => toggleInterest(item.id)} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Support Preferences Checkboxes */}
                <div className="space-y-2.5 pt-2">
                  <Label className="text-slate-200 font-medium">
                    What kind of support are you looking for?
                  </Label>
                  <p className="text-xs text-slate-400">Choose the areas where a senior student or peer buddy can assist you most.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {SUPPORT_OPTIONS.map((item) => {
                      const isChecked = (formValues.supportPreferences || []).includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleSupport(item.id)}
                          className={`flex items-center space-x-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-teal-500/15 border-teal-500/50 text-white'
                              : 'bg-slate-900/40 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <Checkbox checked={isChecked} onCheckedChange={() => toggleSupport(item.id)} />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t border-slate-700/60">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => onSubmitStep(3)}
                  disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-500 text-white font-medium cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Review Summary'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </div>
          )}

          {/* STEP 4: Summary & Completion */}
          {step === 4 && (
            <div>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Summary & Confirmation</CardTitle>
                    <CardDescription className="text-slate-400">
                      Everything looks great! Confirm below to launch your personalized dashboard.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-2">
                <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-400">Student Name</p>
                      <p className="text-base font-semibold text-white">{formValues.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                      className="text-xs text-teal-400 hover:text-teal-300 hover:bg-slate-800"
                    >
                      Edit
                    </Button>
                  </div>

                  <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Journey & University</p>
                      <p className="text-sm font-medium text-slate-200">
                        {formValues.countryOfOrigin} &rarr; {formValues.destinationCity},{' '}
                        {formValues.destinationCountry}
                      </p>
                      <p className="text-xs text-teal-400 font-medium">{formValues.university}</p>
                      {formValues.arrivalDate && (
                        <p className="text-xs text-slate-400">
                          Estimated Arrival: {formValues.arrivalDate}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(2)}
                      className="text-xs text-teal-400 hover:text-teal-300 hover:bg-slate-800"
                    >
                      Edit
                    </Button>
                  </div>

                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wider text-slate-400">Languages & Support</p>
                      <div>
                        <span className="text-xs text-slate-400">Spoken: </span>
                        <span className="text-xs text-slate-200 font-medium">
                          {(formValues.languagesSpoken || []).join(', ') || 'English'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Key Interests: </span>
                        <span className="text-xs text-slate-200 font-medium capitalize">
                          {(formValues.interests || []).join(', ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Support Needed: </span>
                        <span className="text-xs text-slate-200 font-medium capitalize">
                          {(formValues.supportPreferences || []).join(', ')}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(3)}
                      className="text-xs text-teal-400 hover:text-teal-300 hover:bg-slate-800"
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800/60 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-400 mt-0.5 shrink-0" />
                  <div className="text-xs text-teal-200 leading-relaxed">
                    By confirming, we will auto-generate your destination checklist, recommended survival guides, and
                    student buddy matching algorithms!
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4 border-t border-slate-700/60">
                <Button
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => onSubmitStep(4)}
                  disabled={submitting}
                  className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 shadow-lg shadow-teal-500/20 cursor-pointer"
                >
                  {submitting ? 'Setting up...' : 'Complete & Go to Dashboard'}
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
