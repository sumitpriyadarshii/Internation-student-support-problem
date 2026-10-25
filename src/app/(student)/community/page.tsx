'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Search,
  Filter,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Ticket,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

const EVENT_CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'campus-orientation', label: 'Campus Orientation' },
  { id: 'cultural-exchange', label: 'Cultural Exchange' },
  { id: 'language-practice', label: 'Language Practice' },
  { id: 'food-cooking', label: 'Food & Cooking' },
  { id: 'sports-recreation', label: 'Sports & Outing' },
  { id: 'career-networking', label: 'Career & Networking' },
  { id: 'local-exploration', label: 'City Tours' },
];

interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  endDate?: string;
  capacity?: number;
  registrationCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isRegistered?: boolean;
}

export default function CommunityEventsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'my-events'>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'past'>('upcoming');

  const [events, setEvents] = useState<EventItem[]>([]);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Fetch registrations
  const fetchMyRegistrations = useCallback(async () => {
    try {
      const res = await fetch('/api/events/my-registrations');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const ids = new Set<string>();
          json.data.forEach((ev: any) => ids.add(ev._id));
          setRegisteredIds(ids);
          return json.data;
        }
      }
    } catch {
      // Ignore
    }
    return [];
  }, []);

  // Fetch events list
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const myRegs = await fetchMyRegistrations();

      if (activeTab === 'my-events') {
        let filtered = [...myRegs];
        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.description.toLowerCase().includes(q) ||
              e.location.toLowerCase().includes(q)
          );
        }
        if (categoryFilter !== 'all') {
          filtered = filtered.filter((e) => e.category === categoryFilter);
        }
        if (dateFilter === 'upcoming') {
          filtered = filtered.filter((e) => !isPast(new Date(e.startDate)));
        } else {
          filtered = filtered.filter((e) => isPast(new Date(e.startDate)));
        }
        setEvents(filtered);
      } else {
        const params = new URLSearchParams();
        if (search.trim()) params.set('search', search.trim());
        if (categoryFilter !== 'all') params.set('category', categoryFilter);
        if (dateFilter === 'upcoming') params.set('upcoming', 'true');

        const res = await fetch(`/api/events?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            let list = json.data;
            if (dateFilter === 'past') {
              list = list.filter((e: any) => isPast(new Date(e.startDate)));
            }
            setEvents(list);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, categoryFilter, dateFilter, fetchMyRegistrations]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle Register with celebratory confetti
  const handleRegister = async (eventId: string) => {
    setActionLoadingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#6366f1', '#06b6d4'],
        });
        toast.success('You are registered! Your spot is confirmed! 🎟️');
        setRegisteredIds((prev) => new Set(prev).add(eventId));
        setEvents((prev) =>
          prev.map((e) =>
            e._id === eventId
              ? { ...e, registrationCount: (e.registrationCount || 0) + 1, isRegistered: true }
              : e
          )
        );
      } else {
        throw new Error(json.error || 'Failed to register');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error registering for event');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Cancel Registration
  const handleCancelRegistration = async (eventId: string) => {
    setActionLoadingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.info('Registration cancelled.');
        setRegisteredIds((prev) => {
          const updated = new Set(prev);
          updated.delete(eventId);
          return updated;
        });
        setEvents((prev) =>
          prev.map((e) =>
            e._id === eventId
              ? { ...e, registrationCount: Math.max(0, (e.registrationCount || 1) - 1), isRegistered: false }
              : e
          )
        );
      } else {
        throw new Error(json.error || 'Failed to cancel registration');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error cancelling registration');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="h-7 w-7 text-rose-400" />
            <span>Community Events & Mixers</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Meet fellow international students at orientation workshops, city tours, and social mixers.
          </p>
        </div>

        {/* Tab switcher: All Events vs My Events */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeTab === 'all' && (
              <motion.div
                layoutId="eventTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">All Meetups</span>
          </button>

          <button
            onClick={() => setActiveTab('my-events')}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'my-events' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeTab === 'my-events' && (
              <motion.div
                layoutId="eventTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-cyan-400" />
              <span>My RSVP&apos;d Tickets</span>
              {registeredIds.size > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px]">
                  {registeredIds.size}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search events by title, campus, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-950/60 border-white/10 text-white text-xs rounded-xl"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
          {EVENT_CATEGORIES.slice(0, 4).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/10 shrink-0">
          <button
            onClick={() => setDateFilter('upcoming')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dateFilter === 'upcoming'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setDateFilter('past')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dateFilter === 'past'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-panel h-64 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {events.map((event) => {
            const isRegistered = registeredIds.has(event._id);
            const isPastEvent = isPast(new Date(event.startDate));
            const isFull = event.capacity && event.registrationCount >= event.capacity && !isRegistered;

            return (
              <motion.div
                key={event._id}
                whileHover={{ y: -4 }}
                className="glass-panel glass-card-specular rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-rose-500/40 transition-all duration-300 group"
              >
                <div>
                  {/* Category and Capacity Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/25">
                      {event.category.replace('-', ' ')}
                    </span>

                    {isRegistered && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed RSVP
                      </span>
                    )}
                  </div>

                  <Link href={`/community/${event._id}`} className="block">
                    <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-2 mb-2">
                      {event.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {event.description}
                  </p>

                  <div className="space-y-2 text-xs text-slate-300 bg-black/20 p-3 rounded-2xl border border-white/5 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{format(new Date(event.startDate), 'EEE, MMM d, yyyy • h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>
                        {event.registrationCount} {event.capacity ? `/ ${event.capacity}` : ''} attending
                      </span>
                    </div>
                  </div>
                </div>

                {/* RSVP Action */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-white/10 bg-white/[0.04] hover:bg-white/10 text-white text-xs rounded-xl"
                  >
                    <Link href={`/community/${event._id}`}>Details</Link>
                  </Button>

                  {isPastEvent ? (
                    <span className="text-xs text-slate-500 font-semibold">Event Ended</span>
                  ) : isRegistered ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actionLoadingId === event._id}
                      onClick={() => handleCancelRegistration(event._id)}
                      className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs rounded-xl"
                    >
                      {actionLoadingId === event._id ? 'Cancelling...' : 'Cancel RSVP'}
                    </Button>
                  ) : isFull ? (
                    <span className="text-xs text-amber-400 font-bold">At Full Capacity</span>
                  ) : (
                    <Button
                      size="sm"
                      disabled={actionLoadingId === event._id}
                      onClick={() => handleRegister(event._id)}
                      className="bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                    >
                      {actionLoadingId === event._id ? 'Reserving...' : 'RSVP Free 🎟️'}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 p-8">
          <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Events Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'my-events'
              ? 'You have not RSVP’d to any events yet. Check out upcoming meetups!'
              : 'No upcoming events match your search. Check back soon for fresh community mixers.'}
          </p>
        </div>
      )}
    </div>
  );
}
