'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Share2,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface GuideDetail {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  applicableCountries?: string[];
  applicableRegions?: string[];
  tags?: string[];
  sourceUrl?: string;
  verificationStatus: 'verified' | 'unverified' | 'outdated';
  lastVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskItem {
  _id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
}

export default function GuideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [guide, setGuide] = useState<GuideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [relatedTasks, setRelatedTasks] = useState<TaskItem[]>([]);
  const [creatingTask, setCreatingTask] = useState(false);

  useEffect(() => {
    async function loadGuide() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/guides/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setGuide(json.data);

            // Check bookmark status
            const bRes = await fetch('/api/guides/bookmarks');
            if (bRes.ok) {
              const bJson = await bRes.json();
              if (bJson.success && Array.isArray(bJson.data)) {
                const bookmarked = bJson.data.some(
                  (item: any) => item.guide?._id === json.data._id
                );
                setIsBookmarked(bookmarked);
              }
            }

            // Check related tasks
            const tRes = await fetch('/api/tasks');
            if (tRes.ok) {
              const tJson = await tRes.json();
              if (tJson.success && Array.isArray(tJson.data)) {
                const matched = tJson.data.filter(
                  (t: any) =>
                    t.relatedGuideId?._id === json.data._id ||
                    t.relatedGuideId === json.data._id
                );
                setRelatedTasks(matched);
              }
            }
          } else {
            toast.error('Guide not found');
          }
        } else {
          toast.error('Failed to load guide details');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error loading guide');
      } finally {
        setLoading(false);
      }
    }

    loadGuide();
  }, [id]);

  const toggleBookmark = async () => {
    if (!guide) return;
    try {
      const res = await fetch('/api/guides/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId: guide._id }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setIsBookmarked(json.data.bookmarked);
        if (json.data.bookmarked) {
          toast.success('Guide bookmarked');
        } else {
          toast.info('Bookmark removed');
        }
      }
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleAddRelatedTask = async () => {
    if (!guide) return;
    setCreatingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Action: ${guide.title}`,
          description: `Follow up steps from guide: ${guide.title}`,
          category: guide.category || 'personal',
          priority: 'medium',
          status: 'not-started',
          relatedGuideId: guide._id,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Task created and linked to this guide!');
        setRelatedTasks((prev) => [...prev, json.data]);
      } else {
        throw new Error(json.error || 'Failed to create task');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error adding task');
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Guide not found</h2>
        <p className="text-sm text-slate-500 mt-1">
          This guide may have been archived or removed.
        </p>
        <Button onClick={() => router.push('/guides')} className="mt-4 bg-teal-600 text-white">
          Back to Guides
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/dashboard" className="hover:text-teal-600">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-teal-600">
            Guides
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{guide.title}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="text-xs text-slate-600 hover:text-slate-900 border-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
        </Button>
      </div>

      {/* Guide Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="capitalize text-xs font-semibold bg-teal-50 text-teal-800 border-teal-100">
              {guide.category.replace('-', ' ')}
            </Badge>

            {guide.verificationStatus === 'verified' && (
              <span className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="h-4 w-4" /> Verified Guide
              </span>
            )}
            {guide.verificationStatus === 'outdated' && (
              <span className="flex items-center gap-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertTriangle className="h-4 w-4" /> Policy Pending Update
              </span>
            )}
          </div>

          {/* Action Buttons: Bookmark & Share */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleBookmark}
              className={`text-xs gap-1.5 cursor-pointer ${
                isBookmarked
                  ? 'border-teal-500 text-teal-600 bg-teal-50 hover:bg-teal-100'
                  : 'text-slate-600'
              }`}
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="h-4 w-4 fill-teal-600" /> Bookmarked
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" /> Bookmark
                </>
              )}
            </Button>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
          {guide.title}
        </h1>

        <p className="text-base text-slate-600 leading-relaxed border-l-4 border-teal-500 pl-4 py-1 bg-slate-50/50 rounded-r-lg">
          {guide.summary}
        </p>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Published: {guide.createdAt ? format(new Date(guide.createdAt), 'MMMM d, yyyy') : 'Recent'}
          </span>
          {guide.lastVerifiedAt && (
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified on: {format(new Date(guide.lastVerifiedAt), 'MMMM d, yyyy')}
            </span>
          )}
          {guide.sourceUrl && (
            <a
              href={guide.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 hover:text-teal-700 flex items-center gap-1 font-semibold ml-auto"
            >
              Official Source Link <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Guide Content Display */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed space-y-4">
          {/* Split paragraphs cleanly */}
          {guide.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('# ')) {
              return (
                <h2 key={index} className="text-xl font-bold text-slate-900 pt-4 pb-2 border-b border-slate-100">
                  {trimmed.replace('# ', '')}
                </h2>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h3 key={index} className="text-lg font-bold text-slate-900 pt-3">
                  {trimmed.replace('## ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h4 key={index} className="text-base font-semibold text-slate-800 pt-2">
                  {trimmed.replace('### ', '')}
                </h4>
              );
            }
            if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
              return (
                <ul key={index} className="list-disc pl-5 space-y-1.5 my-2">
                  {trimmed.split('\n').map((li, liIndex) => (
                    <li key={liIndex} className="text-sm text-slate-700">
                      {li.replace(/^[-*]\s+/, '')}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="text-sm md:text-base text-slate-700 leading-relaxed">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Tags footer */}
        {guide.tags && guide.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Keywords:
            </span>
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Related Tasks Section */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-teal-600" /> Actionable Checklist
            </CardTitle>
            <CardDescription>
              Tasks you have scheduled or can add related to this handbook
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={handleAddRelatedTask}
            disabled={creatingTask}
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {creatingTask ? 'Adding...' : 'Add Related Task'}
          </Button>
        </CardHeader>
        <CardContent>
          {relatedTasks.length > 0 ? (
            <div className="space-y-2.5">
              {relatedTasks.map((task) => (
                <Link
                  key={task._id}
                  href={`/tasks/${task._id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                    </div>
                    <span className="text-sm font-medium text-slate-800">{task.title}</span>
                  </div>
                  <Badge variant={task.status === 'completed' ? 'success' : 'secondary'} className="capitalize text-xs">
                    {task.status.replace('-', ' ')}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 mb-2">No personal tasks linked to this guide yet.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddRelatedTask}
                disabled={creatingTask}
                className="text-xs border-slate-300 text-slate-700 hover:bg-white"
              >
                Create reminder from this guide
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
