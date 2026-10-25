'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
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
  { id: 'healthcare-emergency', label: 'Healthcare & Safety' },
  { id: 'food-groceries', label: 'Food & Groceries' },
  { id: 'local-culture-language', label: 'Culture & Etiquette' },
];

const COUNTRIES = [
  'all',
  'Australia',
  'Canada',
  'China',
  'France',
  'Germany',
  'India',
  'Ireland',
  'Japan',
  'New Zealand',
  'Singapore',
  'United Kingdom',
  'United States',
];

interface GuideItem {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  applicableCountries?: string[];
  tags?: string[];
  verificationStatus: 'verified' | 'unverified' | 'outdated';
  createdAt: string;
  lastVerifiedAt?: string;
}

export default function GuidesPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks'>('all');
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(9);

  const [guides, setGuides] = useState<GuideItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Set of bookmarked guide IDs
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Fetch bookmarks
  const fetchBookmarks = useCallback(async () => {
    try {
      const res = await fetch('/api/guides/bookmarks');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const ids = new Set<string>();
          json.data.forEach((item: any) => {
            if (item.guide?._id) ids.add(item.guide._id);
          });
          setBookmarkedIds(ids);
          return json.data;
        }
      }
    } catch {
      // Ignore error
    }
    return [];
  }, []);

  // Fetch guides based on tab and filters
  const fetchGuides = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'bookmarks') {
        const bookmarksData = await fetchBookmarks();
        let items: GuideItem[] = bookmarksData.map((b: any) => b.guide).filter(Boolean);

        // Client filter for bookmarks
        if (search.trim()) {
          const q = search.toLowerCase();
          items = items.filter(
            (g) =>
              g.title.toLowerCase().includes(q) ||
              g.summary.toLowerCase().includes(q) ||
              g.tags?.some((t: string) => t.toLowerCase().includes(q))
          );
        }
        if (selectedCategory !== 'all') {
          items = items.filter((g) => g.category === selectedCategory);
        }
        if (selectedCountry !== 'all') {
          items = items.filter((g) => g.applicableCountries?.includes(selectedCountry));
        }

        setTotalCount(items.length);
        setTotalPages(Math.max(1, Math.ceil(items.length / limit)));
        const start = (page - 1) * limit;
        setGuides(items.slice(start, start + limit));
      } else {
        const queryParams = new URLSearchParams();
        queryParams.set('page', page.toString());
        queryParams.set('limit', limit.toString());
        if (search.trim()) queryParams.set('q', search.trim());
        if (selectedCategory !== 'all') queryParams.set('category', selectedCategory);
        if (selectedCountry !== 'all') queryParams.set('country', selectedCountry);

        const res = await fetch(`/api/guides?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setGuides(json.data.items || []);
            setTotalCount(json.data.total || 0);
            setTotalPages(json.data.totalPages || 1);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch guides', err);
      toast.error('Unable to load guides');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, selectedCategory, selectedCountry, page, limit, fetchBookmarks]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  useEffect(() => {
    fetchGuides();
  }, [fetchGuides]);

  // Handle bookmark toggle
  const toggleBookmark = async (e: React.MouseEvent, guideId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch('/api/guides/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guideId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setBookmarkedIds((prev) => {
          const updated = new Set(prev);
          if (json.data.bookmarked) {
            updated.add(guideId);
            toast.success('Guide saved to your bookmarks! 🔖');
          } else {
            updated.delete(guideId);
            toast.info('Bookmark removed');
          }
          return updated;
        });

        if (activeTab === 'bookmarks') {
          fetchGuides();
        }
      } else {
        throw new Error(json.error || 'Failed to toggle bookmark');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error toggling bookmark');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGuides();
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="h-7 w-7 text-indigo-400" />
            <span>Relocation Handbooks</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Practical survival guides, verified legal checklists, and city housing tips.
          </p>
        </div>

        {/* Tab switcher: All Guides vs Bookmarks */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/80 border border-white/10 w-fit">
          <button
            onClick={() => {
              setActiveTab('all');
              setPage(1);
            }}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeTab === 'all' && (
              <motion.div
                layoutId="guideTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">All Guides ({totalCount})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('bookmarks');
              setPage(1);
            }}
            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bookmarks' ? 'text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {activeTab === 'bookmarks' && (
              <motion.div
                layoutId="guideTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
              <span>Saved Bookmarks</span>
              {bookmarkedIds.size > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-black text-[10px]">
                  {bookmarkedIds.size}
                </span>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center gap-3"
      >
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search guides (e.g. SIN number, Monzo bank, NHS GP, lease)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-950/60 border-white/10 text-white text-xs rounded-xl"
          />
        </div>

        {/* Category */}
        <div className="w-full md:w-52">
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="bg-slate-950/60 border-white/10 text-white text-xs rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-white/15 text-white">
              {CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div className="w-full md:w-44">
          <Select
            value={selectedCountry}
            onValueChange={(val) => {
              setSelectedCountry(val);
              setPage(1);
            }}
          >
            <SelectTrigger className="bg-slate-950/60 border-white/10 text-white text-xs rounded-xl">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 border-white/15 text-white">
              {COUNTRIES.map((cty) => (
                <SelectItem key={cty} value={cty} className="text-xs">
                  {cty === 'all' ? 'All Countries' : cty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shrink-0"
        >
          Search
        </Button>
      </form>

      {/* Guides Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-panel h-60 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : guides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {guides.map((guide) => {
            const isBookmarked = bookmarkedIds.has(guide._id);
            return (
              <motion.div
                key={guide._id}
                whileHover={{ y: -4 }}
                className="glass-panel glass-card-specular rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 transition-all duration-300 relative group"
              >
                <div>
                  {/* Category and Bookmark button */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                      {guide.category.replace('-', ' ')}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => toggleBookmark(e, guide._id)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/10 hover:bg-white/10'
                      }`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this guide'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* Title */}
                  <Link href={`/guides/${guide._id}`} className="block">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                      {guide.title}
                    </h3>
                  </Link>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {guide.summary}
                  </p>

                  {/* Tags */}
                  {guide.tags && guide.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {guide.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer metadata */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="truncate max-w-[120px]">
                      {guide.applicableCountries?.join(', ') || 'Global'}
                    </span>
                  </div>

                  <Link
                    href={`/guides/${guide._id}`}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Read Handbook</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10 p-8">
          <BookOpen className="h-12 w-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Handbooks Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'bookmarks'
              ? 'You have not bookmarked any guides yet. Browse guides and click the bookmark ribbon!'
              : 'Try clearing your category or search query to find relevant guides.'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border-white/10 text-slate-300 hover:text-white rounded-xl text-xs"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <span className="text-xs text-slate-400 font-semibold px-3">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="border-white/10 text-slate-300 hover:text-white rounded-xl text-xs"
          >
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
