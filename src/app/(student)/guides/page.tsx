'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
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
            toast.success('Guide bookmarked');
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
    <div className="space-y-6 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-teal-600" /> Essential Student Guides
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Practical survival guides, verified legal checklists, and campus advice.
          </p>
        </div>

        {/* Tab switcher: All Guides vs Bookmarks */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val as 'all' | 'bookmarks');
            setPage(1);
          }}
          className="w-auto"
        >
          <TabsList className="bg-slate-200/80 p-1">
            <TabsTrigger value="all" className="text-xs sm:text-sm cursor-pointer">
              All Guides
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="text-xs sm:text-sm cursor-pointer flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-teal-600" />
              My Bookmarks
              {bookmarkedIds.size > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                  {bookmarkedIds.size}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search guides by title, keywords, or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </form>

          {/* Country Filter */}
          <div className="w-full md:w-56 shrink-0">
            <Select
              value={selectedCountry}
              onValueChange={(val) => {
                setSelectedCountry(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <Globe className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country === 'all' ? 'All Countries' : country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 ml-1 mr-1" />
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      ) : guides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => {
            const isBookmarked = bookmarkedIds.has(guide._id);
            return (
              <Card
                key={guide._id}
                className="border-slate-200 hover:border-teal-500 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="capitalize text-xs font-semibold bg-slate-100 text-slate-700">
                      {guide.category.replace('-', ' ')}
                    </Badge>

                    <div className="flex items-center gap-1">
                      {/* Verification Badge */}
                      {guide.verificationStatus === 'verified' ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : guide.verificationStatus === 'outdated' ? (
                        <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="h-3.5 w-3.5" /> Outdated
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          <HelpCircle className="h-3.5 w-3.5" /> Community
                        </span>
                      )}

                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => toggleBookmark(e, guide._id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Guide'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="h-4 w-4 fill-teal-600" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Link href={`/guides/${guide._id}`} className="block">
                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                      {guide.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                      {guide.summary}
                    </CardDescription>
                  </Link>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  {/* Country & Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {(guide.applicableCountries || []).slice(0, 3).map((country) => (
                      <span
                        key={country}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium border border-teal-100"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {guide.createdAt ? format(new Date(guide.createdAt), 'MMM d, yyyy') : 'Recent'}
                  </span>
                  <Link
                    href={`/guides/${guide._id}`}
                    className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    View Guide &rarr;
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 max-w-lg mx-auto">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">
            {activeTab === 'bookmarks' ? 'No bookmarked guides yet' : 'No guides found'}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {activeTab === 'bookmarks'
              ? 'Click the bookmark icon on any guide card to save it for quick offline reference.'
              : 'Try clearing your search terms or picking another category filter.'}
          </p>
          {activeTab === 'bookmarks' ? (
            <Button
              onClick={() => setActiveTab('all')}
              className="mt-4 bg-teal-600 hover:bg-teal-500 text-white text-xs cursor-pointer"
            >
              Browse All Guides
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedCountry('all');
              }}
              className="mt-4 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} guides
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 text-xs cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="text-xs font-semibold px-2 text-slate-700">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 text-xs cursor-pointer"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
