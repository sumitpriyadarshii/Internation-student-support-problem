'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { format, formatDistanceToNow } from 'date-fns';
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
  ExternalLink,
  MapPin,
  Check,
  ChevronRight,
  GraduationCap,
  Sparkles,
  ShieldCheck,
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

const PIE_COLORS = ['#0d9488', '#f59e0b', '#ef4444'];

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

      toast.success('Task created successfully!');
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
    : 'your international journey';

  const chartData = [
    { name: 'Completed', value: taskStats.completed },
    { name: 'Pending', value: taskStats.pending - taskStats.overdue > 0 ? taskStats.pending - taskStats.overdue : 0 },
    { name: 'Overdue', value: taskStats.overdue },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Far From Home Student Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Tracking your pre-departure preparations and campus arrival for{' '}
              <span className="text-teal-300 font-semibold">{destination}</span>.
            </p>
          </div>

          {/* Profile Completion Indicator */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 md:w-72 shrink-0 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-slate-300">Profile Readiness</span>
              <span className="text-teal-400 font-bold">{calculateProfileCompletion()}%</span>
            </div>
            <Progress value={calculateProfileCompletion()} className="h-2 bg-slate-700" />
            <div className="mt-3 flex justify-between items-center text-xs">
              <span className="text-slate-400">Keep profile updated</span>
              <Link href="/profile" className="text-teal-400 hover:text-teal-300 font-medium">
                Edit &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setIsAddTaskOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white font-medium cursor-pointer shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
        <Button variant="outline" asChild className="border-slate-300 text-slate-700 hover:bg-slate-100">
          <Link href="/guides">
            <BookOpen className="mr-2 h-4 w-4 text-teal-600" /> Browse Guides
          </Link>
        </Button>
        <Button variant="outline" asChild className="border-slate-300 text-slate-700 hover:bg-slate-100">
          <Link href="/buddies">
            <Users className="mr-2 h-4 w-4 text-teal-600" /> Find Buddy
          </Link>
        </Button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-12" />
            </Card>
          ))
        ) : (
          <>
            <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-800 mt-1">{taskStats.total}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <ListTodo className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Completed</p>
                  <p className="text-2xl md:text-3xl font-bold text-emerald-700 mt-1">{taskStats.completed}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Pending</p>
                  <p className="text-2xl md:text-3xl font-bold text-amber-700 mt-1">{taskStats.pending}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Overdue</p>
                  <p className="text-2xl md:text-3xl font-bold text-red-600 mt-1">{taskStats.overdue}</p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Grid: Upcoming Deadlines + Task Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines (2 cols) */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" /> Upcoming Deadlines
              </CardTitle>
              <CardDescription>Tasks scheduled for completion in the next 7 days</CardDescription>
            </div>
            <Link href="/tasks" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="flex-1">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : taskStats.upcomingDeadlines && taskStats.upcomingDeadlines.length > 0 ? (
              <div className="space-y-2.5">
                {taskStats.upcomingDeadlines.map((task) => (
                  <Link
                    key={task._id}
                    href={`/tasks/${task._id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all group"
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <p className="text-sm font-medium text-slate-800 group-hover:text-teal-700 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize">{task.category}</span>
                        <span>•</span>
                        <span className="capitalize font-medium text-amber-600">
                          Due {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Soon'}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        task.priority === 'urgent'
                          ? 'destructive'
                          : task.priority === 'high'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="capitalize text-xs shrink-0"
                    >
                      {task.priority}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="h-8 w-8 text-teal-500 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No urgent deadlines!</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  You are all caught up for the week ahead.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Completion Progress & Chart */}
        <Card className="border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-slate-800">Checklist Overview</CardTitle>
            <CardDescription>Progress through pre-departure tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1 py-4">
            {taskStats.total > 0 ? (
              <div className="w-full flex flex-col items-center">
                <div className="h-40 w-40 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.name === 'Completed'
                                ? '#0d9488'
                                : entry.name === 'Pending'
                                ? '#f59e0b'
                                : '#ef4444'
                            }
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-slate-800">
                      {taskStats.completionPercentage}%
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Done</span>
                  </div>
                </div>

                <div className="w-full grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <p className="text-xs text-emerald-700 font-bold">{taskStats.completed}</p>
                    <p className="text-[10px] text-slate-500">Done</p>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <p className="text-xs text-amber-700 font-bold">{taskStats.pending}</p>
                    <p className="text-[10px] text-slate-500">Pending</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                    <p className="text-xs text-red-700 font-bold">{taskStats.overdue}</p>
                    <p className="text-[10px] text-slate-500">Overdue</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <ListTodo className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No tasks in your checklist</p>
                <Button
                  size="sm"
                  onClick={() => setIsAddTaskOpen(true)}
                  className="mt-3 bg-teal-600 text-white text-xs"
                >
                  Create First Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Guides Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-600" /> Recommended Guides
            </h2>
            <p className="text-sm text-slate-500">
              Handbooks curated for your visa, accommodation, and campus journey
            </p>
          </div>
          <Link
            href="/guides"
            className="text-xs md:text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Explore All Guides <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))
          ) : guides.length > 0 ? (
            guides.map((guide) => (
              <Link key={guide._id} href={`/guides/${guide._id}`} className="group block">
                <Card className="h-full border-slate-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {guide.category.replace('-', ' ')}
                      </Badge>
                      {guide.verificationStatus === 'verified' && (
                        <span className="flex items-center gap-1 text-[11px] text-teal-600 font-medium">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2">
                      {guide.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">
                      {guide.summary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 mt-3 pt-3">
                    <span>{guide.applicableCountries?.join(', ') || 'Global'}</span>
                    <span className="text-teal-600 font-medium group-hover:translate-x-1 transition-transform flex items-center">
                      Read Guide &rarr;
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BookOpen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No guides found yet</p>
              <Link href="/guides" className="text-xs text-teal-600 font-medium mt-1 inline-block">
                Browse guide repository &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Buddies Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" /> Suggested Peer Buddies
            </h2>
            <p className="text-sm text-slate-500">
              Senior students and fellows matched based on your university and languages
            </p>
          </div>
          <Link
            href="/buddies"
            className="text-xs md:text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            Find More Buddies <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </Card>
            ))
          ) : buddies.length > 0 ? (
            buddies.map((buddy) => (
              <Card key={buddy._id} className="border-slate-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between">
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                        {buddy.userId?.name ? buddy.userId.name.charAt(0).toUpperCase() : 'B'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {buddy.userId?.name || 'Fellow Student'}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <GraduationCap className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {buddy.university}
                        </p>
                      </div>
                    </div>
                    {typeof buddy.matchScore === 'number' && (
                      <Badge
                        variant={buddy.matchScore > 70 ? 'success' : buddy.matchScore > 40 ? 'warning' : 'secondary'}
                        className="text-xs shrink-0"
                      >
                        {buddy.matchScore}% match
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                    {buddy.biography || 'Eager to assist incoming international students settle in!'}
                  </p>
                </CardHeader>

                <CardContent className="p-5 pt-0">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(buddy.languages || []).slice(0, 3).map((lang) => (
                      <span key={lang} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {lang}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                      <Link href={`/buddies/${buddy._id}`}>View Profile</Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1 bg-teal-600 hover:bg-teal-500 text-white text-xs">
                      <Link href={`/buddies/${buddy._id}`}>Connect</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Users className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No buddies matched right now</p>
              <Link href="/buddies" className="text-xs text-teal-600 font-medium mt-1 inline-block">
                View full directory &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" /> Upcoming Community Events
            </h2>
            <p className="text-sm text-slate-500">
              Join orientation workshops, language exchanges, and campus social meetups
            </p>
          </div>
          <Link
            href="/community"
            className="text-xs md:text-sm font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            All Events <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-3">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))
          ) : events.length > 0 ? (
            events.map((event) => (
              <Link key={event._id} href={`/community/${event._id}`} className="group block">
                <Card className="h-full border-slate-200 hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between">
                  <CardHeader className="p-5 pb-3">
                    <Badge variant="outline" className="w-fit text-[10px] uppercase font-semibold text-teal-700 border-teal-200 bg-teal-50/50 mb-2">
                      {event.category.replace('-', ' ')}
                    </Badge>
                    <CardTitle className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                      {event.title}
                    </CardTitle>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {event.description}
                    </p>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-2 text-xs text-slate-500 border-t border-slate-100 mt-2 pt-3">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Calendar className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      {format(new Date(event.startDate), 'EEE, MMM d, yyyy • h:mm a')}
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No upcoming events right now</p>
              <Link href="/community" className="text-xs text-teal-600 font-medium mt-1 inline-block">
                View community board &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Preparation Task</DialogTitle>
            <DialogDescription>
              Create a custom reminder or to-do item for your travel or study journey.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                placeholder="e.g. Apply for Student Visa"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDesc">Description</Label>
              <Textarea
                id="taskDesc"
                placeholder="Add notes, document requirements, or URLs..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documentation-immigration">Visa & Docs</SelectItem>
                    <SelectItem value="banking-financial">Banking & Money</SelectItem>
                    <SelectItem value="accommodation-transport">Accommodation</SelectItem>
                    <SelectItem value="sim-mobile">SIM & Mobile</SelectItem>
                    <SelectItem value="university-campus">University</SelectItem>
                    <SelectItem value="healthcare-emergency">Healthcare</SelectItem>
                    <SelectItem value="food-groceries">Food & Living</SelectItem>
                    <SelectItem value="local-culture-language">Culture & Lang</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
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
              <Label htmlFor="taskDueDate">Due Date</Label>
              <Input
                id="taskDueDate"
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddTaskOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={creatingTask}
                className="bg-teal-600 hover:bg-teal-500 text-white"
              >
                {creatingTask ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
