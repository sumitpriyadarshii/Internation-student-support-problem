'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  CheckSquare,
  Search,
  Filter,
  PlusCircle,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  Globe,
  AlertCircle,
  CheckCircle,
  Building,
  Flag,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { TASK_CATEGORIES, type TaskCategory, type TaskPriority } from '@/types';

interface TaskTemplateItem {
  _id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  destinationCountry?: string;
  destinationCity?: string;
  university?: string;
  required: boolean;
  defaultPriority: TaskPriority;
  dueDateOffsetDays: number;
  active: boolean;
  createdAt: string;
}

interface TemplateFormData {
  title: string;
  description: string;
  category: TaskCategory;
  destinationCountry: string;
  destinationCity: string;
  university: string;
  required: boolean;
  defaultPriority: TaskPriority;
  dueDateOffsetDays: number;
  active: boolean;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<TaskTemplateItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplateItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: 'banking-financial',
      destinationCountry: '',
      destinationCity: '',
      university: '',
      required: false,
      defaultPriority: 'medium',
      dueDateOffsetDays: 0,
      active: true,
    },
  });

  const requiredWatched = watch('required');
  const activeWatched = watch('active');

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: search.trim(),
        category: categoryFilter,
        active: activeFilter,
      });

      const res = await fetch(`/api/admin/templates?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setTemplates(json.data || []);
      } else {
        toast.error(json.error || 'Failed to fetch templates');
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      toast.error('Network error loading templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, activeFilter]);

  const openCreateModal = () => {
    setEditingTemplate(null);
    reset({
      title: '',
      description: '',
      category: 'banking-financial',
      destinationCountry: '',
      destinationCity: '',
      university: '',
      required: false,
      defaultPriority: 'medium',
      dueDateOffsetDays: 7,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tpl: TaskTemplateItem) => {
    setEditingTemplate(tpl);
    reset({
      title: tpl.title,
      description: tpl.description || '',
      category: tpl.category,
      destinationCountry: tpl.destinationCountry || '',
      destinationCity: tpl.destinationCity || '',
      university: tpl.university || '',
      required: tpl.required,
      defaultPriority: tpl.defaultPriority,
      dueDateOffsetDays: tpl.dueDateOffsetDays,
      active: tpl.active,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (templateId: string, currentActive: boolean) => {
    const newActive = !currentActive;
    try {
      // Optimistic update
      setTemplates((prev) =>
        prev.map((t) => (t._id === templateId ? { ...t, active: newActive } : t))
      );

      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newActive }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Template ${newActive ? 'activated' : 'deactivated'}`);
      } else {
        // Rollback
        setTemplates((prev) =>
          prev.map((t) => (t._id === templateId ? { ...t, active: currentActive } : t))
        );
        toast.error(json.error || 'Failed to update template status');
      }
    } catch (err) {
      setTemplates((prev) =>
        prev.map((t) => (t._id === templateId ? { ...t, active: currentActive } : t))
      );
      toast.error('Network error updating template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to permanently delete this task template?')) return;

    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Task template deleted');
        setTemplates((prev) => prev.filter((t) => t._id !== templateId));
      } else {
        toast.error(json.error || 'Failed to delete template');
      }
    } catch (err) {
      toast.error('Error deleting template');
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setSubmitting(true);
      const payload = {
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        destinationCountry: data.destinationCountry.trim() || undefined,
        destinationCity: data.destinationCity.trim() || undefined,
        university: data.university.trim() || undefined,
        required: data.required,
        defaultPriority: data.defaultPriority,
        dueDateOffsetDays: Number(data.dueDateOffsetDays) || 0,
        active: data.active,
      };

      const endpoint = editingTemplate
        ? `/api/admin/templates/${editingTemplate._id}`
        : '/api/admin/templates';
      const method = editingTemplate ? 'PATCH' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        toast.success(editingTemplate ? 'Template updated' : 'Template created');
        setIsModalOpen(false);
        fetchTemplates();
      } else {
        toast.error(json.error || 'Failed to save template');
      }
    } catch (err) {
      toast.error('Network error saving template');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-teal-400" />
            Task Template Management
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Define automated checklist templates assigned to students upon onboarding based on their destination and university.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
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
            Add Template
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
                placeholder="Search templates by title, country, campus..."
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

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>

              {/* Active Filter */}
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Template Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Destination Target</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Offset Days</th>
                <th className="py-3.5 px-4 text-center">Active Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-44 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-24 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-28 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                    <td className="py-3.5 px-4"><Skeleton className="h-4 w-16 bg-slate-800" /></td>
                    <td className="py-3.5 px-4 text-center"><Skeleton className="h-5 w-10 mx-auto bg-slate-800" /></td>
                    <td className="py-3.5 px-4 text-right"><Skeleton className="h-6 w-12 ml-auto bg-slate-800" /></td>
                  </tr>
                ))
              ) : templates.length > 0 ? (
                templates.map((tpl) => (
                  <tr
                    key={tpl._id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Title & Requirement */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white group-hover:text-teal-300 transition">
                          {tpl.title}
                        </span>
                        {tpl.required && (
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[9px] py-0 px-1">
                            Required
                          </Badge>
                        )}
                      </div>
                      {tpl.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {tpl.description}
                        </p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="border-teal-500/30 text-teal-300 bg-teal-500/10 text-[10px] capitalize">
                        {tpl.category.replace(/-/g, ' ')}
                      </Badge>
                    </td>

                    {/* Destination Target */}
                    <td className="py-3.5 px-4 text-slate-300">
                      {tpl.destinationCountry ? (
                        <div className="space-y-0.5">
                          <span className="font-medium text-slate-200">{tpl.destinationCountry}</span>
                          {(tpl.destinationCity || tpl.university) && (
                            <div className="text-[10px] text-slate-400">
                              {[tpl.destinationCity, tpl.university].filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="border-slate-800 text-slate-400 text-[10px]">
                          Global (All Students)
                        </Badge>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      {tpl.defaultPriority === 'urgent' ? (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                          Urgent
                        </Badge>
                      ) : tpl.defaultPriority === 'high' ? (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">
                          High
                        </Badge>
                      ) : tpl.defaultPriority === 'medium' ? (
                        <Badge className="bg-blue-500/15 text-blue-300 border-blue-500/30 text-[10px]">
                          Medium
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-800 text-slate-400 border-slate-700 text-[10px]">
                          Low
                        </Badge>
                      )}
                    </td>

                    {/* Due Date Offset Days */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="font-mono text-[11px] font-semibold">
                        {tpl.dueDateOffsetDays < 0
                          ? `${Math.abs(tpl.dueDateOffsetDays)}d pre-arrival`
                          : tpl.dueDateOffsetDays === 0
                          ? 'Arrival day'
                          : `+${tpl.dueDateOffsetDays}d post-arrival`}
                      </span>
                    </td>

                    {/* Active Toggle Switch */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={tpl.active}
                          onCheckedChange={() => handleToggleActive(tpl._id, tpl.active)}
                        />
                        <span className={`text-[10px] font-medium ${tpl.active ? 'text-teal-400' : 'text-slate-500'}`}>
                          {tpl.active ? 'Active' : 'Off'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(tpl)}
                          className="h-7 w-7 text-slate-400 hover:text-teal-300 hover:bg-slate-800"
                          title="Edit Template"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTemplate(tpl._id)}
                          className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete Template"
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
                    No task templates found. Click "Add Template" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Template Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl bg-slate-900 border-slate-800 text-slate-100 p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-teal-400" />
              {editingTemplate ? 'Edit Task Template' : 'Create Task Template'}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Automated onboarding tasks automatically populated in students' personal dashboards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-xs">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Task Title *</label>
              <Input
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                })}
                placeholder="e.g., Open a Local Bank Account"
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
              {errors.title && <p className="text-red-400 text-[11px]">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Description</label>
              <Textarea
                {...register('description')}
                rows={3}
                placeholder="Clear instructions on what documents are required and where to complete it..."
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
            </div>

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Category *</label>
                <select
                  {...register('category', { required: true })}
                  className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {TASK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Default Priority *</label>
                <select
                  {...register('defaultPriority')}
                  className="w-full h-9 px-3 rounded-md bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Destination Target (Country, City, University) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Destination Country</label>
                <Input
                  {...register('destinationCountry')}
                  placeholder="e.g. USA (blank for all)"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Destination City</label>
                <Input
                  {...register('destinationCity')}
                  placeholder="e.g. Boston (optional)"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">University</label>
                <Input
                  {...register('university')}
                  placeholder="e.g. MIT (optional)"
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>
            </div>

            {/* Due Date Offset Days */}
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">
                Due Date Offset (Days relative to student arrival date)
              </label>
              <Input
                {...register('dueDateOffsetDays', { valueAsNumber: true })}
                type="number"
                placeholder="e.g. -30 for 1 month before, 7 for 1 week after"
                className="bg-slate-950 border-slate-800 text-slate-100"
              />
              <p className="text-[10px] text-slate-500">
                Use negative numbers for pre-arrival preparation (e.g., -60 for visa), and positive numbers for post-arrival tasks.
              </p>
            </div>

            {/* Switches: Required and Active */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-200">Mandatory / Required Task</span>
                  <p className="text-[10px] text-slate-400">Highlighted in red as critical for student compliance</p>
                </div>
                <Switch
                  checked={requiredWatched}
                  onCheckedChange={(checked) => setValue('required', checked)}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <span className="font-semibold text-slate-200">Active Status</span>
                  <p className="text-[10px] text-slate-400">Automatically assign to new students matching destination criteria</p>
                </div>
                <Switch
                  checked={activeWatched}
                  onCheckedChange={(checked) => setValue('active', checked)}
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
                {submitting ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
