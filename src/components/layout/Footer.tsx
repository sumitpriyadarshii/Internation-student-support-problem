"use client";

import React from 'react';
import Link from 'next/link';
import { Globe2, Heart, Shield, Mail, MapPin, Sparkles, ArrowRight } from 'lucide-react';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-[#050811] text-slate-400 border-t border-white/[0.08] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-t from-indigo-600/10 via-violet-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
                <Globe2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Far From <span className="text-gradient-aurora">Home</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Your new home starts here. The complete ecosystem for international students — personalized relocation roadmaps, smart checklists, senior peer mentors, and global communities.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Active in 50+ universities across US, UK, Canada, Australia & Europe</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <a
                  href="mailto:support@farfromhome.org"
                  className="hover:text-white transition-colors"
                >
                  support@farfromhome.org
                </a>
              </div>
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="hover:text-indigo-400 transition-colors">
                  Personalized Guides
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-indigo-400 transition-colors">
                  Relocation Checklist
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-indigo-400 transition-colors">
                  Buddy Match Algorithm
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-indigo-400 transition-colors">
                  Community Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-indigo-400 transition-colors">
                  About Far From Home
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-indigo-400 transition-colors">
                  Support & Help Center
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-indigo-400 transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-400 transition-colors">
                  Create Student Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Trust & Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-xs text-emerald-400 pt-2 font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Peer Network</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} Far From Home. Built for global students with care.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">Systems Operational • Worldwide Network Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
