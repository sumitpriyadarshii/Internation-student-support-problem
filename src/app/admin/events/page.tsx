'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Calendar,
  Search,
  Filter,
  PlusCircle,
  Edit,
  Trash2,
  XCircle,
  Users,
  MapPin,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Mail,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { EVENT_CATEGORIES, type CommunityEventCategory, type CommunityEventStatus } from '@/types';

interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: CommunityEventCategory;
  location: string;
  startDate: string;
  endDate?: string;
  capacity?: number;
  registrationCount: number;
  status: CommunityEventStatus;
  createdAt: string;
}

interface RegistrationItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      university?: string;
      countryOfOrigin?: string;
      destinationCountry?: string;
    };
  };
  registrationStatus: 'registered' | 'cancelled';
  registeredAt: string;
}

interface EventFormData {
  title: string;
  description: string;
  category: CommunityEventCategory;
  location: string;
  startDate: string;
  endDate: string;
  capacity: number | '';
  status: CommunityEventStatus;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Registrations Dialog State
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<EventItem | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [registrationsOpen, setRegistrationsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: 'cultural-exchange',
      location: '',
      startDate: '',
      endDate: '',
      capacity: 50,
      status: 'upcoming',
    },
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: search.trim(),
        category: categoryFilter,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/events?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setEvents(json.data || []);
      } else {
        toast.error(json.error || 'Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      toast.error('Network error loading events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingEvent(null);
    const now = new Date();
    now.setDate(now.getDate() + 7);
    now.setHours(18, 0, 0, 0);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const defaultStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;

    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const defaultEnd = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;

    reset({
      title: '',
      description: '',
      category: 'cultural-exchange',
      location: '',
      startDate: defaultStart,
      endDate: defaultEnd,
      capacity: 40,
      status: 'upcoming',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: EventItem) => {
    setEditingEvent(event);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toIsoLocal = (dStr: string) => {
      if (!dStr) return '';
      const d = new Date(dStr);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    reset({
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      startDate: toIsoLocal(event.startDate),
      endDate: event.endDate ? toIsoLocal(event.endDate) : '',
      capacity: event.capacity ?? '',
      status: event.status,
    });
    setIsModalOpen(true);
  };

  const openRegistrationsModal = async (event: EventItem) => {
    setSelectedEventForRegistrations(event);
    setRegistrationsOpen(true);
    try {
      setLoadingRegistrations(true);
      const res = await fetch(`/api/admin/events/${event._id}/registrations`);
      const json = await res.json();
      if (json.success && json.data) {
        setRegistrations(json.data || []);
      } else {
        toast.error(json.error || 'Failed to load attendees');
      }
    } catch (err) {
      toast.error('Network error loading attendees');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      setSubmitting(true);
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        location: data.location.trim(),
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        capacity: data.capacity !== '' ? Number(data.capacity) : undefined,
        status: data.status,
      };

      const endpoint = editingEvent
        ? `/api/admin/events/${editingEvent._id}`
        : '/api/admin/events';
      const method = editingEvent ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(editingEvent ? 'Event updated' : 'Event created');
        setIsModalOpen(false);
        fetchEvents();
      } else {
        toast.error(json.error || 'Failed to save event');
      }
    } catch (err) {
      toast.error('Network error saving event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (!confirm('Cancel this event? Registered students will see it as cancelled.')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Event cancelled');
        setEvents((prev) =>
          prev.map((e) => (e._id === eventId ? { ...e, status: 'cancelled' } : e))
        );
      } else {
        toast.error(json.error || 'Failed to cancel event');
      }
    } catch (err) {
      toast.error('Error cancelling event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Permanently remove this event and its registrations?')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Event deleted');
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
      } else {
        toast.error(json.error || 'Failed to delete event');
      }
    } catch (err) {
      toast.error('Error deleting event');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-400" />
            Event Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Coordinate campus orientations, cultural food nights, language exchanges, and student mixers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEvents}
            disabled={loading}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            onClick={openCreateModal}
            className="bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/20"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search events by title, description, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              {/* Category */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Event</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Registrations / Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-44 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-6 w-16 ml-auto bg-slate-800" /></td>
                  </tr>
                ))
              ) : events.length > 0 ? (
                events.map((ev) => {
                  const cap = ev.capacity || 0;
                  const ratio = cap > 0 ? Math.min(100, Math.round((ev.registrationCount / cap) * 100)) : 0;

                  return (
                    <tr
                      key={ev._id}
                      className="hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Title & Desc */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-white group-hover:text-teal-300 transition line-clamp-1">
                          {ev.title}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {ev.description}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10 text-[10px] capitalize">
                          {ev.category.replace(/-/g, ' ')}
                        </Badge>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-slate-300">
                        <div className="space-y-0.5">
                          <div className="font-medium text-slate-200 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-teal-400" />
                            {new Date(ev.startDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(ev.startDate).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-[180px]">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      </td>

                      {/* Capacity / Registrations */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 w-32">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300 font-medium">
                              {ev.registrationCount} {cap ? `/ ${cap}` : 'attending'}
                            </span>
                            {cap > 0 && <span className="text-[10px] text-slate-400">{ratio}%</span>}
                          </div>
                          {cap > 0 && (
                            <Progress
                              value={ratio}
                              className="h-1.5 bg-slate-800"
                            />
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {ev.status === 'upcoming' ? (
                          <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40 text-[10px]">
                            Upcoming
                          </Badge>
                        ) : ev.status === 'ongoing' ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] animate-pulse">
                            Live Now
                          </Badge>
                        ) : ev.status === 'completed' ? (
                          <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                            Completed
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px]">
                            Cancelled
                          </Badge>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openRegistrationsModal(ev)}
                            className="h-7 w-7 text-slate-400 hover:text-blue-300 hover:bg-slate-800"
                            title="View Registrations"
                          >
                            <Users className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(ev)}
                            className="h-7 w-7 text-slate-400 hover:text-teal-300 hover:bg-slate-800"
                            title="Edit Event"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          {ev.status !== 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCancelEvent(ev._id)}
                              className="h-7 w-7 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                              title="Cancel Event"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteEvent(ev._id)}
                            className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No community events found. Click "Create Event" to schedule one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Event Create / Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-slate-100 p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-400" />
              {editingEvent ? 'Edit Community Event' : 'Schedule Community Event'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Organise international student meetups, language tables, and city exploration tours.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-xs">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Event Title *</label>
              <Input
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                })}
                placeholder="e.g. International Food & Culture Festival"
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
              {errors.title && <p className="text-red-400 text-[11px]">{errors.title.message}</p>}
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Category *</label>
                <select
                  {...register('category', { required: true })}
                  className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Status *</label>
                <select
                  {...register('status')}
                  className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Description *</label>
              <Textarea
                {...register('description', {
                  required: 'Description is required',
                  minLength: { value: 10, message: 'Minimum 10 characters' },
                })}
                rows={3}
                placeholder="Details about the agenda, who should attend, and what to bring..."
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
              {errors.description && <p className="text-red-400 text-[11px]">{errors.description.message}</p>}
            </div>

            {/* Location & Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Location / Meeting Point *</label>
                <Input
                  {...register('location', { required: 'Location is required' })}
                  placeholder="e.g. Student Union Hall or Zoom Link"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
                {errors.location && <p className="text-red-400 text-[11px]">{errors.location.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Max Capacity (Seats)</label>
                <Input
                  {...register('capacity')}
                  type="number"
                  placeholder="e.g. 50 (leave empty for unlimited)"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
            </div>

            {/* Start and End Date/Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Start Date & Time *</label>
                <Input
                  {...register('startDate', { required: 'Start date is required' })}
                  type="datetime-local"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
                {errors.startDate && <p className="text-red-400 text-[11px]">{errors.startDate.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">End Date & Time</label>
                <Input
                  {...register('endDate')}
                  type="datetime-local"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-slate-800 pt-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20"
              >
                {submitting ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Registrations List Dialog */}
      <Dialog open={registrationsOpen} onOpenChange={setRegistrationsOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 p-6 max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center justify-between">
              <span>Registered Students</span>
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40 text-xs">
                {registrations.length} Total Attendees
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              {selectedEventForRegistrations?.title} • {selectedEventForRegistrations?.location}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1 text-xs">
            {loadingRegistrations ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-slate-800/60 rounded-xl" />
              ))
            ) : registrations.length > 0 ? (
              registrations.map((reg) => (
                <div
                  key={reg._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-700">
                      <AvatarFallback className="bg-slate-800 text-teal-300 text-xs font-semibold">
                        {reg.userId?.name?.slice(0, 2).toUpperCase() || 'ST'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{reg.userId?.name || 'Registered Student'}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        {reg.userId?.email}
                      </p>
                      {reg.userId?.profile?.university && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <GraduationCap className="w-3 h-3 text-blue-400" />
                          {reg.userId.profile.university} (
                          {reg.userId.profile.countryOfOrigin || 'Intl'} &rarr;{' '}
                          {reg.userId.profile.destinationCountry || 'Host'})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <Badge
                      className={
                        reg.registrationStatus === 'registered'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]'
                          : 'bg-red-500/15 text-red-400 border-red-500/30 text-[10px]'
                      }
                    >
                      {reg.registrationStatus}
                    </Badge>
                    <p className="text-[10px] text-slate-400">
                      {new Date(reg.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                <Users className="w-8 h-8 mb-2 opacity-30" />
                <p>No student registrations found for this event yet.</p>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-slate-800 pt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRegistrationsOpen(false)}
              className="bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
