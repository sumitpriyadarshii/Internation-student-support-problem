'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Heart,
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

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
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
        className={`mx-auto max-w-6xl pointer-events-auto transition-all duration-300 rounded-full border ${
          scrolled
            ? 'bg-black/60 backdrop-blur-3xl saturate-150 border-white/15 shadow-[0_12px_45px_rgba(0,0,0,0.6)] py-2.5 px-4 sm:px-6'
            : 'bg-white/[0.04] backdrop-blur-2xl saturate-150 border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)] py-2.5 px-4 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo & Brand: Warm, humanistic home emblem */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none rounded-full"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-all duration-300">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-stone-950" />
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-white group-hover:text-amber-200 transition-colors">
                  Far From <span className="text-gradient-sunset">Home</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase rounded-full bg-white/10 text-stone-300 border border-white/10">
                  Global Family
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links: iOS Segmented Style */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border border-white/5">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 rounded-full bg-white/15 border border-white/20 shadow-sm"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span
                    className={`relative z-10 transition-colors ${
                      isActive
                        ? 'text-white font-semibold'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all shadow-sm hover:scale-[1.02]"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dashboard</span>
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full bg-white/[0.06] hover:bg-white/10 border border-white/10 transition-all text-white focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                      {user?.name ? user.name[0]?.toUpperCase() : 'U'}
                    </div>
                    <ChevronDown className="w-3 h-3 text-stone-400 mr-1" />
                  </button>

                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-stone-950/90 backdrop-blur-3xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6)] py-2 text-stone-200 z-50 divide-y divide-white/10"
                      >
                        <div className="px-4 py-2.5">
                          <p className="text-xs font-bold text-white truncate">
                            {user?.name || 'Student'}
                          </p>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">
                            {user?.email}
                          </p>
                          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {user?.role?.toUpperCase() || 'STUDENT'}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-400" />
                            <span>Student Dashboard</span>
                          </Link>
                          <Link
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            <User className="w-4 h-4 text-orange-400" />
                            <span>My Profile & Preferences</span>
                          </Link>
                          {user?.role === 'admin' && (
                            <Link
                              href="/admin"
                              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-rose-400" />
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
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-full text-xs font-medium text-stone-300 hover:text-white hover:bg-white/10 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-ios-primary inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-md hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-white/10 border border-white/10 text-stone-300 hover:text-white transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
              className="md:hidden pt-3 pb-2 border-t border-white/10 mt-2 px-2"
            >
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                      pathname === link.href
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                        : 'text-stone-300 hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}

                <div className="pt-2 mt-2 border-t border-white/10 flex flex-col gap-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-bold text-xs"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Go to Dashboard</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-1.5 text-rose-400 font-semibold text-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="w-full text-center py-2 rounded-xl bg-white/10 text-white font-semibold text-xs"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="w-full text-center py-2 rounded-xl btn-ios-primary text-white font-bold text-xs shadow-md"
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
