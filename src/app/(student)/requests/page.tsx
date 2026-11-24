'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  FileText,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Plus,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  FolderOpen,
  MessageSquare,
  Flame,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface UserRequestItem {
  _id: string;
  userEmail: string;
  userName: string;
  type: 'document_review' | 'permission' | 'activation' | 'role_upgrade' | 'account_issue';
  title: string;
  message: string;
  documentType?: string;
  documentUrl?: string;
  urgency?: 'normal' | 'urgent';
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

const DOCUMENT_CATEGORIES = [
  'Student Visa / Entry Permit',
  'University I-20 / CAS / Acceptance Letter',
  'Financial Proof / Bank Statement',
  'Health Insurance & Immunization',
  'Accommodation / Lease Agreement',
  'Passport / Identification Proof',
  'Academic Transcript / Degree Certificate',
  'Other Official Document',
];

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<UserRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // New Request Modal State
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestType, setRequestType] = useState<string>('document_review');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [documentType, setDocumentType] = useState('Student Visa / Entry Permit');
  const [documentUrl, setDocumentUrl] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/user-requests');
      const json = await res.json();
      if (json.success && json.data) {
        setRequests(json.data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load user requests:', err);
      toast.error('Network error loading your requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a request title');
      return;
    }
    if (!message.trim()) {
      toast.error('Please provide a description or context for your request');
      return;
    }
    if (requestType === 'document_review' && documentUrl.trim() && !/^https?:\/\//i.test(documentUrl.trim())) {
      toast.error('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/user-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: requestType,
          title: title.trim(),
          message: message.trim(),
          documentType: requestType === 'document_review' ? documentType : '',
          documentUrl: requestType === 'document_review' ? documentUrl.trim() : '',
          urgency,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit request');
      }

      toast.success('Your request has been submitted to the administration! 🚀');
      setIsSubmitOpen(false);
      setTitle('');
      setMessage('');
      setDocumentUrl('');
      setUrgency('normal');
      setRequestType('document_review');
      fetchRequests();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error submitting request');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered list
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(search.toLowerCase()) ||
      req.message.toLowerCase().includes(search.toLowerCase()) ||
      (req.documentType && req.documentType.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesType = typeFilter === 'all' || req.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 ios-glass-prominent border border-amber-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-emerald-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full ios-glass border border-amber-500/30 text-amber-200 text-xs font-semibold tracking-wide">
              <FileCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Official Admin Services</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Document Reviews & <span className="text-gradient-sunset">Admin Requests</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Submit your immigration documents (Visa, I-20, CAS, Admission letters, Proof of Funds) for
              administrative verification or request special portal permissions.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Button
              onClick={() => setIsSubmitOpen(true)}
              className="btn-ios-primary text-xs sm:text-sm px-5 py-3 cursor-pointer shadow-lg shadow-orange-500/20"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Submit New Request
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="ios-glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Requests</p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">{requests.length}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Submitted by you</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
            <FolderOpen className="h-5 w-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="ios-glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Under Review</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">{pendingCount}</p>
            <p className="text-[10px] text-amber-500/80 mt-0.5">Awaiting admin review</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
            <Clock className="h-5 w-5 animate-spin" />
          </div>
        </div>

        {/* Approved */}
        <div className="ios-glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Verified & Approved</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{approvedCount}</p>
            <p className="text-[10px] text-emerald-500/80 mt-0.5">Successfully processed</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Action Needed */}
        <div className="ios-glass rounded-2xl p-5 border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">Changes / Declined</p>
            <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">{rejectedCount}</p>
            <p className="text-[10px] text-rose-500/80 mt-0.5">Requires your attention</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center font-bold border border-rose-500/20">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="ios-glass border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                placeholder="Search your requests by title or document type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-stone-950/70 border-white/10 text-stone-100 placeholder:text-stone-500 focus-visible:ring-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-stone-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-stone-950/70 border border-white/10 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All Statuses ({requests.length})</option>
                <option value="pending">Under Review ({pendingCount})</option>
                <option value="approved">Approved ({approvedCount})</option>
                <option value="rejected">Changes Needed ({rejectedCount})</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-stone-950/70 border border-white/10 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="document_review">Document Review</option>
                <option value="permission">Permissions</option>
                <option value="role_upgrade">Senior Buddy Upgrade</option>
                <option value="account_issue">Account Support</option>
              </select>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchRequests}
                disabled={loading}
                className="h-9 border-white/10 bg-white/5 text-stone-300 hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests Listing */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="ios-glass rounded-2xl p-6 border border-white/10 space-y-3">
              <Skeleton className="h-6 w-48 bg-white/10 rounded" />
              <Skeleton className="h-4 w-full bg-white/5 rounded" />
              <Skeleton className="h-4 w-2/3 bg-white/5 rounded" />
            </div>
          ))
        ) : filteredRequests.length === 0 ? (
          <div className="ios-glass rounded-3xl p-12 text-center border border-white/10 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/20">
              <FileCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">No requests found</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                {requests.length === 0
                  ? 'You have not submitted any administrative or document review requests yet. Need your visa or I-20 verified? Submit your first request!'
                  : 'No requests matched your filter parameters.'}
              </p>
            </div>
            {requests.length === 0 && (
              <Button
                onClick={() => setIsSubmitOpen(true)}
                className="btn-ios-primary text-xs px-5 py-2.5 cursor-pointer shadow-lg shadow-orange-500/20 mt-2"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Submit Document for Review
              </Button>
            )}
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'pending';
            const isApproved = req.status === 'approved';
            const isRejected = req.status === 'rejected';

            return (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`ios-glass rounded-2xl p-5 sm:p-6 border transition-all ${
                  isPending
                    ? 'border-amber-500/30 hover:border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : isApproved
                    ? 'border-emerald-500/30 hover:border-emerald-500/50'
                    : 'border-rose-500/30 hover:border-rose-500/50'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status */}
                      {isPending ? (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-bold">
                          <Clock className="w-3 h-3 mr-1 animate-spin" />
                          Under Admin Review
                        </Badge>
                      ) : isApproved ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified & Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs font-bold">
                          <XCircle className="w-3 h-3 mr-1" />
                          Changes Required / Declined
                        </Badge>
                      )}

                      {/* Type Badge */}
                      <Badge variant="outline" className="border-white/15 bg-white/5 text-stone-300 text-xs">
                        {req.type === 'document_review' ? (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-400" />
                            Document Review
                          </span>
                        ) : req.type === 'permission' ? (
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-teal-400" />
                            Permission Request
                          </span>
                        ) : req.type === 'role_upgrade' ? (
                          'Senior Buddy Upgrade'
                        ) : (
                          'Account Support'
                        )}
                      </Badge>

                      {/* Document Type if applicable */}
                      {req.documentType && (
                        <Badge className="bg-teal-500/15 text-teal-300 border-teal-500/30 text-xs font-medium">
                          {req.documentType}
                        </Badge>
                      )}

                      {/* Urgency */}
                      {req.urgency === 'urgent' && (
                        <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs font-bold animate-pulse">
                          <Flame className="w-3 h-3 mr-1 text-rose-400" />
                          Urgent Priority
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-white">{req.title}</h3>

                    {/* Message */}
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/5">
                      {req.message}
                    </p>

                    {/* Document URL button if present */}
                    {req.documentUrl && (
                      <div className="pt-1">
                        <a
                          href={req.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:text-white hover:bg-amber-500/25 text-xs font-semibold transition-all shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View Submitted Document
                        </a>
                      </div>
                    )}

                    {/* Official Admin Decision / Notes */}
                    {req.adminNotes && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                          isApproved
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                            : isRejected
                            ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                            : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5 mb-1">
                          {isApproved ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                          )}
                          <span>Official Administration Response:</span>
                        </div>
                        <p>{req.adminNotes}</p>
                      </div>
                    )}

                    {/* Footer Timestamps */}
                    <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-2 pt-1">
                      <span>Submitted on {new Date(req.createdAt).toLocaleString()}</span>
                      {req.reviewedAt && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400/80">
                            Reviewed on {new Date(req.reviewedAt).toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* New Request Submission Modal */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="bg-stone-900 border-white/10 text-stone-100 max-w-lg rounded-3xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Submit Request to Administration
            </DialogTitle>
            <DialogDescription className="text-stone-400 text-xs leading-relaxed">
              Submit your immigration documents for review or request special permissions from the platform administrators.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {/* Request Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-300 font-semibold">Request Category</Label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-stone-950 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="document_review">📄 Document Review & Verification (Visa, I-20, Offer)</option>
                <option value="permission">🛡️ Special Permission / Clearance</option>
                <option value="role_upgrade">🎓 Senior Buddy / Mentor Application</option>
                <option value="account_issue">⚠️ Account Support / Profile Correction</option>
              </select>
            </div>

            {/* Document Specific Fields */}
            {requestType === 'document_review' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-stone-300 font-semibold">Document Type</Label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-stone-950 border border-white/10 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-stone-300 font-semibold">
                    Document Link (Google Drive / Cloud / PDF URL)
                  </Label>
                  <Input
                    placeholder="https://drive.google.com/file/d/... or document URL"
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    className="bg-stone-950 border-white/10 text-xs text-white placeholder:text-stone-600 focus-visible:ring-amber-500"
                  />
                  <p className="text-[10px] text-stone-400">
                    Provide a viewable link so the administrative team can examine your document.
                  </p>
                </div>
              </>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-300 font-semibold">Request Title / Subject</Label>
              <Input
                placeholder={
                  requestType === 'document_review'
                    ? 'e.g., US F-1 Visa & I-20 Verification for Fall semester'
                    : 'e.g., Request permission for student mentor badge'
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-stone-950 border-white/10 text-xs text-white placeholder:text-stone-600 focus-visible:ring-amber-500"
              />
            </div>

            {/* Details / Message */}
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-300 font-semibold">Detailed Description / Context</Label>
              <Textarea
                placeholder="Explain the details of your request, any deadlines, and specific checks you need the admin team to perform..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-stone-950 border-white/10 text-xs text-white placeholder:text-stone-600 focus-visible:ring-amber-500"
              />
            </div>

            {/* Urgency */}
            <div className="space-y-1.5">
              <Label className="text-xs text-stone-300 font-semibold">Urgency Level</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgency('normal')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    urgency === 'normal'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                      : 'bg-stone-950 border-white/10 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Clock className="w-4 h-4" /> Normal (2-3 days)
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('urgent')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    urgency === 'urgent'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-200 shadow-md shadow-rose-500/10'
                      : 'bg-stone-950 border-white/10 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Flame className="w-4 h-4 text-rose-400" /> Urgent (Imminent Travel)
                </button>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSubmitOpen(false)}
                className="border-white/10 text-stone-300 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="btn-ios-primary text-xs px-5 font-bold cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit to Admin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
