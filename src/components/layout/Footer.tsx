"use client";

import React from 'react';
import Link from 'next/link';
import { Compass, Heart, Shield, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-[#08090d] text-stone-400 border-t border-white/[0.08] relative overflow-hidden">
      {/* Subtle warm sunset glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] bg-gradient-to-t from-amber-600/10 via-rose-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Far From <span className="text-gradient-sunset">Home</span>
              </span>
            </Link>

            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Your new home starts here. The thoughtful support ecosystem for international scholars — relocation checklists, verified guides, senior peer mentors, and global communities.
            </p>

            <div className="space-y-2 text-xs text-stone-400 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Supporting students across 50+ universities worldwide</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 shrink-0" />
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Explore
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/features" className="hover:text-amber-400 transition-colors">
                  Personalized Guides
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-amber-400 transition-colors">
                  Relocation Checklist
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-amber-400 transition-colors">
                  Peer Buddy Matching
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-amber-400 transition-colors">
                  Community Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  Our Mission & Story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  Support & Help Center
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-amber-400 transition-colors">
                  Create Student Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-200">
              Trust & Safety
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-amber-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-400 transition-colors">
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
        <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {currentYear} Far From Home. Built with heart for international students.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-stone-400">Global Peer Network Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
