'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Calendar,
  UserCheck,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface PlatformStats {
  totalUsers: number;
  activeStudents: number;
  publishedGuides: number;
  activeTasks: number;
  upcomingEvents: number;
  buddyRequests: number;
  totalBuddyProfiles: number;
}

interface TaskCompletionRate {
  name: string;
  value: number;
  percentage: number;
  color: string;
  [key: string]: any;
}

interface EventByCategory {
  category: string;
  label: string;
  count: number;
}

interface UserGrowth {
  month: string;
  users: number;
  newUsers: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'guide' | 'event' | 'buddy';
  title: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [taskRates, setTaskRates] = useState<TaskCompletionRate[]>([]);
  const [eventsByCategory, setEventsByCategory] = useState<EventByCategory[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      const json = await res.json();

      if (json.success && json.data) {
        setStats(json.data.stats);
        setTaskRates(json.data.taskCompletionRates || []);
        setEventsByCategory(json.data.eventsByCategory || []);
        setUserGrowth(json.data.userGrowth || []);
        setRecentActivity(json.data.recentActivity || []);
      } else {
        toast.error(json.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      toast.error('Network error loading platform statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/80 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">Platform Overview</h1>
            <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs">
              Live Metrics
            </Badge>
          </div>
          <p className="text-slate-400 text-sm">
            Monitor international student onboarding, guides reach, buddy pairings, and community engagement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            disabled={loading}
            className="border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-lg shadow-teal-600/20">
            <Link href="/admin/guides?action=create">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Add Guide
            </Link>
          </Button>

          <Button asChild size="sm" variant="secondary" className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700">
            <Link href="/admin/templates?action=create">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Add Template
            </Link>
          </Button>

          <Button asChild size="sm" variant="secondary" className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700">
            <Link href="/admin/events?action=create">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              Add Event
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Users */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400" />
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Total Users</span>
              <Users className="w-4 h-4 text-teal-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-8 w-16 bg-slate-800" />
            ) : (
              <div className="text-2xl font-bold text-white">{stats?.totalUsers ?? 0}</div>
            )}
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-teal-400 font-medium">Platform-wide</span> accounts
            </p>
          </CardContent>
        </Card>

        {/* Active Students */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Active Students</span>
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-8 w-16 bg-slate-800" />
            ) : (
              <div className="text-2xl font-bold text-white">{stats?.activeStudents ?? 0}</div>
            )}
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-blue-400 font-medium">Onboarded</span> student base
            </p>
          </CardContent>
        </Card>

        {/* Published Guides */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400" />
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Published Guides</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-8 w-16 bg-slate-800" />
            ) : (
              <div className="text-2xl font-bold text-white">{stats?.publishedGuides ?? 0}</div>
            )}
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-medium">Verified</span> survival info
            </p>
          </CardContent>
        </Card>

        {/* Active Tasks */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400" />
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Active Tasks</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-8 w-16 bg-slate-800" />
            ) : (
              <div className="text-2xl font-bold text-white">{stats?.activeTasks ?? 0}</div>
            )}
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-amber-400 font-medium">In flight</span> checklist items
            </p>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-400" />
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Upcoming Events</span>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-8 w-16 bg-slate-800" />
            ) : (
              <div className="text-2xl font-bold text-white">{stats?.upcomingEvents ?? 0}</div>
            )}
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-purple-400 font-medium">Community</span> gatherings
            </p>
          </CardContent>
        </Card>

        {/* Buddy Requests */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 relative overflow-hidden group hover:border-slate-700 transition">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-orange-400" />
          <CardHeader className="p-4 pb-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Pending Requests</span>
              <UserCheck className="w-4 h-4 text-rose-400" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            {loading ? (
              <Skeleton className="h-8 w-16 bg-slate-800" />
            ) : (
              <div className="text-2xl font-bold text-white">{stats?.buddyRequests ?? 0}</div>
            )}
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-rose-400 font-medium">Peer pairing</span> awaiting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart (2 cols on large screen) */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 text-slate-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-teal-400" />
                  User Growth Trend
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-0.5">
                  Platform cumulative user registration over the recent months
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-slate-700 text-slate-400 text-xs">
                Monthly
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              {loading || !isMounted ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" />
                </div>
              ) : userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      name="Total Users"
                      stroke="#14b8a6"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#userGrowthGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                  <Activity className="w-8 h-8 mb-2 opacity-40" />
                  No user growth trend recorded yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Completion Rates (Pie Chart) */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Task Completion Status
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-0.5">
              Breakdown of student checklist progress
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              {loading || !isMounted ? (
                <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" />
              ) : taskRates.some((t) => t.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskRates}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {taskRates.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => (
                        <span className="text-xs text-slate-300">
                          {value} ({entry?.payload?.percentage ?? 0}%)
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 text-sm">
                  <Layers className="w-8 h-8 mb-2 opacity-40" />
                  No student tasks created yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events by Category & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events by Category Bar Chart */}
        <Card className="lg:col-span-2 bg-slate-900 border-slate-800 text-slate-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  Community Events Distribution
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-0.5">
                  Scheduled social, cultural, and orientation activities by category
                </CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-xs text-teal-400 hover:text-teal-300">
                <Link href="/admin/events">View All Events &rarr;</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              {loading || !isMounted ? (
                <Skeleton className="h-full w-full bg-slate-800/50 rounded-xl" />
              ) : eventsByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={eventsByCategory}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <XAxis
                      dataKey="label"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#334155' }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Events"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                  <Calendar className="w-8 h-8 mb-2 opacity-40" />
                  No events created yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="bg-slate-900 border-slate-800 text-slate-100 flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                Recent System Activity
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                Real-time
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto max-h-[300px]">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full bg-slate-800/60 rounded-lg" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  let Icon = Sparkles;
                  let colorClass = 'text-teal-400 bg-teal-500/10 border-teal-500/20';

                  if (activity.type === 'user') {
                    Icon = Users;
                    colorClass = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                  } else if (activity.type === 'guide') {
                    Icon = BookOpen;
                    colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                  } else if (activity.type === 'event') {
                    Icon = Calendar;
                    colorClass = 'text-purple-400 bg-purple-500/10 border-purple-500/20';
                  } else if (activity.type === 'buddy') {
                    Icon = UserCheck;
                    colorClass = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
                  }

                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 transition"
                    >
                      <div className={`p-2 rounded-lg border ${colorClass} shrink-0 mt-0.5`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {activity.description}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(activity.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm py-8">
                <AlertCircle className="w-8 h-8 mb-2 opacity-40" />
                No recent activity recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Link
          href="/admin/users"
          className="group p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-teal-500/40 transition shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-105 transition">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-teal-300 transition">
                Manage Users
              </h3>
              <p className="text-xs text-slate-400">Suspend, activate, or adjust roles</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/admin/buddies"
          className="group p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-rose-500/40 transition shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-rose-300 transition">
                Buddy Oversight
              </h3>
              <p className="text-xs text-slate-400">Review and approve senior mentors</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/admin/templates"
          className="group p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 hover:border-amber-500/40 transition shadow-lg flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition">
                Task Automation
              </h3>
              <p className="text-xs text-slate-400">Configure pre-arrival & arrival templates</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition" />
        </Link>
      </div>
    </div>
  );
}
