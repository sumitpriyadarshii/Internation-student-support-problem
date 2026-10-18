'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  MoreVertical,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  GraduationCap,
  Globe,
  Calendar,
  Eye,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  accountStatus: 'active' | 'suspended' | 'deactivated';
  onboardingCompleted: boolean;
  profile?: {
    countryOfOrigin?: string;
    destinationCountry?: string;
    destinationCity?: string;
    university?: string;
    preferredLanguage?: string;
    languagesSpoken?: string[];
    arrivalDate?: string;
    interests?: string[];
    supportPreferences?: string[];
    profileImage?: string;
  };
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async (pageNumber = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: '10',
        search: search.trim(),
        role: roleFilter,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setUsers(json.data.users || []);
        setTotal(json.data.total || 0);
        setPage(json.data.page || 1);
        setTotalPages(json.data.totalPages || 1);
      } else {
        toast.error(json.error || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Network error loading users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter]);

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'suspended') => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accountStatus: newStatus }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`User status updated to ${newStatus}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, accountStatus: newStatus } : u))
        );
        if (selectedUser?._id === userId) {
          setSelectedUser((prev) => (prev ? { ...prev, accountStatus: newStatus } : null));
        }
      } else {
        toast.error(json.error || 'Failed to update user status');
      }
    } catch (err) {
      toast.error('Error executing user status change');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'student' | 'admin') => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`User role changed to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
        if (selectedUser?._id === userId) {
          setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
        }
      } else {
        toast.error(json.error || 'Failed to update user role');
      }
    } catch (err) {
      toast.error('Error executing role change');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-400" />
            User Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Monitor international students, oversee credentials, suspend/reactivate accounts, and manage administrative privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(page)}
            disabled={loading}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, university..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              {/* Role filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="admin">Admins</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Data Table */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Destination / Origin</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full bg-slate-800" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3 w-28 bg-slate-800" />
                          <Skeleton className="h-2.5 w-36 bg-slate-800" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4"><Skeleton className="h-3 w-24 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-5 w-16 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-5 w-16 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-3 w-20 bg-slate-800" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-7 w-8 ml-auto bg-slate-800" /></td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => {
                  const initials = u.name
                    ? u.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'U';

                  return (
                    <tr
                      key={u._id}
                      onClick={() => {
                        setSelectedUser(u);
                        setDetailsOpen(true);
                      }}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-700">
                            <AvatarImage src={u.profile?.profileImage} />
                            <AvatarFallback className="bg-slate-800 text-teal-300 font-semibold text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-white group-hover:text-teal-300 transition">
                              {u.name}
                            </div>
                            <div className="text-slate-400 text-[11px]">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Origin & Destination */}
                      <td className="py-3.5 px-4 text-slate-300">
                        {u.profile?.destinationCountry ? (
                          <div className="space-y-0.5">
                            <div className="font-medium text-slate-200">
                              {u.profile.countryOfOrigin || 'International'} &rarr; {u.profile.destinationCountry}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {u.profile.university || u.profile.destinationCity || 'University not specified'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Not set</span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {u.role === 'admin' ? (
                          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[11px] font-medium">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/30 text-[11px] font-medium">
                            Student
                          </Badge>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {u.accountStatus === 'active' ? (
                          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
                            Active
                          </Badge>
                        ) : u.accountStatus === 'suspended' ? (
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5" />
                            Suspended
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-700/50 text-slate-400 border-slate-600 text-[11px]">
                            Deactivated
                          </Badge>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-900 border-slate-800 text-slate-200 w-44"
                          >
                            <DropdownMenuLabel className="text-xs text-slate-400">
                              User Actions
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(u);
                                setDetailsOpen(true);
                              }}
                              className="cursor-pointer hover:bg-slate-800 hover:text-teal-300"
                            >
                              <Eye className="w-3.5 h-3.5 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-800" />

                            {u.accountStatus === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => handleUpdateUserStatus(u._id, 'suspended')}
                                className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              >
                                <UserX className="w-3.5 h-3.5 mr-2" />
                                Suspend Account
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleUpdateUserStatus(u._id, 'active')}
                                className="cursor-pointer text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                              >
                                <UserCheck className="w-3.5 h-3.5 mr-2" />
                                Activate Account
                              </DropdownMenuItem>
                            )}

                            {u.role === 'student' ? (
                              <DropdownMenuItem
                                onClick={() => handleUpdateUserRole(u._id, 'admin')}
                                className="cursor-pointer text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                              >
                                <Shield className="w-3.5 h-3.5 mr-2" />
                                Promote to Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleUpdateUserRole(u._id, 'student')}
                                className="cursor-pointer text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                              >
                                <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                                Demote to Student
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No users matching the filters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-800 gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{users.length}</span> of{' '}
            <span className="font-semibold text-slate-200">{total}</span> users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(page - 1)}
              disabled={page <= 1 || loading}
              className="h-8 border-slate-800 bg-slate-950 text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Prev
            </Button>
            <span className="px-2 font-medium text-slate-300">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(page + 1)}
              disabled={page >= totalPages || loading}
              className="h-8 border-slate-800 bg-slate-950 text-slate-300 disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-slate-100 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center justify-between">
              <span>Student Profile Details</span>
              {selectedUser?.role === 'admin' ? (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-xs">
                  Administrator
                </Badge>
              ) : (
                <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40 text-xs">
                  International Student
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Complete account record, destination journey, and onboarding parameters.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-5 pt-2">
              {/* Header Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <Avatar className="h-14 w-14 border border-teal-500/30">
                  <AvatarImage src={selectedUser.profile?.profileImage} />
                  <AvatarFallback className="bg-slate-800 text-teal-300 text-lg font-bold">
                    {selectedUser.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3 h-3 text-teal-400" />
                    {selectedUser.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {selectedUser.accountStatus === 'active' ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                        Active Account
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[10px]">
                        Suspended
                      </Badge>
                    )}
                    {selectedUser.onboardingCompleted ? (
                      <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]">
                        Onboarding Done
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">
                        Onboarding Incomplete
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Education & Relocation Info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-medium">Relocation Route</span>
                  <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-teal-400" />
                    {selectedUser.profile?.countryOfOrigin || 'Origin not specified'} &rarr;{' '}
                    {selectedUser.profile?.destinationCountry || 'Destination not specified'}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    City: {selectedUser.profile?.destinationCity || 'N/A'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-slate-500 font-medium">University / Campus</span>
                  <p className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    {selectedUser.profile?.university || 'University not specified'}
                  </p>
                  <p className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Arrival:{' '}
                    {selectedUser.profile?.arrivalDate
                      ? new Date(selectedUser.profile.arrivalDate).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
              </div>

              {/* Languages & Interests */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1.5">Languages Spoken</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.profile?.languagesSpoken &&
                    selectedUser.profile.languagesSpoken.length > 0 ? (
                      selectedUser.profile.languagesSpoken.map((lang, idx) => (
                        <Badge key={idx} variant="outline" className="border-slate-800 bg-slate-950 text-slate-300">
                          {lang}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">None listed</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1.5">Interests & Hobbies</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.profile?.interests && selectedUser.profile.interests.length > 0 ? (
                      selectedUser.profile.interests.map((interest, idx) => (
                        <Badge key={idx} variant="outline" className="border-teal-500/20 bg-teal-500/5 text-teal-300">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">None listed</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1.5">Support Areas Desired</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.profile?.supportPreferences &&
                    selectedUser.profile.supportPreferences.length > 0 ? (
                      selectedUser.profile.supportPreferences.map((pref, idx) => (
                        <Badge key={idx} variant="outline" className="border-purple-500/20 bg-purple-500/5 text-purple-300">
                          {pref}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">None listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row gap-2">
            {selectedUser && (
              <>
                {selectedUser.accountStatus === 'active' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateUserStatus(selectedUser._id, 'suspended')}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <UserX className="w-3.5 h-3.5 mr-1.5" />
                    Suspend Account
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateUserStatus(selectedUser._id, 'active')}
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                    Activate Account
                  </Button>
                )}

                {selectedUser.role === 'student' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateUserRole(selectedUser._id, 'admin')}
                    className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Make Admin
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionLoading}
                    onClick={() => handleUpdateUserRole(selectedUser._id, 'student')}
                    className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                    Demote to Student
                  </Button>
                )}
              </>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDetailsOpen(false)}
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
