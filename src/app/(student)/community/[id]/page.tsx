'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, isPast } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Ticket,
  User,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface EventDetail {
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
  organiserId?: {
    _id: string;
    name: string;
    email: string;
  };
  isRegistered?: boolean;
  createdAt: string;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadEvent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setEvent(json.data);
        } else {
          toast.error('Event not found');
        }
      } else {
        toast.error('Failed to load event details');
      }
    } catch {
      toast.error('Error loading event');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!event) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${event._id}/register`, {
        method: 'POST',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Registration confirmed! See you there.');
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                isRegistered: true,
                registrationCount: (prev.registrationCount || 0) + 1,
              }
            : null
        );
      } else {
        throw new Error(json.error || 'Failed to register');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error registering for event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/${event._id}/register`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.info('Registration cancelled');
        setEvent((prev) =>
          prev
            ? {
                ...prev,
                isRegistered: false,
                registrationCount: Math.max(0, (prev.registrationCount || 1) - 1),
              }
            : null
        );
      } else {
        throw new Error(json.error || 'Failed to cancel registration');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error cancelling registration');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Event not found</h2>
        <Button onClick={() => router.push('/community')} className="mt-4 bg-teal-600 text-white">
          Back to Events
        </Button>
      </div>
    );
  }

  const capacity = event.capacity;
  const count = event.registrationCount || 0;
  const isFull = capacity ? count >= capacity : false;
  const isPastEvent = isPast(new Date(event.startDate));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/dashboard" className="hover:text-teal-600">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/community" className="hover:text-teal-600">
            Community
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{event.title}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="text-xs text-slate-600 hover:text-slate-900 border-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Community
        </Button>
      </div>

      {/* Event Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant="outline" className="capitalize text-xs font-semibold text-teal-800 border-teal-200 bg-teal-50">
            {event.category.replace('-', ' ')}
          </Badge>

          {event.isRegistered && (
            <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" /> You are attending
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
          {event.title}
        </h1>

        {/* Date, Time & Venue Highlight Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Date & Time</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {format(new Date(event.startDate), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-xs text-slate-600">
                {format(new Date(event.startDate), 'h:mm a')}
                {event.endDate && ` – ${format(new Date(event.endDate), 'h:mm a')}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase">Location / Venue</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{event.location}</p>
              <p className="text-xs text-slate-500">See campus directions</p>
            </div>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <User className="h-4 w-4 text-slate-400" />
            <span>Organized by {event.organiserId?.name || 'Far From Home Campus Ambassador'}</span>
          </div>

          {isPastEvent ? (
            <Button disabled className="bg-slate-100 text-slate-400 w-full sm:w-auto">
              This Event Has Concluded
            </Button>
          ) : event.isRegistered ? (
            <Button
              variant="outline"
              onClick={handleCancelRegistration}
              disabled={actionLoading}
              className="text-red-600 border-red-200 hover:bg-red-50 text-xs w-full sm:w-auto cursor-pointer"
            >
              {actionLoading ? 'Cancelling...' : 'Cancel Registration'}
            </Button>
          ) : isFull ? (
            <Button disabled className="bg-slate-100 text-slate-400 w-full sm:w-auto">
              Fully Booked
            </Button>
          ) : (
            <Button
              onClick={handleRegister}
              disabled={actionLoading}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-6 shadow-md shadow-teal-700/20 w-full sm:w-auto cursor-pointer"
            >
              {actionLoading ? 'Registering...' : 'RSVP / Register Free'}
            </Button>
          )}
        </div>
      </div>

      {/* Description & Capacity Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Full Description (2 cols) */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            About this Community Event
          </h2>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap space-y-3">
            {event.description}
          </div>
        </div>

        {/* Capacity & Attendees Stats (1 col) */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ticket className="h-4 w-4 text-teal-600" /> Attendance Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Registered Attendees</span>
                  <span className="text-teal-600">{count} people</span>
                </div>
                {capacity ? (
                  <>
                    <Progress value={(count / capacity) * 100} className="h-2 bg-slate-100" />
                    <p className="text-[11px] text-slate-500 mt-2">
                      {capacity - count > 0
                        ? `${capacity - count} of ${capacity} tickets remaining`
                        : 'Event is fully booked'}
                    </p>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Open event — all students are welcome to attend without cap.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-teal-900 text-white">
            <CardContent className="p-5 space-y-2">
              <h3 className="font-bold text-sm text-white">Student Safety & Conduct</h3>
              <p className="text-xs text-teal-200 leading-relaxed">
                All Far From Home events are hosted in safe, accessible student-friendly locations. Please
                bring your student ID card along.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
