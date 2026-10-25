'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Users,
  Calendar,
  User,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Search,
  Compass,
  Globe2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Relocation Guides', href: '/guides', icon: BookOpen },
  { name: 'Task Checklist', href: '/tasks', icon: CheckSquare },
  { name: 'Buddy Network', href: '/buddies', icon: Users },
  { name: 'Community Events', href: '/community', icon: Calendar },
  { name: 'My Profile', href: '/profile', icon: User },
  { name: 'Account Settings', href: '/settings', icon: Settings },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile sidebar on route change during render
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Fetch unread notifications count
  useEffect(() => {
    let isMounted = true;
    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/notifications?unreadOnly=true&limit=1');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && typeof json.data?.unreadCount === 'number') {
            setUnreadCount(json.data.unreadCount);
          }
        }
      } catch {
        // Silently ignore
      }
    }

    if (session?.user?.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [session?.user?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/guides?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed top-0 left-64 w-[600px] h-[350px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-grid-cyber opacity-25 pointer-events-none -z-10" />

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-slate-950/80 border-r border-white/[0.08] backdrop-blur-2xl h-screen sticky top-0 z-40">
        {/* Brand header */}
        <div className="p-6 border-b border-white/[0.08]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-105 transition-all">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                Far From <span className="text-gradient-aurora">Home</span>
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Student Cockpit</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/30 via-violet-600/25 to-indigo-600/10 border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative z-10 w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span className="relative z-10">{item.name}</span>

                {/* Notification Badge */}
                {item.href === '/notifications' && unreadCount > 0 && (
                  <span className="relative z-10 ml-auto px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md">
                {getInitials(session?.user?.name)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {session?.user?.name || 'Student'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 bg-slate-950/70 border-b border-white/[0.08] backdrop-blur-2xl">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-black text-white">Far From Home</span>
          </div>

          {/* Quick search input */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center relative max-w-md w-full"
          >
            <Search className="absolute left-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search visa rules, SIM cards, roommates, checklists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </form>

          {/* Right Header items */}
          <div className="flex items-center gap-3">
            {/* Notifications Button */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl bg-slate-900/60 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Quick Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/60 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white focus:outline-none">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {getInitials(session?.user?.name)}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {session?.user?.name || 'Student'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-slate-950/95 border-white/10 backdrop-blur-2xl text-slate-200"
              >
                <DropdownMenuLabel className="text-xs text-white">
                  Signed in as
                  <span className="block font-normal text-slate-400 truncate">
                    {session?.user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer text-xs">
                    <User className="w-3.5 h-3.5 mr-2 text-cyan-400" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer text-xs">
                    <Settings className="w-3.5 h-3.5 mr-2 text-indigo-400" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                {session?.user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="cursor-pointer text-xs text-amber-300 focus:text-amber-200"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-2 text-amber-400" />
                      Admin Console
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-xs text-rose-400 focus:text-rose-300"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* MOBILE SIDEBAR MODAL */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative flex flex-col w-72 bg-slate-950 border-r border-white/10 h-full p-6 z-10"
              >
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <span className="font-bold text-white text-base">Navigation</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 py-4 space-y-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      <item.icon className="w-4 h-4 text-indigo-400" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 text-rose-400 font-bold text-xs"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MAIN BODY CHILDREN */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
