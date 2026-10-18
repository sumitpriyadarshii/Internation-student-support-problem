'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  Edit,
  Archive,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Globe,
  Tag,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { GUIDE_CATEGORIES, type GuideCategory, type GuideStatus, type GuideVerificationStatus } from '@/types';

interface GuideItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: GuideCategory;
  applicableCountries: string[];
  applicableRegions: string[];
  tags: string[];
  sourceUrl?: string;
  verificationStatus: GuideVerificationStatus;
  status: GuideStatus;
  createdAt: string;
  updatedAt: string;
}

interface GuideFormData {
  title: string;
  summary: string;
  content: string;
  category: GuideCategory;
  applicableCountriesStr: string;
  applicableRegionsStr: string;
  tagsStr: string;
  sourceUrl: string;
  verificationStatus: GuideVerificationStatus;
  status: GuideStatus;
}

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<GuideItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<GuideFormData>({
    defaultValues: {
      title: '',
      summary: '',
      content: '',
      category: 'banking-financial',
      applicableCountriesStr: '',
      applicableRegionsStr: '',
      tagsStr: '',
      sourceUrl: '',
      verificationStatus: 'unverified',
      status: 'draft',
    },
  });

  const fetchGuides = async (pageNumber = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: '10',
        search: search.trim(),
        category: categoryFilter,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/guides?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setGuides(json.data.guides || []);
        setTotal(json.data.total || 0);
        setPage(json.data.page || 1);
        setTotalPages(json.data.totalPages || 1);
      } else {
        toast.error(json.error || 'Failed to load guides');
      }
    } catch (err) {
      console.error('Error fetching guides:', err);
      toast.error('Network error loading guides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuides(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingGuide(null);
    reset({
      title: '',
      summary: '',
      content: '',
      category: 'banking-financial',
      applicableCountriesStr: '',
      applicableRegionsStr: '',
      tagsStr: '',
      sourceUrl: '',
      verificationStatus: 'verified',
      status: 'published',
    });
    setIsFormOpen(true);
  };

  const openEditModal = (guide: GuideItem) => {
    setEditingGuide(guide);
    reset({
      title: guide.title,
      summary: guide.summary,
      content: guide.content,
      category: guide.category,
      applicableCountriesStr: guide.applicableCountries?.join(', ') || '',
      applicableRegionsStr: guide.applicableRegions?.join(', ') || '',
      tagsStr: guide.tags?.join(', ') || '',
      sourceUrl: guide.sourceUrl || '',
      verificationStatus: guide.verificationStatus,
      status: guide.status,
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (data: GuideFormData) => {
    try {
      setSubmitting(true);

      const payload = {
        title: data.title.trim(),
        summary: data.summary.trim(),
        content: data.content.trim(),
        category: data.category,
        applicableCountries: data.applicableCountriesStr
          ? data.applicableCountriesStr.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        applicableRegions: data.applicableRegionsStr
          ? data.applicableRegionsStr.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        tags: data.tagsStr
          ? data.tagsStr.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        sourceUrl: data.sourceUrl?.trim() || undefined,
        verificationStatus: data.verificationStatus,
        status: data.status,
      };

      const endpoint = editingGuide
        ? `/api/admin/guides/${editingGuide._id}`
        : '/api/admin/guides';
      const method = editingGuide ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(editingGuide ? 'Guide updated successfully' : 'Guide created successfully');
        setIsFormOpen(false);
        fetchGuides(editingGuide ? page : 1);
      } else {
        toast.error(json.error || 'Failed to save guide');
      }
    } catch (err) {
      toast.error('Network error occurred while saving guide');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveGuide = async (guideId: string) => {
    try {
      const res = await fetch(`/api/admin/guides/${guideId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Guide archived');
        setGuides((prev) =>
          prev.map((g) => (g._id === guideId ? { ...g, status: 'archived' } : g))
        );
      } else {
        toast.error(json.error || 'Failed to archive guide');
      }
    } catch (err) {
      toast.error('Error archiving guide');
    }
  };

  const handleDeleteGuide = async (guideId: string) => {
    if (!confirm('Are you sure you want to delete this guide completely?')) return;

    try {
      const res = await fetch(`/api/admin/guides/${guideId}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Guide deleted');
        setGuides((prev) => prev.filter((g) => g._id !== guideId));
        setTotal((prev) => Math.max(0, prev - 1));
      } else {
        toast.error(json.error || 'Failed to delete guide');
      }
    } catch (err) {
      toast.error('Error deleting guide');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-400" />
            Guide Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Curate and verify essential student survival content across banking, housing, visas, and university life.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchGuides(page)}
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
            Create Guide
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
                placeholder="Search guides by title, country, tags..."
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

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {GUIDE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guides Table */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Guide Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Countries / Regions</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-48 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-20 bg-slate-800" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-6 w-12 ml-auto bg-slate-800" /></td>
                  </tr>
                ))
              ) : guides.length > 0 ? (
                guides.map((g) => (
                  <tr
                    key={g._id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Title & Summary */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-white group-hover:text-teal-300 transition line-clamp-1">
                        {g.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {g.summary}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="border-teal-500/30 text-teal-300 bg-teal-500/10 text-[10px] capitalize">
                        {g.category.replace(/-/g, ' ')}
                      </Badge>
                    </td>

                    {/* Applicable Countries */}
                    <td className="py-3.5 px-4 text-slate-300">
                      {g.applicableCountries && g.applicableCountries.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {g.applicableCountries.slice(0, 2).map((c, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700"
                            >
                              {c}
                            </span>
                          ))}
                          {g.applicableCountries.length > 2 && (
                            <span className="text-[10px] text-slate-500 self-center">
                              +{g.applicableCountries.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">All countries</span>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td className="py-3.5 px-4">
                      {g.verificationStatus === 'verified' ? (
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : g.verificationStatus === 'outdated' ? (
                        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Outdated
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                          Unverified
                        </Badge>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {g.status === 'published' ? (
                        <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/40 text-[10px]">
                          Published
                        </Badge>
                      ) : g.status === 'archived' ? (
                        <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                          Archived
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-[10px]">
                          Draft
                        </Badge>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(g.updatedAt || g.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(g)}
                          className="h-7 w-7 text-slate-400 hover:text-teal-300 hover:bg-slate-800"
                          title="Edit Guide"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>

                        {g.status !== 'archived' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchiveGuide(g._id)}
                            className="h-7 w-7 text-slate-400 hover:text-amber-400 hover:bg-slate-800"
                            title="Archive Guide"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGuide(g._id)}
                          className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete Guide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No guides found. Click "Create Guide" to publish one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-800 gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{guides.length}</span> of{' '}
            <span className="font-semibold text-slate-200">{total}</span> guides
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchGuides(page - 1)}
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
              onClick={() => fetchGuides(page + 1)}
              disabled={page >= totalPages || loading}
              className="h-8 border-slate-800 bg-slate-950 text-slate-300 disabled:opacity-40"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Guide Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-slate-100 p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-400" />
              {editingGuide ? 'Edit Survival Guide' : 'Create New Survival Guide'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Provide actionable, verified instructions for international students adjusting to new environments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-xs">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Guide Title *</label>
              <Input
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                })}
                placeholder="e.g., Setting Up a Bank Account in the USA"
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
              {errors.title && <p className="text-red-400 text-[11px]">{errors.title.message}</p>}
            </div>

            {/* Category, Verification, Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Category *</label>
                <select
                  {...register('category', { required: true })}
                  className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {GUIDE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Verification *</label>
                <select
                  {...register('verificationStatus')}
                  className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                  <option value="outdated">Outdated</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Publishing Status *</label>
                <select
                  {...register('status')}
                  className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Summary *</label>
              <Textarea
                {...register('summary', {
                  required: 'Summary is required',
                  minLength: { value: 10, message: 'Minimum 10 characters' },
                })}
                rows={2}
                placeholder="A concise summary highlighting what students will learn..."
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
              {errors.summary && <p className="text-red-400 text-[11px]">{errors.summary.message}</p>}
            </div>

            {/* Content (Markdown) */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Detailed Content (Markdown formatted) *</label>
              <Textarea
                {...register('content', {
                  required: 'Content is required',
                  minLength: { value: 20, message: 'Minimum 20 characters' },
                })}
                rows={8}
                placeholder="Step-by-step instructions, essential documents, tips, links, and precautions..."
                className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs"
              />
              {errors.content && <p className="text-red-400 text-[11px]">{errors.content.message}</p>}
            </div>

            {/* Countries and Regions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Applicable Countries (comma-separated)</label>
                <Input
                  {...register('applicableCountriesStr')}
                  placeholder="e.g. USA, UK, Canada, Australia"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Applicable Regions (comma-separated)</label>
                <Input
                  {...register('applicableRegionsStr')}
                  placeholder="e.g. California, London, Victoria"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
            </div>

            {/* Tags and Source URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Tags (comma-separated)</label>
                <Input
                  {...register('tagsStr')}
                  placeholder="e.g. banking, ssn, checking account, finance"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Source / Reference URL</label>
                <Input
                  {...register('sourceUrl')}
                  type="url"
                  placeholder="https://official-government-or-bank.com"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
            </div>

            <DialogFooter className="border-t border-slate-800 pt-4 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsFormOpen(false)}
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
                {submitting ? 'Saving Guide...' : editingGuide ? 'Update Guide' : 'Create Guide'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
