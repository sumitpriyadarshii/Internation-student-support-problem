'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Globe,
  Heart,
  HelpCircle,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BuddyDetail {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      countryOfOrigin?: string;
      profileImage?: string;
    };
  };
  university: string;
  languages: string[];
  interests: string[];
  supportAreas: string[];
  availability: 'available' | 'busy' | 'unavailable';
  biography?: string;
  matchScore: number;
  matchHighlights?: {
    sharedLanguages?: string[];
    sharedInterests?: string[];
    sharedSupportAreas?: string[];
  };
}

export default function BuddyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [buddy, setBuddy] = useState<BuddyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<string | null>(null);

  // Send Request Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadBuddy() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/buddies/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setBuddy(json.data);

            // Check if existing request exists
            const reqRes = await fetch('/api/buddy-requests');
            if (reqRes.ok) {
              const reqJson = await reqRes.json();
              if (reqJson.success) {
                const targetUserId = json.data.userId?._id;
                const foundSent = (reqJson.data.sent || []).find(
                  (r: any) => r.recipientId?._id === targetUserId
                );
                if (foundSent) {
                  setRequestStatus(foundSent.status);
                } else {
                  const foundReceived = (reqJson.data.received || []).find(
                    (r: any) => r.requesterId?._id === targetUserId
                  );
                  if (foundReceived) {
                    setRequestStatus(foundReceived.status);
                  }
                }
              }
            }
          } else {
            toast.error('Buddy profile not found');
          }
        } else {
          toast.error('Failed to load profile');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error loading buddy');
      } finally {
        setLoading(false);
      }
    }

    loadBuddy();
  }, [id]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buddy) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/buddy-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: buddy.userId._id,
          message: message.trim() || 'Hi! I would love to connect with you as my student buddy.',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Connection request sent!');
        setRequestStatus('pending');
        setIsDialogOpen(false);
      } else {
        throw new Error(json.error || 'Failed to send request');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error sending request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!buddy) {
    return (
      <div className="text-center py-16">
        <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Buddy not found</h2>
        <Button onClick={() => router.push('/buddies')} className="mt-4 bg-teal-600 text-white">
          Back to Directory
        </Button>
      </div>
    );
  }

  const matchScore = buddy.matchScore ?? 50;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="text-xs text-slate-600 hover:text-slate-900 border-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Directory
        </Button>

        {requestStatus ? (
          <Badge
            variant={
              requestStatus === 'accepted'
                ? 'success'
                : requestStatus === 'pending'
                ? 'warning'
                : 'secondary'
            }
            className="text-xs px-3 py-1 capitalize font-semibold"
          >
            {requestStatus === 'accepted' ? 'Connected Buddies' : `Request ${requestStatus}`}
          </Badge>
        ) : (
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs cursor-pointer shadow-sm"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" /> Send Buddy Request
          </Button>
        )}
      </div>

      {/* Profile Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-3xl shadow-lg shadow-teal-700/20">
              {buddy.userId?.name ? buddy.userId.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{buddy.userId?.name}</h1>
                <Badge
                  variant={
                    buddy.availability === 'available'
                      ? 'success'
                      : buddy.availability === 'busy'
                      ? 'warning'
                      : 'secondary'
                  }
                  className="capitalize text-[10px]"
                >
                  {buddy.availability}
                </Badge>
              </div>

              <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium">
                <GraduationCap className="h-4 w-4 text-teal-600" />
                {buddy.university}
              </p>

              {buddy.userId?.profile?.countryOfOrigin && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  Originally from {buddy.userId.profile.countryOfOrigin}
                </p>
              )}
            </div>
          </div>

          {/* Match Score Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center sm:w-48 shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400">Student Compatibility</span>
            <p className="text-3xl font-extrabold text-teal-700 mt-0.5">{matchScore}%</p>
            <p className="text-xs text-slate-500 font-medium">Match Score</p>
          </div>
        </div>

        {/* Biography */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            About Me
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
            {buddy.biography || 'This buddy has not written a personal introduction yet.'}
          </p>
        </div>
      </div>

      {/* Match Breakdown & Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Match Score Highlights (1 col) */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-teal-600" /> Match Breakdown
            </CardTitle>
            <CardDescription className="text-xs">
              Based on common institution, languages, and study needs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Shared Languages</span>
                <span className="text-teal-600">
                  {buddy.matchHighlights?.sharedLanguages?.length || 0} in common
                </span>
              </div>
              <Progress
                value={
                  buddy.matchHighlights?.sharedLanguages && buddy.matchHighlights.sharedLanguages.length > 0
                    ? 100
                    : 30
                }
                className="h-2"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Same Campus</span>
                <span className="text-teal-600">Yes</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Shared Interests</span>
                <span className="text-teal-600">
                  {buddy.matchHighlights?.sharedInterests?.length || 0} in common
                </span>
              </div>
              <Progress
                value={
                  buddy.matchHighlights?.sharedInterests && buddy.matchHighlights.sharedInterests.length > 0
                    ? 80
                    : 20
                }
                className="h-2"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span>Support Alignment</span>
                <span className="text-teal-600">
                  {buddy.matchHighlights?.sharedSupportAreas?.length || 0} matches
                </span>
              </div>
              <Progress
                value={
                  buddy.matchHighlights?.sharedSupportAreas && buddy.matchHighlights.sharedSupportAreas.length > 0
                    ? 90
                    : 30
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags Details (2 cols) */}
        <Card className="md:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Languages, Hobbies & Mentorship
            </CardTitle>
            <CardDescription className="text-xs">
              What this peer can help you with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Spoken Languages */}
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                Languages Spoken
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(buddy.languages || []).map((lang) => {
                  const isShared = buddy.matchHighlights?.sharedLanguages?.includes(lang);
                  return (
                    <span
                      key={lang}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                        isShared
                          ? 'bg-teal-50 text-teal-800 border-teal-300 font-semibold'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {lang} {isShared && '★'}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Support Areas */}
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                Support Areas Offered
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(buddy.supportAreas || []).map((area) => {
                  const isShared = buddy.matchHighlights?.sharedSupportAreas?.includes(area);
                  return (
                    <span
                      key={area}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize border ${
                        isShared
                          ? 'bg-teal-100 text-teal-900 border-teal-300 font-bold'
                          : 'bg-teal-50 text-teal-800 border-teal-200'
                      }`}
                    >
                      {area}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
            <div>
              <span className="text-xs font-semibold uppercase text-slate-400 block mb-2">
                Personal Interests & Clubs
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(buddy.interests || []).map((interest) => {
                  const isShared = buddy.matchHighlights?.sharedInterests?.includes(interest);
                  return (
                    <span
                      key={interest}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize border ${
                        isShared
                          ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {interest}
                    </span>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Connection Request</DialogTitle>
            <DialogDescription>
              Reach out to {buddy.userId?.name}. They will receive your notification and message.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendRequest} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="reqMsg">Your Message</Label>
              <Textarea
                id="reqMsg"
                placeholder="Hi! I saw your profile and would appreciate some guidance with campus life..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
              >
                {submitting ? 'Sending...' : 'Send Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
