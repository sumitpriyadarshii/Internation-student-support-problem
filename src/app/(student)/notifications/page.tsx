'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  CheckSquare,
  Users,
  Calendar,
  BookOpen,
  Info,
  CheckCheck,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'task-reminder' | 'buddy-request' | 'event-update' | 'system' | 'guide-update';
  relatedResourceType?: string;
  relatedResourceId?: string;
  readAt?: string | null;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const url = unreadOnly
        ? '/api/notifications?unreadOnly=true&limit=50'
        : '/api/notifications?limit=50';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setNotifications(json.data.items || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('All notifications marked as read! 🚀');
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      } else {
        throw new Error(json.error || 'Failed to mark all as read');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error marking all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  // Icon selector based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case 'task-reminder':
        return <CheckSquare className="h-5 w-5 text-amber-400" />;
      case 'buddy-request':
        return <Users className="h-5 w-5 text-cyan-400" />;
      case 'event-update':
        return <Calendar className="h-5 w-5 text-rose-400" />;
      case 'guide-update':
        return <BookOpen className="h-5 w-5 text-purple-400" />;
      default:
        return <Info className="h-5 w-5 text-indigo-400" />;
    }
  };

  // Link selector based on resource type
  const getActionLink = (item: NotificationItem) => {
    if (item.type === 'buddy-request') return '/buddies';
    if (item.type === 'event-update') return '/community';
    if (item.type === 'task-reminder') return '/tasks';
    if (item.type === 'guide-update') return '/guides';
    return null;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-indigo-400" />
            <span>Alerts & Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Stay up to date with task deadlines, senior buddy messages, and campus event changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="border-white/10 text-cyan-400 hover:text-cyan-300 hover:bg-white/5 rounded-xl text-xs cursor-pointer w-fit"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            {markingAll ? 'Updating...' : 'Mark all as read'}
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between glass-panel p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              !unreadOnly
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Alerts
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              unreadOnly
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Unread Only</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <span className="text-xs text-slate-400 pr-2">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-panel h-24 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((item) => {
            const isUnread = !item.readAt;
            const actionLink = getActionLink(item);

            return (
              <motion.div
                key={item._id}
                whileHover={{ y: -2 }}
                className={`glass-panel glass-card-specular rounded-2xl p-4 sm:p-5 border transition-all ${
                  isUnread
                    ? 'border-indigo-500/40 bg-indigo-950/20'
                    : 'border-white/10 bg-slate-900/60 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isUnread
                          ? 'bg-indigo-500/20 border-indigo-500/40 shadow-sm'
                          : 'bg-white/[0.04] border-white/10'
                      }`}
                    >
                      {getIcon(item.type)}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm ${
                            isUnread ? 'font-black text-white' : 'font-semibold text-slate-300'
                          }`}
                        >
                          {item.title}
                        </h3>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{item.message}</p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                        <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                        {actionLink && (
                          <>
                            <span>•</span>
                            <Link
                              href={actionLink}
                              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5"
                            >
                              View Resource <ExternalLink className="h-3 w-3" />
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(item._id)}
                      className="text-xs text-slate-400 hover:text-white shrink-0 rounded-xl"
                    >
                      Mark read
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 p-8">
          <Bell className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Notifications</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {unreadOnly
              ? 'You have zero unread alerts. You are fully up to date!'
              : 'You do not have any notifications at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
}
