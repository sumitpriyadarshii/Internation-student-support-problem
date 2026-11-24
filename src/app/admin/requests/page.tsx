'use client';

import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Mail,
  FileText,
  Sparkles,
  ArrowRight,
  Trash2,
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AdminRequestItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    accountStatus: string;
  };
  userEmail: string;
  userName: string;
  type: 'activation' | 'permission' | 'role_upgrade' | 'account_issue';
  title: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<AdminRequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Review Dialog State
  const [selectedRequest, setSelectedRequest] = useState<AdminRequestItem | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchRequests = async (pageNumber = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: '15',
        search: search.trim(),
        status: statusFilter,
        type: typeFilter,
      });

      const res = await fetch(`/api/admin/requests?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setRequests(json.data.requests || []);
        setTotal(json.data.total || 0);
        setPendingCount(json.data.pendingCount || 0);
        setPage(json.data.page || 1);
        setTotalPages(json.data.totalPages || 1);
      } else {
        toast.error(json.error || 'Failed to load requests');
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      toast.error('Network error loading admin requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, typeFilter]);

  const handleReview = async () => {
    if (!selectedRequest || !dialogAction) return;

    try {
      setActionLoading(selectedRequest._id);
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest._id,
          action: dialogAction,
          adminNotes: adminNotes.trim(),
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(
          dialogAction === 'approve'
            ? `User ${selectedRequest.userEmail} has been activated & request approved!`
            : 'Request marked as rejected.'
        );
        setDialogOpen(false);
        setSelectedRequest(null);
        setAdminNotes('');
        fetchRequests(page);
      } else {
        toast.error(json.error || 'Failed to review request');
      }
    } catch {
      toast.error('Error saving review decision');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request record?')) return;
    try {
      const res = await fetch(`/api/admin/requests?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast.success('Request record deleted');
        setRequests((prev) => prev.filter((r) => r._id !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(json.error || 'Failed to delete request');
      }
    } catch {
      toast.error('Network error deleting request');
    }
  };

  const openReviewDialog = (req: AdminRequestItem, action: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setDialogAction(action);
    setAdminNotes(
      action === 'approve'
        ? 'Account reviewed and reactivated. Verified by administrator.'
        : 'Request declined after administrative review.'
    );
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Inbox className="w-6 h-6 text-teal-400" />
              User Requests & Permissions
            </h1>
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold animate-pulse">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-0.5">
            Review account reactivation appeals, permission upgrades, and account status requests from students.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchRequests(page)}
            disabled={loading}
            className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by student name, email, message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Statuses ({total})</option>
                <option value="pending">Pending ({pendingCount})</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="activation">Account Reactivation</option>
                <option value="permission">Permissions</option>
                <option value="role_upgrade">Role Upgrade</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-slate-900 border-slate-800 p-5">
              <Skeleton className="h-6 w-48 mb-2 bg-slate-800" />
              <Skeleton className="h-4 w-96 bg-slate-800" />
            </Card>
          ))
        ) : requests.length === 0 ? (
          <Card className="bg-slate-900/60 border-slate-800 text-center py-12">
            <CardContent>
              <CheckCircle2 className="w-12 h-12 text-teal-400/40 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No requests found</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                {statusFilter === 'pending'
                  ? 'There are no pending user appeals or activation requests awaiting review.'
                  : 'No requests matched your filter parameters.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          requests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const userStatus = req.userId?.accountStatus;

            return (
              <Card
                key={req._id}
                className={`border transition-all ${
                  isPending
                    ? 'bg-slate-900/90 border-amber-500/30 hover:border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : isApproved
                    ? 'bg-slate-900/50 border-emerald-500/20'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User & Request Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-base">{req.userName}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          {req.userEmail}
                        </span>

                        {/* Status Badge */}
                        {isPending ? (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] font-bold">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Review
                          </Badge>
                        ) : isApproved ? (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Approved & Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/40 text-[10px] font-bold">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </Badge>
                        )}

                        {/* Current User Account State Badge */}
                        {userStatus && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              userStatus === 'active'
                                ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30'
                                : userStatus === 'deactivated'
                                ? 'border-red-500/30 text-red-400 bg-red-950/30'
                                : 'border-amber-500/30 text-amber-400 bg-amber-950/30'
                            }`}
                          >
                            Current: {userStatus.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      {/* Request Message */}
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                        <p className="font-semibold text-teal-300 mb-0.5">{req.title}</p>
                        <p>{req.message}</p>
                      </div>

                      {/* Admin Notes if reviewed */}
                      {req.adminNotes && (
                        <p className="text-[11px] text-slate-400 italic">
                          <strong className="text-slate-300 not-italic">Admin Decision Note:</strong>{' '}
                          {req.adminNotes}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>Submitted on {new Date(req.createdAt).toLocaleString()}</span>
                        {req.reviewedAt && (
                          <>
                            <span>•</span>
                            <span>Reviewed on {new Date(req.reviewedAt).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex sm:flex-col lg:flex-row items-center gap-2 self-start lg:self-center shrink-0">
                      {isPending ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openReviewDialog(req, 'approve')}
                            disabled={actionLoading === req._id}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                            Approve & Activate ID
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewDialog(req, 'reject')}
                            disabled={actionLoading === req._id}
                            className="border-red-500/40 text-red-300 hover:bg-red-500/10 text-xs cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1.5" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(req._id)}
                          className="text-slate-500 hover:text-red-400 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete Record
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Review Confirmation Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              {dialogAction === 'approve' ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Approve & Reactivate User
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  Reject Request
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs leading-relaxed">
              {dialogAction === 'approve'
                ? `This will immediately reactivate the user account (${selectedRequest?.userEmail}), resetting any lockouts so they can log in freely.`
                : `This will mark the request from (${selectedRequest?.userEmail}) as rejected.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Notes / Feedback to Student:
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add explanation or review notes..."
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              className="border-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleReview}
              disabled={Boolean(actionLoading)}
              className={
                dialogAction === 'approve'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold'
                  : 'bg-red-600 hover:bg-red-500 text-white font-bold'
              }
            >
              {actionLoading ? 'Saving...' : dialogAction === 'approve' ? 'Confirm & Reactivate' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
