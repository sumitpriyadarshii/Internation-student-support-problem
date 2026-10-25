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
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Heart,
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
    <div className="min-h-screen bg-[#090a0f] text-[#f7f5f0] flex flex-col md:flex-row antialiased selection:bg-amber-500 selection:text-white">
      {/* Subtle Warm ambient glow */}
      <div className="fixed top-0 left-64 w-[600px] h-[350px] bg-amber-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-rose-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed inset-0 bg-grid-warm opacity-25 pointer-events-none -z-10" />

      {/* DESKTOP SIDEBAR: Apple-grade frosted glass */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-black/40 border-r border-white/[0.08] backdrop-blur-3xl saturate-180 h-screen sticky top-0 z-40">
        {/* Brand header */}
        <div className="p-6 border-b border-white/[0.08]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-all">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-amber-200 transition-colors">
                Far From <span className="text-gradient-sunset">Home</span>
              </span>
              <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
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
                className={`relative flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-stone-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="absolute inset-0 rounded-2xl bg-white/12 border border-white/20 shadow-sm"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={`relative z-10 w-4 h-4 transition-colors ${
                    isActive ? 'text-amber-400' : 'text-stone-400 group-hover:text-white'
                  }`}
                />
                <span className="relative z-10">{item.name}</span>

                {/* Notification Badge */}
                {item.href === '/notifications' && unreadCount > 0 && (
                  <span className="relative z-10 ml-auto px-2 py-0.5 text-[10px] font-black rounded-full bg-rose-500 text-white shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-white/[0.08]">
          <div className="flex items-center justify-between p-2.5 rounded-2xl ios-glass border border-white/10">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm">
                {getInitials(session?.user?.name)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">
                  {session?.user?.name || 'Student'}
                </p>
                <p className="text-[10px] text-stone-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR: Apple Frosted Island style */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 bg-black/40 border-b border-white/[0.08] backdrop-blur-3xl saturate-180">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-full bg-white/10 border border-white/10 text-stone-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-white">Far From Home</span>
          </div>

          {/* Quick search input */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center relative max-w-md w-full"
          >
            <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search guides, packing checklists, banking, senior peers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white/[0.05] border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </form>

          {/* Right Header items */}
          <div className="flex items-center gap-3">
            {/* Notifications Button */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-colors"
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
                <button className="flex items-center gap-2 p-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-semibold text-white focus:outline-none cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {getInitials(session?.user?.name)}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate">
                    {session?.user?.name || 'Student'}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-stone-950/90 border-white/15 backdrop-blur-3xl text-stone-200 rounded-2xl"
              >
                <DropdownMenuLabel className="text-xs text-white">
                  Signed in as
                  <span className="block font-normal text-stone-400 truncate">
                    {session?.user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer text-xs">
                    <User className="w-3.5 h-3.5 mr-2 text-amber-400" />
                    My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer text-xs">
                    <Settings className="w-3.5 h-3.5 mr-2 text-orange-400" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                {session?.user?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link
                      href="/admin"
                      className="cursor-pointer text-xs text-rose-300 focus:text-rose-200"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-2 text-rose-400" />
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
                className="fixed inset-0 bg-black/75 backdrop-blur-md"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative flex flex-col w-72 bg-stone-950/95 border-r border-white/10 h-full p-6 z-10 backdrop-blur-3xl"
              >
                <div className="flex items-center justify-between pb-6 border-b border-white/10">
                  <span className="font-bold text-white text-base">Navigation</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full text-stone-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 py-4 space-y-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-stone-300 hover:bg-white/5 hover:text-white"
                    >
                      <item.icon className="w-4 h-4 text-amber-400" />
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
