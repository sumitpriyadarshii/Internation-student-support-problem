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
        return <Users className="h-5 w-5 text-orange-400" />;
      case 'event-update':
        return <Calendar className="h-5 w-5 text-rose-400" />;
      case 'guide-update':
        return <BookOpen className="h-5 w-5 text-amber-300" />;
      default:
        return <Info className="h-5 w-5 text-amber-400" />;
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
            <Bell className="h-7 w-7 text-amber-400" />
            <span>Alerts & Notifications</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Stay up to date with task deadlines, senior buddy messages, and campus event changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="ios-pill border-white/10 text-amber-400 hover:text-amber-300 hover:bg-white/5 text-xs cursor-pointer w-fit"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            {markingAll ? 'Updating...' : 'Mark all as read'}
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between ios-glass p-2 rounded-full border border-white/10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer ${
              !unreadOnly
                ? 'btn-ios-primary shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            All Alerts
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              unreadOnly
                ? 'btn-ios-primary shadow-md'
                : 'text-stone-400 hover:text-white'
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

        <span className="text-xs text-stone-400 pr-3">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ios-glass h-24 rounded-2xl animate-pulse" />
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
                className={`ios-glass rounded-2xl p-4 sm:p-5 border transition-all ${
                  isUnread
                    ? 'border-amber-500/40 bg-amber-950/20 shadow-[0_0_25px_rgba(245,158,11,0.1)]'
                    : 'border-white/10 bg-white/[0.02] opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        isUnread
                          ? 'bg-amber-500/20 border-amber-500/40 shadow-sm'
                          : 'bg-white/[0.04] border-white/10'
                      }`}
                    >
                      {getIcon(item.type)}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm ${
                            isUnread ? 'font-black text-white' : 'font-semibold text-stone-300'
                          }`}
                        >
                          {item.title}
                        </h3>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-stone-400 leading-relaxed">{item.message}</p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-stone-500">
                        <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                        {actionLink && (
                          <>
                            <span>•</span>
                            <Link
                              href={actionLink}
                              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
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
                      className="text-xs text-stone-400 hover:text-white shrink-0 rounded-xl"
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
          <Bell className="h-12 w-12 text-stone-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Notifications</h3>
          <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
            {unreadOnly
              ? 'You have zero unread alerts. You are fully up to date!'
              : 'You do not have any notifications at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
}
