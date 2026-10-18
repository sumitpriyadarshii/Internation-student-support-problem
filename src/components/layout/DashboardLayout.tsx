'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
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
  { name: 'Guides', href: '/guides', icon: BookOpen },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Buddies', href: '/buddies', icon: Users },
  { name: 'Community', href: '/community', icon: Calendar },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
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
        // Silently ignore network failures for notification badge polling
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

  const userName = session?.user?.name || 'Student';
  const userEmail = session?.user?.email || '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-900 text-white px-4 py-3 border-b border-slate-800 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <Compass className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Far From Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/notifications" className="relative p-2 text-slate-300 hover:text-white">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-300 hover:text-white hover:bg-slate-800 p-2"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } h-screen`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo / Brand */}
          <div className="px-6 py-6 border-b border-slate-800/80 hidden md:block">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/30 group-hover:scale-105 transition-transform">
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white leading-tight">Far From Home</h1>
                <p className="text-xs text-teal-400 font-medium">Student Companion</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-white text-teal-700' : 'bg-teal-500 text-white'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90">
          <div className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-800/50">
            <Link href="/profile" className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-90">
              <Avatar className="h-9 w-9 border border-slate-700">
                <AvatarFallback className="bg-teal-700 text-white text-xs font-bold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-slate-400 truncate">{userEmail}</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-slate-400 hover:text-red-400 hover:bg-slate-800 h-8 w-8 cursor-pointer"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar for Desktop */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-slate-200 px-8 py-3.5 sticky top-0 z-30">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides, campus tips, resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
          </form>

          {/* Right Top Bar Utilities */}
          <div className="flex items-center gap-4">
            {/* Notifications Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left focus:outline-none cursor-pointer">
                  <Avatar className="h-8 w-8 border border-slate-200">
                    <AvatarFallback className="bg-teal-600 text-white text-xs font-semibold">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-slate-800 leading-none">{userName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Student</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-medium text-slate-900">{userName}</p>
                  <p className="text-xs text-slate-500 font-normal truncate">{userEmail}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4 text-slate-500" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/notifications')}>
                  <Bell className="mr-2 h-4 w-4 text-slate-500" />
                  <span>Notifications</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
