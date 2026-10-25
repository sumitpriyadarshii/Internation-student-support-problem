'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { toast } from 'sonner';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ListTodo,
  BookOpen,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  MapPin,
  Check,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Plane,
  Heart,
  Globe2,
  Layers,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  dueDate?: string;
  isOverdue?: boolean;
}

interface GuideItem {
  _id: string;
  title: string;
  summary: string;
  slug: string;
  category: string;
  applicableCountries?: string[];
  verificationStatus?: string;
  createdAt: string;
}

interface BuddyItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  university: string;
  languages: string[];
  interests: string[];
  supportAreas: string[];
  matchScore: number;
  biography?: string;
}

interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  startDate: string;
  registrationCount: number;
  capacity?: number;
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#f43f5e'];

export default function StudentDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    completionPercentage: 0,
    upcomingDeadlines: [] as TaskItem[],
  });
  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [buddies, setBuddies] = useState<BuddyItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  // Add Task Modal State
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('personal');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // 1. Fetch user profile for destination country & completion %
        const profileRes = await fetch('/api/profile');
        let destinationCountry = '';
        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          if (profileJson.success && profileJson.data) {
            setProfileData(profileJson.data);
            destinationCountry = profileJson.data.profile?.destinationCountry || '';
          }
        }

        // 2. Fetch task stats
        const statsRes = await fetch('/api/tasks/stats');
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.success && statsJson.data) {
            setTaskStats(statsJson.data);
          }
        }

        // 3. Fetch recommended guides
        const guideUrl = destinationCountry
          ? `/api/guides?country=${encodeURIComponent(destinationCountry)}&limit=3`
          : '/api/guides?limit=3';
        const guideRes = await fetch(guideUrl);
        if (guideRes.ok) {
          const guideJson = await guideRes.json();
          if (guideJson.success && guideJson.data?.items) {
            setGuides(guideJson.data.items.slice(0, 3));
          }
        }

        // 4. Fetch buddies
        const buddyRes = await fetch('/api/buddies');
        if (buddyRes.ok) {
          const buddyJson = await buddyRes.json();
          if (buddyJson.success && Array.isArray(buddyJson.data)) {
            setBuddies(buddyJson.data.slice(0, 3));
          }
        }

        // 5. Fetch upcoming events
        const eventRes = await fetch('/api/events?upcoming=true');
        if (eventRes.ok) {
          const eventJson = await eventRes.json();
          if (eventJson.success && Array.isArray(eventJson.data)) {
            setEvents(eventJson.data.slice(0, 3));
          }
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profileData?.profile) return 40;
    const p = profileData.profile;
    const checks = [
      Boolean(profileData.name),
      Boolean(p.countryOfOrigin),
      Boolean(p.destinationCountry),
      Boolean(p.destinationCity),
      Boolean(p.university),
      Boolean(p.preferredLanguage),
      Boolean(p.languagesSpoken && p.languagesSpoken.length > 0),
      Boolean(p.interests && p.interests.length > 0),
      Boolean(p.supportPreferences && p.supportPreferences.length > 0),
    ];
    const filled = checks.filter(Boolean).length;
    return Math.round((filled / checks.length) * 100);
  };

  // Quick complete a task with celebratory confetti
  const handleQuickCompleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (res.ok) {
        // Confetti explosion
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#06b6d4', '#10b981', '#f43f5e'],
        });

        toast.success('Task marked completed! Great job! 🎉');

        // Refresh stats
        const statsRes = await fetch('/api/tasks/stats');
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          if (statsJson.success) setTaskStats(statsJson.data);
        }
      }
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      toast.error('Task title is required');
      return;
    }

    setCreatingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim(),
          category: newTaskCategory,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || null,
          status: 'not-started',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create task');
      }

      toast.success('Task created successfully! 🚀');
      setIsAddTaskOpen(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');

      // Refresh task stats
      const statsRes = await fetch('/api/tasks/stats');
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success) setTaskStats(statsJson.data);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error creating task');
    } finally {
      setCreatingTask(false);
    }
  };

  const userName = profileData?.name || session?.user?.name || 'Student';
  const destination = profileData?.profile?.destinationCountry
    ? `${profileData.profile.destinationCity || ''}, ${profileData.profile.destinationCountry}`
    : 'International Campus';

  const chartData = [
    { name: 'Completed', value: taskStats.completed },
    {
      name: 'Pending',
      value: taskStats.pending - taskStats.overdue > 0 ? taskStats.pending - taskStats.overdue : 0,
    },
    { name: 'Overdue', value: taskStats.overdue },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8 pb-16">
      {/* WELCOME BANNER WITH AURORA GLASS */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 border border-white/10 shadow-[0_15px_45px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      >
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>International Student Cockpit</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Welcome back, <span className="text-gradient-aurora">{userName}</span>! 👋
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your flight control center for{' '}
              <span className="text-cyan-300 font-bold underline decoration-indigo-500 underline-offset-4">
                {destination}
              </span>
              . Keep checking off your arrival milestones!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => setIsAddTaskOpen(true)}
                className="btn-shimmer bg-gradient-to-r from-indigo-500 via-violet-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 cursor-pointer"
              >
                <Plus className="mr-1.5 h-4 w-4" /> Add Milestone Task
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/15 bg-white/[0.05] hover:bg-white/10 text-white text-xs rounded-xl"
              >
                <Link href="/buddies">
                  <Users className="mr-1.5 h-4 w-4 text-cyan-400" /> Connect Senior Buddies
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/15 bg-white/[0.05] hover:bg-white/10 text-white text-xs rounded-xl"
              >
                <Link href="/guides">
                  <BookOpen className="mr-1.5 h-4 w-4 text-indigo-400" /> Destination Guides
                </Link>
              </Button>
            </div>
          </div>

          {/* Profile Readiness Glass Card */}
          <div className="rounded-2xl bg-slate-950/70 border border-white/10 p-5 lg:w-80 shrink-0 backdrop-blur-xl shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Profile Readiness</span>
              </span>
              <span className="text-cyan-400 font-black text-sm">
                {calculateProfileCompletion()}%
              </span>
            </div>
            <Progress value={calculateProfileCompletion()} className="h-2.5 bg-slate-800" />
            <div className="mt-3.5 flex justify-between items-center text-[11px]">
              <span className="text-slate-400">
                {calculateProfileCompletion() === 100
                  ? 'All details complete!'
                  : 'Add city & study details'}
              </span>
              <Link
                href="/profile"
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                <span>Edit Profile</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS COUNTER ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-5 space-y-2 animate-pulse">
              <div className="h-3 w-16 bg-white/10 rounded" />
              <div className="h-7 w-12 bg-white/15 rounded" />
            </div>
          ))
        ) : (
          <>
            {/* 1. Total Tasks */}
            <motion.div
              whileHover={{ y: -3 }}
              className="glass-panel glass-card-specular rounded-2xl p-5 border border-white/10 flex items-center justify-between hover:border-indigo-500/40 transition-all"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Milestones
                </p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {taskStats.total}
                </p>
                <p className="text-[10px] text-indigo-400 mt-0.5">Pre-departure roadmap</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <ListTodo className="h-6 w-6" />
              </div>
            </motion.div>

            {/* 2. Completed */}
            <motion.div
              whileHover={{ y: -3 }}
              className="glass-panel glass-card-specular rounded-2xl p-5 border border-white/10 flex items-center justify-between hover:border-emerald-500/40 transition-all"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Completed
                </p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
                  {taskStats.completed}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {taskStats.completionPercentage}% of roadmap done
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </motion.div>

            {/* 3. Pending */}
            <motion.div
              whileHover={{ y: -3 }}
              className="glass-panel glass-card-specular rounded-2xl p-5 border border-white/10 flex items-center justify-between hover:border-amber-500/40 transition-all"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  In Progress
                </p>
                <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-1">
                  {taskStats.pending}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Ready for action</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Clock className="h-6 w-6" />
              </div>
            </motion.div>

            {/* 4. Overdue */}
            <motion.div
              whileHover={{ y: -3 }}
              className="glass-panel glass-card-specular rounded-2xl p-5 border border-white/10 flex items-center justify-between hover:border-rose-500/40 transition-all"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  Needs Attention
                </p>
                <p className="text-2xl sm:text-3xl font-black text-rose-400 mt-1">
                  {taskStats.overdue}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Overdue deadlines</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <AlertCircle className="h-6 w-6" />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* MAIN BENTO SECTION: UPCOMING DEADLINES & PROGRESS RING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines (2 cols) */}
        <div className="lg:col-span-2 glass-panel glass-card-specular rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-400" />
                  <span>Next Priority Milestones</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tasks scheduled or requiring your attention
                </p>
              </div>
              <Link
                href="/tasks"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Full Checklist</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-14 bg-white/5 rounded-2xl animate-pulse" />
                <div className="h-14 bg-white/5 rounded-2xl animate-pulse" />
                <div className="h-14 bg-white/5 rounded-2xl animate-pulse" />
              </div>
            ) : taskStats.upcomingDeadlines && taskStats.upcomingDeadlines.length > 0 ? (
              <div className="space-y-2.5">
                {taskStats.upcomingDeadlines.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      {/* Interactive Complete Button */}
                      <button
                        onClick={(e) => handleQuickCompleteTask(task._id, e)}
                        title="Mark Completed"
                        className="w-7 h-7 rounded-full border border-slate-600 hover:border-emerald-400 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <div className="min-w-0">
                        <Link
                          href={`/tasks/${task._id}`}
                          className="text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors truncate block"
                        >
                          {task.title}
                        </Link>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span className="capitalize">{task.category}</span>
                          <span>•</span>
                          <span className="capitalize text-amber-300 font-semibold">
                            Due {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'Soon'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge
                      className={`capitalize text-[10px] shrink-0 font-bold px-2 py-0.5 rounded-lg border ${
                        task.priority === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : task.priority === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-2" />
                <p className="text-sm font-bold text-white">All caught up!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  No urgent deadlines for the upcoming week.
                </p>
                <Button
                  onClick={() => setIsAddTaskOpen(true)}
                  size="sm"
                  className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Custom Task
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Task Completion Progress Wheel */}
        <div className="glass-panel glass-card-specular rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-white">Relocation Progress</h3>
            <p className="text-xs text-slate-400 mt-0.5">Journey readiness breakdown</p>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            {taskStats.total > 0 ? (
              <div className="w-full flex flex-col items-center">
                <div className="h-44 w-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === 'Completed'
                                ? '#10b981'
                                : entry.name === 'Pending'
                                ? '#f59e0b'
                                : '#f43f5e'
                            }
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">
                      {taskStats.completionPercentage}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      Completed
                    </span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 font-black">{taskStats.completed}</p>
                    <p className="text-[10px] text-slate-400">Done</p>
                  </div>
                  <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    <p className="text-xs text-amber-400 font-black">{taskStats.pending}</p>
                    <p className="text-[10px] text-slate-400">Active</p>
                  </div>
                  <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                    <p className="text-xs text-rose-400 font-black">{taskStats.overdue}</p>
                    <p className="text-[10px] text-slate-400">Overdue</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <ListTodo className="h-10 w-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No tasks generated yet</p>
                <Button
                  size="sm"
                  onClick={() => setIsAddTaskOpen(true)}
                  className="mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                >
                  Create First Milestone
                </Button>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-white/5 text-center">
            <p className="text-[11px] text-slate-400">
              Completed items automatically unlock next-stage guides.
            </p>
          </div>
        </div>
      </div>

      {/* SUGGESTED PEER BUDDIES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <span>Recommended Senior Buddies</span>
            </h2>
            <p className="text-xs text-slate-400">
              Seniors matched based on your university, major, and native languages
            </p>
          </div>
          <Link
            href="/buddies"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Explore All Buddies</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 space-y-3 animate-pulse">
                <div className="h-10 w-10 bg-white/10 rounded-xl" />
                <div className="h-4 w-3/4 bg-white/10 rounded" />
                <div className="h-4 w-1/2 bg-white/10 rounded" />
              </div>
            ))
          ) : buddies.length > 0 ? (
            buddies.map((buddy) => (
              <motion.div
                key={buddy._id}
                whileHover={{ y: -4 }}
                className="glass-panel glass-card-specular rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-md">
                        {buddy.userId?.name ? buddy.userId.name.charAt(0).toUpperCase() : 'B'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {buddy.userId?.name || 'Fellow Student'}
                        </p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <GraduationCap className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span>{buddy.university}</span>
                        </p>
                      </div>
                    </div>
                    {typeof buddy.matchScore === 'number' && (
                      <span className="text-xs font-extrabold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full shrink-0">
                        {buddy.matchScore}%
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-black/20 p-2.5 rounded-xl border border-white/5 mb-3">
                    {buddy.biography || 'Eager to assist incoming international students settle in!'}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {(buddy.languages || []).slice(0, 3).map((lang) => (
                      <span
                        key={lang}
                        className="text-[10px] bg-white/[0.06] text-slate-300 px-2 py-0.5 rounded-md font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="border-white/15 bg-white/[0.04] hover:bg-white/10 text-white text-xs rounded-xl"
                  >
                    <Link href={`/buddies/${buddy._id}`}>Profile</Link>
                  </Button>
                  <Button
                    size="sm"
                    asChild
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    <Link href={`/buddies/${buddy._id}`}>Connect</Link>
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
              <Users className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No buddies matched right now</p>
              <Link href="/buddies" className="text-xs text-indigo-400 font-bold mt-1 inline-block">
                Browse full directory &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* RECOMMENDED GUIDES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              <span>Recommended Relocation Handbooks</span>
            </h2>
            <p className="text-xs text-slate-400">
              Step-by-step verified procedures for your destination country
            </p>
          </div>
          <Link
            href="/guides"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>All Guides</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 space-y-3 animate-pulse">
                <div className="h-4 w-1/2 bg-white/10 rounded" />
                <div className="h-6 w-3/4 bg-white/15 rounded" />
                <div className="h-10 w-full bg-white/5 rounded" />
              </div>
            ))
          ) : guides.length > 0 ? (
            guides.map((guide) => (
              <motion.div key={guide._id} whileHover={{ y: -4 }}>
                <Link href={`/guides/${guide._id}`} className="group block h-full">
                  <div className="glass-panel glass-card-specular rounded-2xl p-5 border border-white/10 flex flex-col justify-between h-full hover:border-indigo-500/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                          {guide.category.replace('-', ' ')}
                        </span>
                        {guide.verificationStatus === 'verified' && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                            <ShieldCheck className="h-3.5 w-3.5" /> Verified
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-1.5">
                        {guide.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {guide.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/10 pt-3 mt-2">
                      <span>{guide.applicableCountries?.join(', ') || 'Global'}</span>
                      <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center">
                        Read Guide &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
              <BookOpen className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No guides matching destination</p>
              <Link href="/guides" className="text-xs text-indigo-400 font-bold mt-1 inline-block">
                View library &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* UPCOMING COMMUNITY EVENTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-rose-400" />
              <span>Campus & Orientation Meetups</span>
            </h2>
            <p className="text-xs text-slate-400">
              Meet fellow international scholars at online and local city events
            </p>
          </div>
          <Link
            href="/community"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Community Board</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel rounded-2xl p-5 space-y-3 animate-pulse">
                <div className="h-4 w-1/3 bg-white/10 rounded" />
                <div className="h-6 w-3/4 bg-white/15 rounded" />
                <div className="h-8 w-full bg-white/5 rounded" />
              </div>
            ))
          ) : events.length > 0 ? (
            events.map((event) => (
              <motion.div key={event._id} whileHover={{ y: -4 }}>
                <Link href={`/community/${event._id}`} className="group block h-full">
                  <div className="glass-panel glass-card-specular rounded-2xl p-5 border border-white/10 flex flex-col justify-between h-full hover:border-rose-500/40 transition-all">
                    <div>
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/15 border border-rose-500/25 px-2 py-0.5 rounded-md mb-2">
                        {event.category.replace('-', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1 mb-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 border-t border-white/10 pt-3">
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span>{format(new Date(event.startDate), 'EEE, MMM d • h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 truncate">
                        <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
              <Calendar className="h-8 w-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No upcoming events scheduled</p>
              <Link href="/community" className="text-xs text-indigo-400 font-bold mt-1 inline-block">
                View community board &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TASK MODAL */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-md bg-slate-950/95 border-white/15 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-white">
              Add New Relocation Milestone
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Create a custom reminder or checkpoint for your visa, packing, or university journey.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="taskTitle" className="text-xs font-bold text-slate-300">
                Task Title *
              </Label>
              <Input
                id="taskTitle"
                placeholder="e.g. Schedule Visa Biometrics Appointment"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="bg-slate-900 border-white/10 text-white text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="taskDesc" className="text-xs font-bold text-slate-300">
                Description / Notes
              </Label>
              <Textarea
                id="taskDesc"
                placeholder="Required documents, appointment time, address..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
                className="bg-slate-900 border-white/10 text-white text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Category</Label>
                <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-white text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/15 text-white">
                    <SelectItem value="documentation-immigration">Visa & Immigration</SelectItem>
                    <SelectItem value="banking-financial">Banking & Money</SelectItem>
                    <SelectItem value="sim-mobile">SIM & Mobile</SelectItem>
                    <SelectItem value="accommodation-transport">Housing & Transit</SelectItem>
                    <SelectItem value="university-campus">Campus Registration</SelectItem>
                    <SelectItem value="healthcare-emergency">Health & Insurance</SelectItem>
                    <SelectItem value="personal">Personal Checklist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-300">Priority</Label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                  <SelectTrigger className="bg-slate-900 border-white/10 text-white text-xs rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/15 text-white">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="taskDueDate" className="text-xs font-bold text-slate-300">
                Target Due Date
              </Label>
              <Input
                id="taskDueDate"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-slate-900 border-white/10 text-white text-xs rounded-xl"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddTaskOpen(false)}
                className="border-white/15 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingTask}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {creatingTask ? 'Saving...' : 'Add Milestone'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
