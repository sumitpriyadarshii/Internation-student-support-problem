'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
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

  // Handle Send Request
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
        toast.success(`Request sent to ${selectedBuddy.userId.name}!`);
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
        toast.success(`Request ${status}!`);
        fetchRequests();
      } else {
        throw new Error(json.error || 'Failed to update request');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error updating request');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-teal-600" /> Peer Buddy Directory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect with seasoned international students from your university who speak your language.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'find' | 'requests')}
          className="w-auto"
        >
          <TabsList className="bg-slate-200/80 p-1">
            <TabsTrigger value="find" className="text-xs sm:text-sm cursor-pointer">
              Find Buddies
            </TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm cursor-pointer flex items-center gap-1.5">
              <Inbox className="h-3.5 w-3.5 text-teal-600" /> My Requests
              {(receivedRequests.filter((r) => r.status === 'pending').length > 0) && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                  {receivedRequests.filter((r) => r.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 'find' ? (
        <>
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Keyword Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search buddy name, bio..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 text-xs"
                />
              </div>

              {/* University Filter */}
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filter by university..."
                  value={universityFilter}
                  onChange={(e) => setUniversityFilter(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 text-xs"
                />
              </div>

              {/* Language Filter */}
              <div>
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 text-xs">
                    <Globe className="h-4 w-4 text-slate-400 mr-1.5" />
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Languages</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="Mandarin">Mandarin</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Korean">Korean</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Support Area Filter */}
              <div>
                <Select value={supportAreaFilter} onValueChange={setSupportAreaFilter}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 text-xs">
                    <HelpCircle className="h-4 w-4 text-slate-400 mr-1.5" />
                    <SelectValue placeholder="Support Area" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORT_AREAS.map((area) => (
                      <SelectItem key={area.id} value={area.id} className="text-xs">
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Buddies Grid */}
          {loadingBuddies ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-full" />
                </Card>
              ))}
            </div>
          ) : buddies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buddies.map((buddy) => {
                const matchScore = buddy.matchScore ?? 50;
                return (
                  <Card
                    key={buddy._id}
                    className="border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all flex flex-col justify-between"
                  >
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base border border-teal-200 shrink-0">
                            {buddy.userId?.name ? buddy.userId.name.charAt(0).toUpperCase() : 'B'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-900 truncate">
                              {buddy.userId?.name}
                            </h3>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <GraduationCap className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                              <span className="truncate">{buddy.university}</span>
                            </p>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <Badge
                          variant={matchScore >= 70 ? 'success' : matchScore >= 40 ? 'warning' : 'secondary'}
                          className="text-xs shrink-0 font-bold"
                        >
                          {matchScore}% match
                        </Badge>
                      </div>

                      {buddy.biography && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                          {buddy.biography}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="p-5 pt-0 space-y-3">
                      {/* Languages */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Languages</span>
                        <div className="flex flex-wrap gap-1">
                          {(buddy.languages || []).map((lang) => (
                            <span key={lang} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Support Areas */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Can Help With</span>
                        <div className="flex flex-wrap gap-1">
                          {(buddy.supportAreas || []).slice(0, 3).map((area) => (
                            <span
                              key={area}
                              className="text-[11px] bg-teal-50 text-teal-800 border border-teal-100 px-2 py-0.5 rounded font-medium capitalize"
                            >
                              {area}
                            </span>
                          ))}
                          {buddy.supportAreas?.length > 3 && (
                            <span className="text-[10px] text-slate-400 px-1 py-0.5">
                              +{buddy.supportAreas.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-5 pt-3 border-t border-slate-100 flex gap-2">
                      <Button variant="outline" size="sm" asChild className="flex-1 text-xs cursor-pointer">
                        <Link href={`/buddies/${buddy._id}`}>View Profile</Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setSelectedBuddy(buddy)}
                        className="flex-1 bg-teal-600 hover:bg-teal-500 text-white text-xs cursor-pointer"
                      >
                        <Send className="h-3 w-3 mr-1" /> Connect
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 max-w-md mx-auto">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No buddies found</h3>
              <p className="text-sm text-slate-500 mt-1">
                Try widening your search or clearing the language & university filters.
              </p>
            </div>
          )}
        </>
      ) : (
        /* MY REQUESTS TAB */
        <div className="space-y-8">
          {/* Received Requests */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Inbox className="h-5 w-5 text-teal-600" /> Incoming Requests Received
            </h2>

            {receivedRequests.length > 0 ? (
              <div className="space-y-3">
                {receivedRequests.map((req) => (
                  <Card key={req._id} className="border-slate-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                          {req.requesterId?.name ? req.requesterId.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{req.requesterId?.name}</p>
                          <p className="text-xs text-slate-500">{req.requesterId?.profile?.university || 'International Student'}</p>
                          {req.message && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                              &ldquo;{req.message}&rdquo;
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400">
                            Sent on {format(new Date(req.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Badge
                          variant={
                            req.status === 'accepted'
                              ? 'success'
                              : req.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="capitalize text-xs"
                        >
                          {req.status}
                        </Badge>

                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(req._id, 'accepted')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus(req._id, 'rejected')}
                              className="text-red-600 border-red-200 hover:bg-red-50 text-xs h-8"
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 bg-white p-6 rounded-xl border border-dashed border-slate-200 text-center">
                No incoming connection requests at this time.
              </p>
            )}
          </div>

          {/* Sent Requests */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <SendHorizontal className="h-5 w-5 text-teal-600" /> Requests You Sent
            </h2>

            {sentRequests.length > 0 ? (
              <div className="space-y-3">
                {sentRequests.map((req) => (
                  <Card key={req._id} className="border-slate-200 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {req.recipientId?.name ? req.recipientId.name.charAt(0).toUpperCase() : 'B'}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{req.recipientId?.name}</p>
                          <p className="text-xs text-slate-500">{req.recipientId?.profile?.university || 'Peer Buddy'}</p>
                          {req.message && (
                            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                              &ldquo;{req.message}&rdquo;
                            </p>
                          )}
                          <p className="text-[11px] text-slate-400">
                            Sent on {format(new Date(req.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <Badge
                          variant={
                            req.status === 'accepted'
                              ? 'success'
                              : req.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="capitalize text-xs"
                        >
                          {req.status}
                        </Badge>

                        {req.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(req._id, 'cancelled')}
                            className="text-xs border-slate-200 text-slate-600 hover:text-red-600 h-8"
                          >
                            Cancel Request
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 bg-white p-6 rounded-xl border border-dashed border-slate-200 text-center">
                You haven&apos;t sent any buddy connection requests yet. Find a buddy above to get started!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Send Buddy Request Dialog */}
      <Dialog open={!!selectedBuddy} onOpenChange={(open) => !open && setSelectedBuddy(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect with {selectedBuddy?.userId?.name}</DialogTitle>
            <DialogDescription>
              Introduce yourself and let your buddy know what topics or advice you are seeking.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendRequest} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="msg">Personalized Message</Label>
              <Textarea
                id="msg"
                placeholder="Hi! I'm an incoming student studying at your university. I'd love some advice regarding housing and coursework..."
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setSelectedBuddy(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendingRequest}
                className="bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
              >
                {sendingRequest ? 'Sending...' : 'Send Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
