'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Tag,
  BookOpen,
  Edit,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TaskDetail {
  _id: string;
  userId: string;
  templateId?: string;
  title: string;
  description?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not-started' | 'in-progress' | 'completed';
  dueDate?: string;
  isOverdue?: boolean;
  relatedGuideId?: {
    _id: string;
    title: string;
    slug: string;
    category?: string;
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = [
  { id: 'documentation-immigration', label: 'Visa & Immigration' },
  { id: 'banking-financial', label: 'Banking & Money' },
  { id: 'sim-mobile', label: 'SIM & Connectivity' },
  { id: 'accommodation-transport', label: 'Housing & Transport' },
  { id: 'university-campus', label: 'University & Campus' },
  { id: 'healthcare-emergency', label: 'Healthcare & Insurance' },
  { id: 'food-groceries', label: 'Living & Groceries' },
  { id: 'local-culture-language', label: 'Culture & Language' },
  { id: 'personal', label: 'Personal' },
];

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('personal');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTask = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setTask(json.data);
          // populate edit form
          setEditTitle(json.data.title || '');
          setEditDesc(json.data.description || '');
          setEditCategory(json.data.category || 'personal');
          setEditPriority(json.data.priority || 'medium');
          setEditDueDate(
            json.data.dueDate ? new Date(json.data.dueDate).toISOString().split('T')[0] : ''
          );
        } else {
          toast.error('Task not found');
        }
      } else {
        toast.error('Failed to load task');
      }
    } catch {
      toast.error('Error loading task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  // Update Status
  const handleStatusChange = async (newStatus: 'not-started' | 'in-progress' | 'completed') => {
    if (!task) return;
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setTask((prev) => (prev ? { ...prev, ...json.data } : null));
        toast.success(`Status updated to ${newStatus.replace('-', ' ')}`);
      } else {
        throw new Error(json.error || 'Failed to update status');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error updating status');
    }
  };

  // Edit Submit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/tasks/${task?._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDesc.trim(),
          category: editCategory,
          priority: editPriority,
          dueDate: editDueDate || null,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Task updated successfully');
        setIsEditOpen(false);
        loadTask();
      } else {
        throw new Error(json.error || 'Failed to save changes');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error saving task');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (!task) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Task deleted');
        router.push('/tasks');
      } else {
        throw new Error(json.error || 'Failed to delete task');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error deleting task');
    } finally {
      setDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 py-8">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-16">
        <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Task not found</h2>
        <Button onClick={() => router.push('/tasks')} className="mt-4 bg-teal-600 text-white">
          Back to Checklist
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Navigation & Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="text-xs text-slate-600 hover:text-slate-900 border-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Checklist
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="text-xs border-slate-300 text-slate-700"
          >
            <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>

          {/* Delete Button (Allowed for tasks) */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="text-xs border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Main Task Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize text-xs font-semibold bg-white border border-slate-200">
                {task.category.replace('-', ' ')}
              </Badge>
              <Badge
                variant={
                  task.priority === 'urgent'
                    ? 'destructive'
                    : task.priority === 'high'
                    ? 'warning'
                    : 'secondary'
                }
                className="capitalize text-xs font-bold"
              >
                {task.priority} Priority
              </Badge>
              {task.isOverdue && task.status !== 'completed' && (
                <Badge variant="destructive" className="text-xs font-bold">
                  Overdue
                </Badge>
              )}
            </div>

            <Badge
              variant={
                task.status === 'completed'
                  ? 'success'
                  : task.status === 'in-progress'
                  ? 'warning'
                  : 'secondary'
              }
              className="text-xs font-semibold capitalize"
            >
              {task.status.replace('-', ' ')}
            </Badge>
          </div>

          <CardTitle className="text-2xl font-extrabold text-slate-900 leading-tight">
            {task.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Task Notes & Instructions
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-100">
              {task.description || 'No additional instructions provided for this task.'}
            </p>
          </div>

          {/* Key Dates & Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-xs text-slate-500 font-medium">Due Date</span>
              <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-600" />
                {task.dueDate ? format(new Date(task.dueDate), 'EEEE, MMMM d, yyyy') : 'No due date set'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-xs text-slate-500 font-medium">Completed Status</span>
              <p className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-2">
                <CheckCircle2
                  className={`h-4 w-4 ${
                    task.status === 'completed' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                {task.completedAt
                  ? `Completed on ${format(new Date(task.completedAt), 'MMM d, yyyy')}`
                  : 'Not marked completed yet'}
              </p>
            </div>
          </div>

          {/* Related Guide Link */}
          {task.relatedGuideId && (
            <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-teal-800 font-semibold uppercase">Official Student Guide</p>
                  <p className="text-sm font-bold text-slate-900">{task.relatedGuideId.title}</p>
                </div>
              </div>
              <Button size="sm" asChild className="bg-teal-600 hover:bg-teal-500 text-white text-xs">
                <Link href={`/guides/${task.relatedGuideId._id}`}>
                  Read Handbook <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}

          {/* Quick Status Update Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Update Status
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={task.status === 'not-started' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('not-started')}
                className={
                  task.status === 'not-started'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 border-slate-300'
                }
              >
                Not Started
              </Button>
              <Button
                variant={task.status === 'in-progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('in-progress')}
                className={
                  task.status === 'in-progress'
                    ? 'bg-amber-600 text-white hover:bg-amber-500'
                    : 'text-slate-600 border-slate-300'
                }
              >
                In Progress
              </Button>
              <Button
                variant={task.status === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('completed')}
                className={
                  task.status === 'completed'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                    : 'text-slate-600 border-slate-300'
                }
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Completed
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 px-6 text-xs text-slate-400 flex justify-between">
          <span>Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}</span>
          <span>Last modified: {format(new Date(task.updatedAt), 'MMM d, yyyy')}</span>
        </CardFooter>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Checklist Task</DialogTitle>
            <DialogDescription>Modify task title, description, category, or due date.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDesc">Description</Label>
              <Textarea
                id="editDesc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={editPriority}
                  onValueChange={(val: any) => setEditPriority(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editDueDate">Due Date</Label>
              <Input
                id="editDueDate"
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingEdit}
                className="bg-teal-600 hover:bg-teal-500 text-white"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Task?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={deleting}
              onClick={handleDeleteTask}
              className="bg-red-600 hover:bg-red-500 text-white cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Delete Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
