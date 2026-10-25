'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Sparkles,
  Compass,
  ArrowRight,
  ShieldCheck,
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
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const user = session?.user;

  // Track scroll position for header dynamics
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div
        className={`mx-auto max-w-7xl pointer-events-auto transition-all duration-300 rounded-2xl border ${
          scrolled
            ? 'bg-slate-950/85 backdrop-blur-2xl border-white/15 shadow-[0_12px_45px_rgba(0,0,0,0.6)] py-2.5 px-4 sm:px-6'
            : 'bg-slate-900/60 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)] py-3 px-4 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-xl"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-300">
                <Globe2 className="w-5 h-5 text-white animate-spin-slow" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950" />
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  Far From <span className="text-gradient-aurora">Home</span>
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Global
                </span>
              </div>
              <span className="text-[11px] text-slate-400 -mt-0.5 tracking-wide font-medium flex items-center gap-1">
                <span>International Student Platform</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-slate-950/40 p-1 rounded-xl border border-white/5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/25 to-violet-500/25 border border-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors ${
                      isActive
                        ? 'text-white font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all shadow-sm hover:scale-[1.02]"
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                  <span>Dashboard</span>
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 transition-all text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                      {user?.name ? user.name[0]?.toUpperCase() : 'U'}
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-2 text-slate-200 z-50 divide-y divide-white/10"
                      >
                        <div className="px-4 py-2.5">
                          <p className="text-xs font-bold text-white truncate">
                            {user?.name || 'Student'}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {user?.email}
                          </p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {user?.role?.toUpperCase() || 'STUDENT'}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                            <span>Student Dashboard</span>
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <User className="w-4 h-4 text-cyan-400" />
                            <span>My Profile & Preferences</span>
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-amber-400" />
                              <span>Admin Console</span>
                            </Link>
                          )}
                        </div>

                        <div className="pt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-shimmer relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-500 via-violet-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Join Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden pt-4 pb-2 border-t border-white/10 mt-3"
            >
              <div className="flex flex-col gap-1.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                      pathname === link.href
                        ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="pt-3 mt-2 border-t border-white/10 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Go to Dashboard</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-2 text-rose-400 font-semibold text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="w-full text-center py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-sm shadow-md"
                      >
                        Get Started Free
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
