'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckSquare,
  Calendar,
  UserCheck,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Compass,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    exact: false,
  },
  {
    name: 'Guides',
    href: '/admin/guides',
    icon: BookOpen,
    exact: false,
  },
  {
    name: 'Task Templates',
    href: '/admin/templates',
    icon: CheckSquare,
    exact: false,
  },
  {
    name: 'Events',
    href: '/admin/events',
    icon: Calendar,
    exact: false,
  },
  {
    name: 'Buddy Management',
    href: '/admin/buddies',
    icon: UserCheck,
    exact: false,
  },
];

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <Compass className="w-6 h-6 text-teal-400 absolute" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">Verifying administrative access...</p>
      </div>
    );
  }

  // Check admin role
  const isAdmin = session?.user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl backdrop-blur">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            You do not have administrative privileges to access the Far From Home Admin Portal.
            If you believe this is an error, please contact the system administrator.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
              <Link href="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Student Portal
              </Link>
            </Button>
            <Button asChild className="bg-teal-600 hover:bg-teal-500 text-white">
              <Link href="/login">Sign In As Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const currentNav = navItems.find((item) => isActive(item)) || { name: 'Admin Control' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row antialiased selection:bg-teal-500 selection:text-white">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/20">
            FFH
          </div>
          <div>
            <span className="font-bold text-white text-base">Far From Home</span>
            <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5 border-teal-500/40 text-teal-300 bg-teal-950/50">
              ADMIN
            </Badge>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/25">
              <Compass className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                Far From Home
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Management
          </div>
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-600/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    active ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                  }`}
                />
                <span className="flex-1">{item.name}</span>
                {active && <ChevronRight className="w-4 h-4 text-teal-200" />}
              </Link>
            );
          })}
        </div>

        {/* Bottom Profile / Quick Links */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-teal-300 rounded-lg hover:bg-slate-800/60 transition"
          >
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              Switch to Student View
            </span>
            <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
              Student App
            </Badge>
          </Link>

          {/* User Info Bar */}
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="h-9 w-9 border border-teal-500/30">
                <AvatarFallback className="bg-slate-800 text-teal-300 font-semibold text-xs">
                  {session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {session?.user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-400 truncate leading-tight">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 rounded-lg"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto min-h-screen">
        {/* Top Navbar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Admin</span>
              <span>/</span>
              <span className="text-teal-400 font-medium">{currentNav.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Mode Active</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">{session?.user?.name}</span>
              <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-[10px]">
                Superadmin
              </Badge>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
        />
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
