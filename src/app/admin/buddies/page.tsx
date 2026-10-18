'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Mail,
  GraduationCap,
  Globe,
  Heart,
  MessageSquare,
  Shield,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import type { BuddyApprovalStatus, BuddyAvailability, BuddySupportArea } from '@/types';

interface BuddyProfileItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      countryOfOrigin?: string;
      destinationCountry?: string;
      destinationCity?: string;
      profileImage?: string;
    };
  };
  university: string;
  languages: string[];
  interests: string[];
  supportAreas: BuddySupportArea[];
  availability: BuddyAvailability;
  biography?: string;
  approvalStatus: BuddyApprovalStatus;
  createdAt: string;
}

interface BuddyRequestItem {
  _id: string;
  requesterId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      countryOfOrigin?: string;
      destinationCountry?: string;
      university?: string;
    };
  };
  recipientId: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      countryOfOrigin?: string;
      destinationCountry?: string;
      university?: string;
    };
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
}

export default function AdminBuddiesPage() {
  const [activeTab, setActiveTab] = useState<'profiles' | 'requests'>('profiles');
  const [profiles, setProfiles] = useState<BuddyProfileItem[]>([]);
  const [requests, setRequests] = useState<BuddyRequestItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [selectedProfile, setSelectedProfile] = useState<BuddyProfileItem | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: search.trim(),
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/buddies?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setProfiles(json.data || []);
      } else {
        toast.error(json.error || 'Failed to fetch buddy profiles');
      }
    } catch (err) {
      console.error('Error fetching buddy profiles:', err);
      toast.error('Network error loading buddy profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/buddies/requests');
      const json = await res.json();

      if (json.success && json.data) {
        setRequests(json.data || []);
      } else {
        toast.error(json.error || 'Failed to fetch buddy requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      toast.error('Network error loading buddy requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'profiles') {
      const timer = setTimeout(() => {
        fetchProfiles();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      fetchRequests();
    }
  }, [activeTab, search, statusFilter]);

  const handleUpdateApproval = async (profileId: string, status: 'approved' | 'rejected') => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/buddies/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: status }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Buddy profile marked as ${status}`);
        setProfiles((prev) =>
          prev.map((p) => (p._id === profileId ? { ...p, approvalStatus: status } : p))
        );
        if (selectedProfile?._id === profileId) {
          setSelectedProfile((prev) => (prev ? { ...prev, approvalStatus: status } : null));
        }
      } else {
        toast.error(json.error || 'Failed to update approval status');
      }
    } catch (err) {
      toast.error('Network error updating approval status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-teal-400" />
            Buddy Program Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Vet senior peer mentors, review mentorship applications, and monitor student connection requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => (activeTab === 'profiles' ? fetchProfiles() : fetchRequests())}
            disabled={loading}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs Control */}
      <Tabs
        value={activeTab}
        onValueChange={(val: any) => setActiveTab(val)}
        className="w-full space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger
              value="profiles"
              className="text-xs data-[state=active]:bg-teal-600 data-[state=active]:text-white text-slate-300"
            >
              Mentor Profiles ({profiles.length})
            </TabsTrigger>
            <TabsTrigger
              value="requests"
              className="text-xs data-[state=active]:bg-teal-600 data-[state=active]:text-white text-slate-300"
            >
              Connection Requests ({requests.length})
            </TabsTrigger>
          </TabsList>

          {activeTab === 'profiles' && (
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Search university, language..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 pl-9 bg-slate-950 border-slate-800 text-slate-100 text-xs placeholder:text-slate-500 focus-visible:ring-teal-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Buddy Profiles */}
        <TabsContent value="profiles" className="space-y-4 m-0">
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Student Buddy</th>
                    <th className="py-3.5 px-4">University</th>
                    <th className="py-3.5 px-4">Languages</th>
                    <th className="py-3.5 px-4">Support Areas</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-4">Approval Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-40 bg-slate-800" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 bg-slate-800" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 bg-slate-800" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                        <td className="py-3.5 px-4 text-right"><Skeleton className="h-6 w-16 ml-auto bg-slate-800" /></td>
                      </tr>
                    ))
                  ) : profiles.length > 0 ? (
                    profiles.map((p) => (
                      <tr
                        key={p._id}
                        onClick={() => {
                          setSelectedProfile(p);
                          setProfileModalOpen(true);
                        }}
                        className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                      >
                        {/* User Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-slate-700">
                              <AvatarImage src={p.userId?.profile?.profileImage} />
                              <AvatarFallback className="bg-slate-800 text-teal-300 font-semibold text-xs">
                                {p.userId?.name?.slice(0, 2).toUpperCase() || 'BD'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-semibold text-white group-hover:text-teal-300 transition">
                                {p.userId?.name || 'Unnamed Student'}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {p.userId?.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* University */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="font-medium">{p.university}</span>
                          </div>
                        </td>

                        {/* Languages */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="flex flex-wrap gap-1">
                            {p.languages?.slice(0, 2).map((l, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                              >
                                {l}
                              </span>
                            ))}
                            {p.languages?.length > 2 && (
                              <span className="text-[10px] text-slate-500 self-center">
                                +{p.languages.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Support Areas */}
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="flex flex-wrap gap-1">
                            {p.supportAreas?.slice(0, 2).map((sa, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="border-teal-500/20 bg-teal-500/5 text-teal-300 text-[9px] capitalize"
                              >
                                {sa}
                              </Badge>
                            ))}
                            {p.supportAreas?.length > 2 && (
                              <span className="text-[10px] text-slate-500 self-center">
                                +{p.supportAreas.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Availability */}
                        <td className="py-3.5 px-4">
                          {p.availability === 'available' ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                              Available
                            </Badge>
                          ) : p.availability === 'busy' ? (
                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">
                              Busy
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                              Unavailable
                            </Badge>
                          )}
                        </td>

                        {/* Approval Status */}
                        <td className="py-3.5 px-4">
                          {p.approvalStatus === 'approved' ? (
                            <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40 text-[10px]">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          ) : p.approvalStatus === 'rejected' ? (
                            <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px]">
                              <XCircle className="w-3 h-3 mr-1" />
                              Rejected
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px] animate-pulse">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            {p.approvalStatus !== 'approved' && (
                              <Button
                                size="sm"
                                disabled={actionLoading}
                                onClick={() => handleUpdateApproval(p._id, 'approved')}
                                className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                                title="Approve Buddy"
                              >
                                Approve
                              </Button>
                            )}

                            {p.approvalStatus !== 'rejected' && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading}
                                onClick={() => handleUpdateApproval(p._id, 'rejected')}
                                className="h-7 px-2 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                title="Reject Buddy"
                              >
                                Reject
                              </Button>
                            )}

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedProfile(p);
                                setProfileModalOpen(true);
                              }}
                              className="h-7 w-7 text-slate-400 hover:text-teal-300 hover:bg-slate-800"
                              title="View Full Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No buddy profiles found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Buddy Requests */}
        <TabsContent value="requests" className="space-y-4 m-0">
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-4">Requester (Student)</th>
                    <th className="py-3.5 px-4">Recipient (Senior Buddy)</th>
                    <th className="py-3.5 px-4">Message / Note</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Requested On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-xs">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-32 bg-slate-800" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-32 bg-slate-800" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-48 bg-slate-800" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                        <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                      </tr>
                    ))
                  ) : requests.length > 0 ? (
                    requests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-800/50 transition-colors">
                        {/* Requester */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">
                            {req.requesterId?.name || 'Student'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {req.requesterId?.email}
                          </div>
                        </td>

                        {/* Recipient */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">
                            {req.recipientId?.name || 'Mentor'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {req.recipientId?.email}
                          </div>
                        </td>

                        {/* Message */}
                        <td className="py-3.5 px-4 max-w-sm text-slate-300">
                          {req.message ? (
                            <p className="line-clamp-2 italic text-slate-300">
                              "{req.message}"
                            </p>
                          ) : (
                            <span className="text-slate-500 italic">No custom message included</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {req.status === 'accepted' ? (
                            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                              Accepted
                            </Badge>
                          ) : req.status === 'rejected' ? (
                            <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px]">
                              Rejected
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">
                              Pending
                            </Badge>
                          )}
                        </td>

                        {/* Requested Date */}
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        No buddy connection requests logged in the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Details Dialog */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-between">
              <span>Buddy Application Review</span>
              {selectedProfile?.approvalStatus === 'approved' ? (
                <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40 text-xs">
                  Approved Mentor
                </Badge>
              ) : selectedProfile?.approvalStatus === 'rejected' ? (
                <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-xs">
                  Rejected
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-xs">
                  Pending Approval
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Review volunteer details, languages, support offerings, and mentoring biography.
            </DialogDescription>
          </DialogHeader>

          {selectedProfile && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <Avatar className="h-12 w-12 border border-teal-500/30">
                  <AvatarFallback className="bg-slate-800 text-teal-300 font-bold">
                    {selectedProfile.userId?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedProfile.userId?.name}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-teal-400" />
                    {selectedProfile.userId?.email}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <GraduationCap className="w-3 h-3 text-blue-400" />
                    {selectedProfile.university}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold text-[11px]">Volunteer Biography</span>
                <p className="text-slate-200 leading-relaxed text-xs">
                  {selectedProfile.biography || 'No biographical statement provided.'}
                </p>
              </div>

              {/* Support Areas & Languages */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-semibold text-[11px]">Support Areas</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.supportAreas?.map((sa, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="border-teal-500/30 bg-teal-500/10 text-teal-300 text-[10px] capitalize"
                      >
                        {sa}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-slate-400 font-semibold text-[11px]">Languages Spoken</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProfile.languages?.map((lang, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="border-slate-700 bg-slate-800 text-slate-300 text-[10px]"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interests */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-slate-400 font-semibold text-[11px]">Interests & Passions</span>
                <div className="flex flex-wrap gap-1">
                  {selectedProfile.interests?.map((item, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="border-purple-500/20 bg-purple-500/5 text-purple-300 text-[10px]"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-slate-800 pt-4 flex gap-2">
            {selectedProfile && (
              <>
                {selectedProfile.approvalStatus !== 'approved' && (
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateApproval(selectedProfile._id, 'approved')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    Approve Mentor
                  </Button>
                )}
                {selectedProfile.approvalStatus !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => handleUpdateApproval(selectedProfile._id, 'rejected')}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                    Reject
                  </Button>
                )}
              </>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setProfileModalOpen(false)}
              className="bg-slate-800 text-slate-300 hover:bg-slate-700 ml-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
