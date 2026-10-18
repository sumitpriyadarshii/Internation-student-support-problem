'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
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
        toast.success('All notifications marked as read');
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
        return <CheckSquare className="h-5 w-5 text-amber-600" />;
      case 'buddy-request':
        return <Users className="h-5 w-5 text-teal-600" />;
      case 'event-update':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'guide-update':
        return <BookOpen className="h-5 w-5 text-purple-600" />;
      default:
        return <Info className="h-5 w-5 text-teal-600" />;
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="h-7 w-7 text-teal-600" /> Notifications & Alerts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stay up to date with task deadlines, buddy invitations, and campus event changes.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            className="text-xs text-teal-700 border-teal-200 hover:bg-teal-50 cursor-pointer w-fit"
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            {markingAll ? 'Updating...' : 'Mark all as read'}
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnreadOnly(false)}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              !unreadOnly
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              unreadOnly
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Unread Only
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-teal-500 text-white text-[10px] font-bold">
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
            <Card key={i} className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((item) => {
            const isUnread = !item.readAt;
            const actionLink = getActionLink(item);

            return (
              <Card
                key={item._id}
                className={`border transition-all hover:shadow-md ${
                  isUnread
                    ? 'border-teal-200 bg-teal-50/20'
                    : 'border-slate-200 bg-white opacity-85'
                }`}
              >
                <CardContent className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnread ? 'bg-teal-100/80 shadow-sm' : 'bg-slate-100'
                      }`}
                    >
                      {getIcon(item.type)}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm ${
                            isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                          }`}
                        >
                          {item.title}
                        </h3>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>
                          {item.createdAt
                            ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                            : 'Recently'}
                        </span>

                        {actionLink && (
                          <>
                            <span>•</span>
                            <Link
                              href={actionLink}
                              className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-0.5"
                            >
                              View Details <ExternalLink className="h-3 w-3" />
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
                      className="text-xs text-slate-500 hover:text-teal-700 h-8 shrink-0 cursor-pointer"
                    >
                      Mark read
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 max-w-md mx-auto">
          <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            {unreadOnly ? 'No unread notifications' : 'No notifications'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {unreadOnly
              ? 'You have caught up with all your updates!'
              : 'Important announcements and reminders will appear here.'}
          </p>
          {unreadOnly && (
            <Button
              variant="outline"
              onClick={() => setUnreadOnly(false)}
              className="mt-4 text-xs"
            >
              View All Notifications
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
