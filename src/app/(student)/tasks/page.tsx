'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
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
  Sparkles,
  Check,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

  // Inline status update with confetti
  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (newStatus === 'completed') {
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { y: 0.6 },
            colors: ['#f97316', '#f59e0b', '#fb7185', '#10b981'],
          });
          toast.success('Task marked completed! Outstanding work! 🎉');
        } else {
          toast.success(`Task status changed to ${newStatus.replace('-', ' ')}`);
        }
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
        toast.success('Milestone added to your checklist! 🚀');
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
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="h-7 w-7 text-amber-400" />
            <span>Relocation Milestones</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Organize visas, banking, accommodation, flights, and campus registration.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="btn-ios-primary text-xs px-5 py-2.5 cursor-pointer shadow-lg shadow-orange-500/20 w-fit"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Milestone
        </Button>
      </div>

      {/* Stats Filter Tabs Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-gradient-to-br from-amber-500/25 via-orange-500/20 to-transparent text-white border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] backdrop-blur-xl'
              : 'ios-glass text-stone-300 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-stone-400">Total Milestones</span>
            <ListTodo className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">{stats.total}</p>
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'completed'
              ? 'bg-gradient-to-br from-emerald-500/25 via-teal-500/20 to-transparent text-white border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)] backdrop-blur-xl'
              : 'ios-glass text-stone-300 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-400">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">{stats.completed}</p>
        </button>

        <button
          onClick={() => setStatusFilter('not-started')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'not-started' || statusFilter === 'in-progress'
              ? 'bg-gradient-to-br from-amber-500/25 via-orange-500/20 to-transparent text-white border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] backdrop-blur-xl'
              : 'ios-glass text-stone-300 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">In Progress</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-1">{stats.pending}</p>
        </button>

        <button
          onClick={() => setStatusFilter('overdue')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'overdue'
              ? 'bg-gradient-to-br from-rose-500/25 via-red-500/20 to-transparent text-white border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.2)] backdrop-blur-xl'
              : 'ios-glass text-stone-300 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold tracking-wider text-rose-400">Overdue</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400 mt-1">{stats.overdue}</p>
        </button>
      </div>

      {/* Progress Bar Container */}
      <div className="ios-glass p-5 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between text-xs font-bold text-stone-300 mb-2">
          <span>Overall Preparation Journey</span>
          <span className="text-amber-400">{stats.completionPercentage}% Complete</span>
        </div>
        <Progress value={stats.completionPercentage} className="h-2.5 bg-stone-900" />
      </div>

      {/* Filters Row */}
      <div className="ios-glass p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <Input
            type="text"
            placeholder="Search checklists (e.g. visa, biometrics, housing)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
          />
        </div>

        {/* Category */}
        <div className="w-full md:w-52">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-white/[0.04] border-white/10 text-white text-xs rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#1c1613] border-white/15 text-white">
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="w-full md:w-40">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="bg-white/[0.04] border-white/10 text-white text-xs rounded-xl">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-[#1c1613] border-white/15 text-white">
              <SelectItem value="all" className="text-xs">All Priorities</SelectItem>
              <SelectItem value="urgent" className="text-xs">Urgent</SelectItem>
              <SelectItem value="high" className="text-xs">High</SelectItem>
              <SelectItem value="medium" className="text-xs">Medium</SelectItem>
              <SelectItem value="low" className="text-xs">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortAscending(!sortAscending)}
          className="w-full md:w-auto text-xs ios-pill border-white/10 text-stone-300 hover:text-white bg-white/[0.04] shrink-0"
        >
          <ArrowUpDown className="h-3.5 w-3.5 mr-1 text-amber-400" />
          {sortAscending ? 'Soonest Due' : 'Latest Due'}
        </Button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ios-glass h-20 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => {
            const hasDueDate = Boolean(task.dueDate);
            const isCompleted = task.status === 'completed';

            return (
              <motion.div
                key={task._id}
                whileHover={{ y: -2 }}
                className={`ios-glass rounded-2xl p-4 sm:p-5 border transition-all ${
                  isCompleted
                    ? 'border-emerald-500/20 bg-emerald-950/10 opacity-75'
                    : task.isOverdue
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : 'border-white/10 hover:border-amber-500/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/tasks/${task._id}`}
                        className={`text-sm sm:text-base font-bold hover:text-amber-300 transition-colors ${
                          isCompleted ? 'line-through text-stone-400' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </Link>

                      <Badge
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : task.priority === 'high'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-orange-500/15 text-orange-300 border-orange-500/30'
                        }`}
                      >
                        {task.priority}
                      </Badge>

                      {task.isOverdue && !isCompleted && (
                        <span className="text-[10px] px-2.5 py-0.5 font-bold rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-stone-400 line-clamp-1">{task.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-stone-400 flex-wrap pt-0.5">
                      <span className="capitalize font-medium text-stone-300">
                        {task.category.replace('-', ' ')}
                      </span>

                      {hasDueDate && (
                        <>
                          <span>•</span>
                          <span
                            className={`flex items-center gap-1 font-semibold ${
                              task.isOverdue && !isCompleted ? 'text-rose-400' : 'text-amber-300'
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            Due {format(new Date(task.dueDate!), 'MMM d, yyyy')}
                          </span>
                        </>
                      )}

                      {task.relatedGuideId && (
                        <>
                          <span>•</span>
                          <Link
                            href={`/guides/${task.relatedGuideId._id}`}
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                          >
                            Linked Handbook <ExternalLink className="h-3 w-3" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Status Select + Link */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    <Select
                      value={task.status}
                      onValueChange={(val) => handleUpdateStatus(task._id, val)}
                    >
                      <SelectTrigger
                        className={`h-9 w-36 text-xs font-bold rounded-xl border ${
                          task.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : task.status === 'in-progress'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/[0.04] text-stone-300 border-white/10'
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1c1613] border-white/15 text-white">
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-9 px-2.5 text-xs text-stone-400 hover:text-white hover:bg-white/5 rounded-xl"
                    >
                      <Link href={`/tasks/${task._id}`}>Details &rarr;</Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 p-8">
          <ListTodo className="h-12 w-12 text-stone-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No tasks match these filters</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            Try resetting your filters or add a new custom milestone for your journey.
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="mt-4 btn-ios-primary text-xs rounded-full px-5 py-2.5"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Task
          </Button>
        </div>
      )}

      {/* Add Task Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md ios-glass-prominent border-white/15 text-white backdrop-blur-3xl bg-[#171311]/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white">
              Add Relocation Milestone
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-400">
              Track visa biometrics, flight baggage, SIM cards, or university payments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-stone-300">Milestone Title *</Label>
              <Input
                placeholder="e.g. Open Student Bank Account"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                className="bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-stone-300">Notes & Checklist</Label>
              <Textarea
                placeholder="Bring original passport, I-20 or CAS letter, bank draft..."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
                className="bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-stone-300">Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="bg-white/[0.04] border-white/10 text-white text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1613] border-white/15 text-white">
                    {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-stone-300">Priority</Label>
                <Select
                  value={formPriority}
                  onValueChange={(val: any) => setFormPriority(val)}
                >
                  <SelectTrigger className="bg-white/[0.04] border-white/10 text-white text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1613] border-white/15 text-white">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-stone-300">Target Due Date</Label>
              <Input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="bg-white/[0.04] border-white/10 focus:border-amber-500 text-white text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="ios-pill border-white/15 text-stone-300 hover:text-white hover:bg-white/5 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="btn-ios-primary text-xs shadow-md"
              >
                {submitting ? 'Creating...' : 'Add Milestone'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
