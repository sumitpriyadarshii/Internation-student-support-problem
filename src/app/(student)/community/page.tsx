'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';
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

  // Handle Register
  const handleRegister = async (eventId: string) => {
    setActionLoadingId(eventId);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('You are registered! Ticket added to My Events.');
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
        if (activeTab === 'my-events') {
          setEvents((prev) => prev.filter((e) => e._id !== eventId));
        } else {
          setEvents((prev) =>
            prev.map((e) =>
              e._id === eventId
                ? { ...e, registrationCount: Math.max(0, (e.registrationCount || 1) - 1), isRegistered: false }
                : e
            )
          );
        }
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
    <div className="space-y-6 pb-12">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-7 w-7 text-teal-600" /> Student Community Events
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Meet fellow international students, explore your new city, and join campus activities.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'all' | 'my-events')}
          className="w-auto"
        >
          <TabsList className="bg-slate-200/80 p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm cursor-pointer">
              All Events
            </TabsTrigger>
            <TabsTrigger value="my-events" className="text-xs sm:text-sm cursor-pointer flex items-center gap-1.5">
              <Ticket className="h-3.5 w-3.5 text-teal-600" />
              My Events
              {registeredIds.size > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                  {registeredIds.size}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search events by title, keyword, or venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200 text-sm"
            />
          </div>

          {/* Date Filter Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setDateFilter('upcoming')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                dateFilter === 'upcoming'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setDateFilter('past')}
              className={`text-xs px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                dateFilter === 'past'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 ml-1 mr-1" />
          {EVENT_CATEGORIES.map((cat) => {
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isRegistered = registeredIds.has(event._id) || event.isRegistered;
            const capacity = event.capacity;
            const registeredCount = event.registrationCount || 0;
            const isFull = capacity ? registeredCount >= capacity : false;
            const isPastEvent = isPast(new Date(event.startDate));

            return (
              <Card
                key={event._id}
                className="border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="outline" className="capitalize text-[11px] font-semibold text-teal-800 border-teal-200 bg-teal-50">
                      {event.category.replace('-', ' ')}
                    </Badge>

                    {isRegistered && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Registered
                      </span>
                    )}
                  </div>

                  <Link href={`/community/${event._id}`} className="block">
                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {event.description}
                    </CardDescription>
                  </Link>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  {/* Date & Location */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2 font-medium text-slate-800">
                      <Clock className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      {format(new Date(event.startDate), 'EEE, MMM d, yyyy • h:mm a')}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  {capacity ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Capacity ({registeredCount}/{capacity})</span>
                        <span className={isFull ? 'text-red-600 font-bold' : 'text-slate-600'}>
                          {isFull ? 'Sold Out' : `${capacity - registeredCount} spots left`}
                        </span>
                      </div>
                      <Progress
                        value={(registeredCount / capacity) * 100}
                        className="h-1.5 bg-slate-100"
                      />
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> Open attendance • {registeredCount} joined
                    </p>
                  )}
                </CardContent>

                <CardFooter className="p-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                    <Link href={`/community/${event._id}`}>Details</Link>
                  </Button>

                  {isPastEvent ? (
                    <Button disabled size="sm" className="flex-1 text-xs bg-slate-100 text-slate-400">
                      Event Ended
                    </Button>
                  ) : isRegistered ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelRegistration(event._id)}
                      disabled={actionLoadingId === event._id}
                      className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50 cursor-pointer"
                    >
                      {actionLoadingId === event._id ? 'Cancelling...' : 'Cancel RSVP'}
                    </Button>
                  ) : isFull ? (
                    <Button disabled size="sm" className="flex-1 text-xs bg-slate-100 text-slate-400">
                      Full
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleRegister(event._id)}
                      disabled={actionLoadingId === event._id}
                      className="flex-1 text-xs bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
                    >
                      {actionLoadingId === event._id ? 'Joining...' : 'RSVP Now'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 max-w-md mx-auto">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            {activeTab === 'my-events' ? 'No registered events' : 'No events found'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {activeTab === 'my-events'
              ? 'Browse upcoming gatherings above and RSVP to attend.'
              : 'Try checking past events or selecting a different category.'}
          </p>
          {activeTab === 'my-events' && (
            <Button
              onClick={() => setActiveTab('all')}
              className="mt-4 bg-teal-600 hover:bg-teal-500 text-white text-xs"
            >
              Browse All Events
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
