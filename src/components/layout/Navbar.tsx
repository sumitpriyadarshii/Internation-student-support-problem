'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Globe,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Features', href: '/features' },
  { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const user = session?.user;

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-200">
              <Globe className="w-6 h-6 text-slate-950 stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                Far From <span className="text-teal-400">Home</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase font-medium">
                International Support
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-teal-400 bg-slate-800/80 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions (Auth / User menu) */}
          <div className="hidden md:flex items-center gap-3">
            {status === 'loading' ? (
              <div className="w-24 h-9 bg-slate-800 animate-pulse rounded-lg" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-all"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-400" />
                  Dashboard
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-sm font-medium text-slate-200 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
                    aria-expanded={userDropdownOpen}
                  >
                    <div className="w-7 h-7 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-semibold text-xs border border-teal-500/30">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="max-w-[120px] truncate text-slate-200 text-xs font-medium">
                      {user?.name || 'My Account'}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        userDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-slate-200 divide-y divide-slate-800">
                      <div className="px-4 py-2.5">
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user?.email}
                        </p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {user?.role || 'Student'}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-teal-400" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          <User className="w-4 h-4 text-teal-400" />
                          My Profile
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg shadow-sm shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 px-4 pt-3 pb-6 space-y-3">
          <nav className="space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'text-teal-400 bg-slate-800 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-slate-800">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-slate-800/60 rounded-lg">
                  <p className="text-sm font-semibold text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-teal-500/10 text-teal-300">
                    {user?.role || 'Student'}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-400" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
                >
                  <User className="w-4 h-4 text-teal-400" />
                  My Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  className="w-full text-center py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="w-full text-center py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
