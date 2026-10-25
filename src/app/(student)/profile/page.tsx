'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import {
  User,
  Globe,
  Building,
  Languages,
  Heart,
  HelpCircle,
  Save,
  Users,
  ShieldCheck,
  Clock,
  AlertCircle,
  Calendar,
  Sparkles,
  Camera,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
  { id: 'academic', label: 'Academic Guidance' },
  { id: 'cultural', label: 'Cultural Adjustment' },
  { id: 'language', label: 'Language Practice' },
  { id: 'housing', label: 'Housing & Tenancy' },
  { id: 'financial', label: 'Banking & Budgeting' },
  { id: 'social', label: 'Social & Making Friends' },
  { id: 'career', label: 'Jobs & Careers' },
  { id: 'health', label: 'Healthcare & Wellness' },
];

interface UserProfileForm {
  name: string;
  countryOfOrigin: string;
  destinationCountry: string;
  destinationCity: string;
  university: string;
  preferredLanguage: string;
  languagesSpoken: string[];
  arrivalDate: string;
  interests: string[];
  supportPreferences: string[];
  profileImage: string;
}

interface BuddyProfileForm {
  university: string;
  languages: string[];
  interests: string[];
  supportAreas: string[];
  availability: 'available' | 'busy' | 'unavailable';
  biography: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'buddy'>('profile');
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingBuddy, setSavingBuddy] = useState(false);
  const [spokenLangInput, setSpokenLangInput] = useState('');
  const [buddyLangInput, setBuddyLangInput] = useState('');
  const [existingBuddy, setExistingBuddy] = useState<any>(null);

  // User Profile Form
  const {
    register: regUser,
    handleSubmit: handleUserSubmit,
    control: userControl,
    setValue: setUserValue,
    watch: watchUser,
  } = useForm<UserProfileForm>({
    defaultValues: {
      name: '',
      countryOfOrigin: '',
      destinationCountry: '',
      destinationCity: '',
      university: '',
      preferredLanguage: 'English',
      languagesSpoken: ['English'],
      arrivalDate: '',
      interests: [],
      supportPreferences: [],
      profileImage: '',
    },
  });

  // Buddy Profile Form
  const {
    register: regBuddy,
    handleSubmit: handleBuddySubmit,
    control: buddyControl,
    setValue: setBuddyValue,
    watch: watchBuddy,
  } = useForm<BuddyProfileForm>({
    defaultValues: {
      university: '',
      languages: ['English'],
      interests: ['culture'],
      supportAreas: ['academic'],
      availability: 'available',
      biography: '',
    },
  });

  const userValues = watchUser();
  const buddyValues = watchBuddy();

  useEffect(() => {
    async function fetchAllProfiles() {
      setLoading(true);
      try {
        // Fetch user profile
        const userRes = await fetch('/api/profile');
        if (userRes.ok) {
          const uJson = await userRes.json();
          if (uJson.success && uJson.data) {
            const u = uJson.data;
            if (u.name) setUserValue('name', u.name);
            if (u.profile?.countryOfOrigin) setUserValue('countryOfOrigin', u.profile.countryOfOrigin);
            if (u.profile?.destinationCountry) setUserValue('destinationCountry', u.profile.destinationCountry);
            if (u.profile?.destinationCity) setUserValue('destinationCity', u.profile.destinationCity);
            if (u.profile?.university) setUserValue('university', u.profile.university);
            if (u.profile?.preferredLanguage) setUserValue('preferredLanguage', u.profile.preferredLanguage);
            if (u.profile?.languagesSpoken) setUserValue('languagesSpoken', u.profile.languagesSpoken);
            if (u.profile?.interests) setUserValue('interests', u.profile.interests);
            if (u.profile?.supportPreferences) setUserValue('supportPreferences', u.profile.supportPreferences);
            if (u.profile?.profileImage) setUserValue('profileImage', u.profile.profileImage);
            if (u.profile?.arrivalDate) {
              setUserValue('arrivalDate', new Date(u.profile.arrivalDate).toISOString().split('T')[0]);
            }

            // Defaults for buddy form if not yet created
            if (u.profile?.university) setBuddyValue('university', u.profile.university);
            if (u.profile?.languagesSpoken) setBuddyValue('languages', u.profile.languagesSpoken);
            if (u.profile?.interests) setBuddyValue('interests', u.profile.interests);
          }
        }

        // Fetch buddy profile
        const buddyRes = await fetch('/api/buddies/profile');
        if (buddyRes.ok) {
          const bJson = await buddyRes.json();
          if (bJson.success && bJson.data) {
            setExistingBuddy(bJson.data);
            const b = bJson.data;
            if (b.university) setBuddyValue('university', b.university);
            if (b.languages) setBuddyValue('languages', b.languages);
            if (b.interests) setBuddyValue('interests', b.interests);
            if (b.supportAreas) setBuddyValue('supportAreas', b.supportAreas);
            if (b.availability) setBuddyValue('availability', b.availability);
            if (b.biography) setBuddyValue('biography', b.biography);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }

    fetchAllProfiles();
  }, [setUserValue, setBuddyValue]);

  // Handle Save User Profile
  const onSaveUserProfile = async (data: UserProfileForm) => {
    setSavingUser(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          countryOfOrigin: data.countryOfOrigin,
          destinationCountry: data.destinationCountry,
          destinationCity: data.destinationCity,
          university: data.university,
          preferredLanguage: data.preferredLanguage,
          languagesSpoken: data.languagesSpoken,
          arrivalDate: data.arrivalDate || null,
          interests: data.interests,
          supportPreferences: data.supportPreferences,
          profileImage: data.profileImage,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Profile updated successfully!');
      } else {
        throw new Error(json.error || 'Failed to update profile');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error updating profile');
    } finally {
      setSavingUser(false);
    }
  };

  // Handle Save Buddy Profile
  const onSaveBuddyProfile = async (data: BuddyProfileForm) => {
    if (!data.university.trim()) {
      toast.error('University is required for your peer buddy profile');
      return;
    }
    if (!data.supportAreas || data.supportAreas.length === 0) {
      toast.error('Select at least one support area where you can help peers');
      return;
    }

    setSavingBuddy(true);
    try {
      const res = await fetch('/api/buddies/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          university: data.university.trim(),
          languages: data.languages || ['English'],
          interests: data.interests || ['academics'],
          supportAreas: data.supportAreas,
          availability: data.availability,
          biography: data.biography.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setExistingBuddy(json.data);
        toast.success('Peer Buddy profile saved! Awaiting admin review.');
      } else {
        throw new Error(json.error || 'Failed to save buddy profile');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving buddy profile');
    } finally {
      setSavingBuddy(false);
    }
  };

  // Toggle helpers
  const toggleInterest = (id: string) => {
    const curr = userValues.interests || [];
    setUserValue(
      'interests',
      curr.includes(id) ? curr.filter((i) => i !== id) : [...curr, id]
    );
  };

  const toggleSupport = (id: string) => {
    const curr = userValues.supportPreferences || [];
    setUserValue(
      'supportPreferences',
      curr.includes(id) ? curr.filter((s) => s !== id) : [...curr, id]
    );
  };

  const toggleBuddySupportArea = (id: string) => {
    const curr = buddyValues.supportAreas || [];
    setBuddyValue(
      'supportAreas',
      curr.includes(id) ? curr.filter((s) => s !== id) : [...curr, id]
    );
  };

  const addSpokenLang = () => {
    if (!spokenLangInput.trim()) return;
    const curr = userValues.languagesSpoken || [];
    if (!curr.includes(spokenLangInput.trim())) {
      setUserValue('languagesSpoken', [...curr, spokenLangInput.trim()]);
    }
    setSpokenLangInput('');
  };

  const removeSpokenLang = (lang: string) => {
    const curr = userValues.languagesSpoken || [];
    setUserValue(
      'languagesSpoken',
      curr.filter((l) => l !== lang)
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <User className="h-7 w-7 text-cyan-400" />
            <span>Profile & Peer Mentorship</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal background, study destination, and peer mentorship status.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'profile' | 'buddy')}
          className="w-auto"
        >
          <TabsList className="bg-slate-900/80 p-1 border border-white/10 rounded-2xl">
            <TabsTrigger value="profile" className="text-xs font-bold cursor-pointer">
              Student Profile
            </TabsTrigger>
            <TabsTrigger value="buddy" className="text-xs font-bold cursor-pointer flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Mentor Profile</span>
              {existingBuddy && (
                <span className="h-2 w-2 rounded-full bg-cyan-400 ml-1"></span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'profile' ? (
        /* MY STUDENT PROFILE FORM */
        <form onSubmit={handleUserSubmit(onSaveUserProfile)} className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" /> Basic Details
              </CardTitle>
              <CardDescription>Your contact name and avatar identifier</CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Display Name *</Label>
                  <Input id="name" {...regUser('name', { required: true })} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profileImage">Profile Image URL (Optional)</Label>
                  <Input
                    id="profileImage"
                    placeholder="https://example.com/avatar.jpg"
                    {...regUser('profileImage')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Institution */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Globe className="h-5 w-5 text-teal-600" /> Location & University
              </CardTitle>
              <CardDescription>
                Where you are travelling from and where you will be studying
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country of Origin</Label>
                  <Controller
                    name="countryOfOrigin"
                    control={userControl}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select home country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Destination Country</Label>
                  <Controller
                    name="destinationCountry"
                    control={userControl}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination country" />
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destinationCity">Destination City</Label>
                  <Input
                    id="destinationCity"
                    placeholder="e.g. Melbourne, London"
                    {...regUser('destinationCity')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalDate">Estimated Arrival Date</Label>
                  <Input id="arrivalDate" type="date" {...regUser('arrivalDate')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University / College</Label>
                <Input
                  id="university"
                  placeholder="e.g. University of Melbourne"
                  {...regUser('university')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Languages & Preferences */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Languages className="h-5 w-5 text-teal-600" /> Languages & Mentorship Needs
              </CardTitle>
              <CardDescription>
                Help other students connect with you on the right topics
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredLang">Preferred Language</Label>
                  <Input
                    id="preferredLang"
                    placeholder="e.g. English, Spanish"
                    {...regUser('preferredLanguage')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add language..."
                      value={spokenLangInput}
                      onChange={(e) => setSpokenLangInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSpokenLang();
                        }
                      }}
                    />
                    <Button type="button" variant="secondary" onClick={addSpokenLang} className="text-xs">
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(userValues.languagesSpoken || []).map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold"
                      >
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeSpokenLang(lang)}
                          className="hover:text-red-500 ml-1 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-2 pt-2">
                <Label className="font-semibold text-slate-800">Your Interests</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {INTEREST_OPTIONS.map((item) => {
                    const checked = (userValues.interests || []).includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleInterest(item.id)}
                        className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center space-x-2 ${
                          checked
                            ? 'bg-teal-50 text-teal-900 border-teal-400 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleInterest(item.id)} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Support Preferences */}
              <div className="space-y-2 pt-2">
                <Label className="font-semibold text-slate-800">Support Preferences</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {SUPPORT_OPTIONS.map((item) => {
                    const checked = (userValues.supportPreferences || []).includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSupport(item.id)}
                        className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center space-x-2 ${
                          checked
                            ? 'bg-teal-50 text-teal-900 border-teal-400 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleSupport(item.id)} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                disabled={savingUser}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingUser ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      ) : (
        /* BUDDY PROFILE FORM */
        <form onSubmit={handleBuddySubmit(onSaveBuddyProfile)} className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-600" /> Peer Buddy Profile
                </CardTitle>
                <CardDescription>
                  Share your campus tips and become a mentor for incoming international students
                </CardDescription>
              </div>

              {existingBuddy && (
                <Badge
                  variant={
                    existingBuddy.approvalStatus === 'approved'
                      ? 'success'
                      : existingBuddy.approvalStatus === 'rejected'
                      ? 'destructive'
                      : 'warning'
                  }
                  className="capitalize text-xs font-bold"
                >
                  {existingBuddy.approvalStatus === 'approved' ? 'Approved Mentor' : `Status: ${existingBuddy.approvalStatus}`}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buddyUni">University Campus *</Label>
                  <Input
                    id="buddyUni"
                    placeholder="e.g. University of Melbourne"
                    {...regBuddy('university', { required: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Availability Status</Label>
                  <Controller
                    name="availability"
                    control={buddyControl}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available (Accepting Requests)</SelectItem>
                          <SelectItem value="busy">Busy (Limited Advice)</SelectItem>
                          <SelectItem value="unavailable">Unavailable (Temporarily Paused)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-2">
                <Label htmlFor="bio">Mentor Introduction / Biography</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell incoming students about yourself, what degree you are pursuing, favorite local spots, and how you can support them..."
                  rows={4}
                  {...regBuddy('biography')}
                />
              </div>

              {/* Support Areas Offered */}
              <div className="space-y-2 pt-2">
                <Label className="font-semibold text-slate-800">
                  Areas Where You Can Mentor Peers *
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {SUPPORT_OPTIONS.map((item) => {
                    const checked = (buddyValues.supportAreas || []).includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleBuddySupportArea(item.id)}
                        className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all flex items-center space-x-2 ${
                          checked
                            ? 'bg-teal-50 text-teal-900 border-teal-400 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Checkbox checked={checked} onCheckedChange={() => toggleBuddySupportArea(item.id)} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-6 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                disabled={savingBuddy}
                className="bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingBuddy ? 'Saving...' : existingBuddy ? 'Update Buddy Profile' : 'Apply to Become a Buddy'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
