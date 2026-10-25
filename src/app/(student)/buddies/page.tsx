'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Globe,
  Heart,
  HelpCircle,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Inbox,
  SendHorizontal,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BuddyItem {
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
}

interface BuddyRequestItem {
  _id: string;
  requesterId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      university?: string;
      profileImage?: string;
    };
  };
  recipientId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      university?: string;
      profileImage?: string;
    };
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
}

const SUPPORT_AREAS = [
  { id: 'all', label: 'All Support Areas' },
  { id: 'academic', label: 'Academic & Courses' },
  { id: 'cultural', label: 'Cultural Adjustment' },
  { id: 'language', label: 'Language Practice' },
  { id: 'housing', label: 'Housing & Living' },
  { id: 'financial', label: 'Banking & Budgeting' },
  { id: 'social', label: 'Social & Making Friends' },
  { id: 'career', label: 'Jobs & Careers' },
  { id: 'health', label: 'Health & Wellness' },
];

export default function BuddiesPage() {
  const [activeTab, setActiveTab] = useState<'find' | 'requests'>('find');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [supportAreaFilter, setSupportAreaFilter] = useState('all');

  const [buddies, setBuddies] = useState<BuddyItem[]>([]);
  const [loadingBuddies, setLoadingBuddies] = useState(true);

  // Requests State
  const [sentRequests, setSentRequests] = useState<BuddyRequestItem[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<BuddyRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Send Request Dialog
  const [selectedBuddy, setSelectedBuddy] = useState<BuddyItem | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  // Fetch Buddies
  const fetchBuddies = useCallback(async () => {
    setLoadingBuddies(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (universityFilter.trim()) params.set('university', universityFilter.trim());
      if (languageFilter !== 'all') params.set('language', languageFilter);
      if (supportAreaFilter !== 'all') params.set('supportArea', supportAreaFilter);

      const res = await fetch(`/api/buddies?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBuddies(json.data);
        }
      }
    } catch {
      toast.error('Failed to load peer buddies');
    } finally {
      setLoadingBuddies(false);
    }
  }, [search, universityFilter, languageFilter, supportAreaFilter]);

  // Fetch Requests
  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const res = await fetch('/api/buddy-requests');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSentRequests(json.data.sent || []);
          setReceivedRequests(json.data.received || []);
        }
      }
    } catch {
      toast.error('Failed to load buddy requests');
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'find') {
      fetchBuddies();
    } else {
      fetchRequests();
    }
  }, [activeTab, fetchBuddies, fetchRequests]);

  // Handle Send Request with Confetti
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuddy) return;

    setSendingRequest(true);
    try {
      const res = await fetch('/api/buddy-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedBuddy.userId._id,
          message: requestMessage.trim() || 'Hi! I would love to connect with you on Far From Home.',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#6366f1', '#ec4899'],
        });
        toast.success(`Connection request sent to ${selectedBuddy.userId.name}! 🤝`);
        setSelectedBuddy(null);
        setRequestMessage('');
      } else {
        throw new Error(json.error || 'Failed to send buddy request');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error sending request');
    } finally {
      setSendingRequest(false);
    }
  };

  // Handle Request Status Change
  const handleUpdateStatus = async (requestId: string, status: 'accepted' | 'rejected' | 'cancelled') => {
    try {
      const res = await fetch(`/api/buddy-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (status === 'accepted') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10b981', '#f59e0b', '#f97316'],
          });
          toast.success('Buddy request accepted! You are now connected! 🎉');
        } else {
          toast.info(`Request ${status}`);
        }
        fetchRequests();
      } else {
        throw new Error(json.error || 'Failed to update request');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error updating request');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="h-7 w-7 text-amber-400" />
            <span>Senior Peer Network</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Connect with verified senior students at your university who speak your native language.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-full ios-glass border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('find')}
            className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'find' ? 'text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            {activeTab === 'find' && (
              <motion.div
                layoutId="buddyTabPill"
                className="absolute inset-0 rounded-full btn-ios-primary shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" />
              <span>Explore Directory</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`relative px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'requests' ? 'text-white' : 'text-stone-400 hover:text-white'
            }`}
          >
            {activeTab === 'requests' && (
              <motion.div
                layoutId="buddyTabPill"
                className="absolute inset-0 rounded-full btn-ios-primary shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5" />
              <span>Requests & Connections</span>
              {receivedRequests.filter((r) => r.status === 'pending').length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {receivedRequests.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'find' ? (
        <>
          {/* Filters Bar */}
          <div className="ios-glass p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
              <Input
                type="text"
                placeholder="Search name, university, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
              />
            </div>

            {/* University Filter */}
            <div>
              <Input
                type="text"
                placeholder="Filter by university..."
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className="bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
              />
            </div>

            {/* Support Area */}
            <div>
              <Select value={supportAreaFilter} onValueChange={setSupportAreaFilter}>
                <SelectTrigger className="bg-white/[0.04] border-white/10 text-white text-xs rounded-xl">
                  <SelectValue placeholder="Support Area" />
                </SelectTrigger>
                <SelectContent className="bg-[#1c1613] border-white/15 text-white">
                  {SUPPORT_AREAS.map((area) => (
                    <SelectItem key={area.id} value={area.id} className="text-xs">
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setUniversityFilter('');
                setSupportAreaFilter('all');
                setLanguageFilter('all');
              }}
              className="ios-pill border-white/10 text-stone-300 hover:text-white bg-white/[0.04] text-xs"
            >
              Reset Filters
            </Button>
          </div>

          {/* Buddies Grid */}
          {loadingBuddies ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="ios-glass h-64 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : buddies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {buddies.map((buddy) => (
                <motion.div
                  key={buddy._id}
                  whileHover={{ y: -4 }}
                  className="ios-glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-all duration-300"
                >
                  <div>
                    {/* Header: Avatar, Name, Compatibility Score */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                          {buddy.userId?.name ? buddy.userId.name.charAt(0).toUpperCase() : 'B'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-white truncate">
                            {buddy.userId?.name || 'Fellow Scholar'}
                          </h3>
                          <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5 truncate">
                            <GraduationCap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{buddy.university}</span>
                          </p>
                        </div>
                      </div>

                      {typeof buddy.matchScore === 'number' && (
                        <span className="text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-full shadow-inner shrink-0">
                          {buddy.matchScore}% Match
                        </span>
                      )}
                    </div>

                    {/* Biography */}
                    <p className="text-xs text-stone-300 leading-relaxed bg-black/20 p-3 rounded-2xl border border-white/5 line-clamp-3 mb-4">
                      {buddy.biography || 'Eager to assist incoming international scholars settle in with confidence!'}
                    </p>

                    {/* Spoken Languages */}
                    <div className="mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Spoken Languages
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(buddy.languages || []).map((lang) => (
                          <span
                            key={lang}
                            className="text-[11px] bg-white/[0.06] text-stone-300 px-2.5 py-0.5 rounded-full font-medium"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Support Areas */}
                    <div className="mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                        Can Assist With
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(buddy.supportAreas || []).slice(0, 3).map((area) => (
                          <span
                            key={area}
                            className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-semibold capitalize"
                          >
                            {area.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-white/10">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="ios-pill border-white/15 bg-white/[0.04] hover:bg-white/10 text-white text-xs"
                    >
                      <Link href={`/buddies/${buddy._id}`}>Full Profile</Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedBuddy(buddy)}
                      className="btn-ios-primary text-xs shadow-md cursor-pointer"
                    >
                      <SendHorizontal className="w-3.5 h-3.5 mr-1" /> Connect
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 p-8">
              <Users className="h-12 w-12 text-stone-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No Buddies Match Your Filter</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                Try widening your search terms or clearing university filters to see more mentors.
              </p>
            </div>
          )}
        </>
      ) : (
        /* Requests & Connections Tab */
        <div className="space-y-8">
          {/* Received Requests */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Inbox className="w-4 h-4 text-amber-400" />
              <span>Incoming Connection Requests</span>
            </h2>

            {loadingRequests ? (
              <div className="space-y-2">
                <div className="ios-glass h-20 rounded-2xl animate-pulse" />
              </div>
            ) : receivedRequests.length > 0 ? (
              <div className="space-y-3">
                {receivedRequests.map((req) => (
                  <div
                    key={req._id}
                    className="ios-glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-sm">
                          {req.requesterId?.name}
                        </span>
                        <Badge
                          className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                            req.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : req.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {req.requesterId?.profile?.university || 'International Student'} •{' '}
                        {format(new Date(req.createdAt), 'MMM d, yyyy')}
                      </p>
                      {req.message && (
                        <p className="text-xs text-stone-300 bg-black/20 p-2.5 rounded-xl border border-white/5 mt-2.5">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(req._id, 'accepted')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full px-4"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(req._id, 'rejected')}
                          className="ios-pill border-white/10 text-rose-400 hover:bg-rose-500/10 text-xs"
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="ios-glass p-6 rounded-2xl border border-white/5 text-center text-xs text-stone-400">
                No incoming connection requests.
              </div>
            )}
          </div>

          {/* Sent Requests */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <SendHorizontal className="w-4 h-4 text-orange-400" />
              <span>Sent Connection Requests</span>
            </h2>

            {loadingRequests ? (
              <div className="ios-glass h-20 rounded-2xl animate-pulse" />
            ) : sentRequests.length > 0 ? (
              <div className="space-y-3">
                {sentRequests.map((req) => (
                  <div
                    key={req._id}
                    className="ios-glass rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-sm">
                          {req.recipientId?.name}
                        </span>
                        <Badge
                          className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                            req.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : req.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {req.recipientId?.profile?.university || 'Senior Peer'} •{' '}
                        {format(new Date(req.createdAt), 'MMM d, yyyy')}
                      </p>
                      {req.message && (
                        <p className="text-xs text-stone-300 bg-black/20 p-2.5 rounded-xl border border-white/5 mt-2.5">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                    </div>

                    {req.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(req._id, 'cancelled')}
                        className="ios-pill border-white/10 text-stone-400 hover:text-white text-xs"
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="ios-glass p-6 rounded-2xl border border-white/5 text-center text-xs text-stone-400">
                You haven&apos;t sent any connection requests yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Connect Request Dialog */}
      <Dialog open={Boolean(selectedBuddy)} onOpenChange={() => setSelectedBuddy(null)}>
        <DialogContent className="sm:max-w-md ios-glass-prominent border-white/15 text-white backdrop-blur-3xl bg-[#171311]/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white">
              Connect with {selectedBuddy?.userId?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-400">
              Send a friendly introduction message to start chatting and getting guidance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendRequest} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-stone-300">Quick Icebreaker</Label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Hi! I’m arriving this semester, would love some housing advice!',
                  'Hello! Can you help me understand campus registration?',
                  'Hey there! Looking forward to making friends at our university!',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRequestMessage(preset)}
                    className="text-[11px] text-left p-2.5 rounded-xl ios-glass hover:bg-white/[0.08] border border-white/10 text-stone-300 transition-colors"
                  >
                    💡 {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reqMsg" className="text-xs font-bold text-stone-300">
                Personalized Message
              </Label>
              <Textarea
                id="reqMsg"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Write your note here..."
                rows={3}
                className="bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedBuddy(null)}
                className="ios-pill border-white/15 text-stone-300 hover:text-white text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendingRequest}
                className="btn-ios-primary text-xs shadow-md"
              >
                {sendingRequest ? 'Sending...' : 'Send Request 🚀'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
