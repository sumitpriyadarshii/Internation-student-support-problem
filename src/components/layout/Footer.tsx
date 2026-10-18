"use client";

import React from 'react';
import Link from 'next/link';
import { Globe, Heart, Shield, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="w-full bg-slate-950 text-slate-400 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info (2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/20">
                <Globe className="w-5 h-5 text-slate-950 stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Far From <span className="text-teal-400">Home</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Your new home starts here. We empower international scholars
              worldwide with verified roadmaps, relocation checklists, senior
              buddy matching, and warm community support.
            </p>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Supporting students across 50+ countries globally</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <a
                  href="mailto:support@farfromhome.org"
                  className="hover:text-teal-400 transition-colors"
                >
                  support@farfromhome.org
                </a>
              </div>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/features"
                  className="hover:text-teal-400 transition-colors"
                >
                  Personalised Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/features#tasks"
                  className="hover:text-teal-400 transition-colors"
                >
                  Task Tracking
                </Link>
              </li>
              <li>
                <Link
                  href="/features#buddies"
                  className="hover:text-teal-400 transition-colors"
                >
                  Buddy Matching
                </Link>
              </li>
              <li>
                <Link
                  href="/features#events"
                  className="hover:text-teal-400 transition-colors"
                >
                  Community Events
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 text-teal-400 font-medium hover:text-teal-300 transition-colors"
                >
                  Join Free Today →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-teal-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/about#values"
                  className="hover:text-teal-400 transition-colors"
                >
                  Our Values
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-teal-400 transition-colors"
                >
                  Help & FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-teal-400 transition-colors"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  href="/about#team"
                  className="hover:text-teal-400 transition-colors"
                >
                  Leadership Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-teal-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy#security"
                  className="hover:text-teal-400 transition-colors"
                >
                  Data Security
                </Link>
              </li>
              <li>
                <Link
                  href="/terms#conduct"
                  className="hover:text-teal-400 transition-colors"
                >
                  Community Guidelines
                </Link>
              </li>
              <li>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Verified Safe Platform</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} Far From Home. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for international students worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
