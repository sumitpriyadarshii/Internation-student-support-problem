'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format, isPast, isToday } from 'date-fns';
import { toast } from 'sonner';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  ArrowUpDown,
  Search,
  ListTodo,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
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

interface TaskItem {
  _id: string;
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
  };
  completedAt?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionPercentage: 0,
  });

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(true);

  // Add Task Modal Form
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('personal');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [formDueDate, setFormDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch tasks and stats
  const fetchTasksData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch stats
      const statsRes = await fetch('/api/tasks/stats');
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success) setStats(statsJson.data);
      }

      // 2. Fetch tasks list
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'all' && statusFilter !== 'overdue') {
        queryParams.set('status', statusFilter);
      }
      if (categoryFilter !== 'all') {
        queryParams.set('category', categoryFilter);
      }
      if (priorityFilter !== 'all') {
        queryParams.set('priority', priorityFilter);
      }
      if (searchQuery.trim()) {
        queryParams.set('q', searchQuery.trim());
      }

      const res = await fetch(`/api/tasks?${queryParams.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          let list: TaskItem[] = json.data;

          // Special overdue filter handling
          if (statusFilter === 'overdue') {
            list = list.filter((t) => t.isOverdue && t.status !== 'completed');
          }

          // Sort by due date
          list.sort((a, b) => {
            const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return sortAscending ? timeA - timeB : timeB - timeA;
          });

          setTasks(list);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, priorityFilter, searchQuery, sortAscending]);

  useEffect(() => {
    fetchTasksData();
  }, [fetchTasksData]);

  // Inline status update
  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Task status changed to ${newStatus.replace('-', ' ')}`);
        // Refresh local tasks and stats
        fetchTasksData();
      } else {
        throw new Error(json.error || 'Failed to update task status');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error updating task');
    }
  };

  // Add Task submit
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDesc.trim(),
          category: formCategory,
          priority: formPriority,
          dueDate: formDueDate || null,
          status: 'not-started',
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Task added to your checklist!');
        setIsAddOpen(false);
        setFormTitle('');
        setFormDesc('');
        setFormDueDate('');
        fetchTasksData();
      } else {
        throw new Error(json.error || 'Failed to create task');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error creating task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="h-7 w-7 text-teal-600" /> Student Checklist & Tasks
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize documents, visas, housing deposits, and arrival preparations.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white font-medium cursor-pointer shadow-sm w-fit"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Task
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold">Total Checklist</span>
            <ListTodo className="h-4 w-4 opacity-70" />
          </div>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-emerald-600">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-emerald-700">{stats.completed}</p>
        </button>

        <button
          onClick={() => setStatusFilter('not-started')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'not-started' || statusFilter === 'in-progress'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-amber-600">Pending</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-amber-700">{stats.pending}</p>
        </button>

        <button
          onClick={() => setStatusFilter('overdue')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === 'overdue'
              ? 'bg-red-600 text-white border-red-600 shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-red-600">Overdue</span>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold mt-1 text-red-700">{stats.overdue}</p>
        </button>
      </div>

      {/* Completion Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
          <span>Checklist Progress</span>
          <span className="text-teal-600 font-bold">{stats.completionPercentage}% Complete</span>
        </div>
        <Progress value={stats.completionPercentage} className="h-2.5 bg-slate-100" />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 text-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-xs">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="w-full md:w-36">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-slate-50 border-slate-200 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Priorities</SelectItem>
              <SelectItem value="urgent" className="text-xs">Urgent</SelectItem>
              <SelectItem value="high" className="text-xs">High</SelectItem>
              <SelectItem value="medium" className="text-xs">Medium</SelectItem>
              <SelectItem value="low" className="text-xs">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort by Due Date Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortAscending(!sortAscending)}
          className="w-full md:w-auto text-xs border-slate-200 text-slate-700 hover:bg-slate-50 shrink-0 cursor-pointer"
        >
          <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-slate-500" />
          Due Date: {sortAscending ? 'Soonest' : 'Latest'}
        </Button>
      </div>

      {/* Task Cards List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const hasDueDate = Boolean(task.dueDate);
            const isCompleted = task.status === 'completed';

            return (
              <Card
                key={task._id}
                className={`border transition-all hover:shadow-md ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 opacity-80'
                    : task.isOverdue
                    ? 'border-red-300 bg-red-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: Title, Category, Priority, Overdue indicator */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/tasks/${task._id}`}
                        className={`text-base font-bold hover:text-teal-600 transition-colors ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </Link>

                      <Badge
                        variant={
                          task.priority === 'urgent'
                            ? 'destructive'
                            : task.priority === 'high'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-[10px] uppercase font-bold px-2 py-0.2"
                      >
                        {task.priority}
                      </Badge>

                      {task.isOverdue && !isCompleted && (
                        <Badge variant="destructive" className="text-[10px] px-2 py-0.2 font-semibold">
                          Overdue
                        </Badge>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-0.5">
                      <span className="capitalize font-medium text-slate-600">
                        {task.category.replace('-', ' ')}
                      </span>

                      {hasDueDate && (
                        <>
                          <span>•</span>
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              task.isOverdue && !isCompleted ? 'text-red-600' : 'text-slate-600'
                            }`}
                          >
                            <Calendar className="h-3.5 w-3.5" />
                            Due {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                          </span>
                        </>
                      )}

                      {task.relatedGuideId && (
                        <>
                          <span>•</span>
                          <Link
                            href={`/guides/${task.relatedGuideId._id}`}
                            className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-0.5"
                          >
                            Linked Guide <ExternalLink className="h-3 w-3" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Inline Status Update Dropdown */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <Select
                      value={task.status}
                      onValueChange={(val) => handleUpdateStatus(task._id, val)}
                    >
                      <SelectTrigger
                        className={`h-9 w-36 text-xs font-semibold rounded-lg ${
                          task.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : task.status === 'in-progress'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button variant="ghost" size="sm" asChild className="h-9 px-2 text-slate-500 hover:text-slate-900">
                      <Link href={`/tasks/${task._id}`}>Details &rarr;</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 max-w-md mx-auto">
          <CheckSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No tasks found</h3>
          <p className="text-sm text-slate-500 mt-1">
            {statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery
              ? 'Try adjusting your search or filters to see more tasks.'
              : 'Your task list is empty. Add a task to get started!'}
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            className="mt-4 bg-teal-600 hover:bg-teal-500 text-white text-xs cursor-pointer"
          >
            <Plus className="mr-1 h-3.5 w-3.5" /> Add Task
          </Button>
        </div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Checklist Task</DialogTitle>
            <DialogDescription>
              Create an item to keep track of your pre-departure and arrival requirements.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Schedule biometric visa appointment"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Notes / Description</Label>
              <Textarea
                id="desc"
                placeholder="Include details, embassy links, or required documents..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
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
                  value={formPriority}
                  onValueChange={(val: any) => setFormPriority(val)}
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
              <Label htmlFor="dueDate">Target Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-teal-600 hover:bg-teal-500 text-white cursor-pointer"
              >
                {submitting ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
