import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Far From Home',
  description:
    'Read our Privacy Policy to understand how Far From Home collects, protects, and respects your personal data as an international student.',
};

export default function PrivacyPage() {
  const lastUpdated = 'October 18, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0a09] text-stone-100">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* HEADER */}
        <section className="relative py-14 sm:py-20 overflow-hidden border-b border-white/[0.08]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-warm opacity-40 pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20">
              Legal & Trust
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
              Privacy <span className="text-gradient-sunset">Policy</span>
            </h1>
            <p className="mt-3 text-sm text-stone-400">
              Last updated on {lastUpdated}
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-10 text-stone-300 leading-relaxed text-sm sm:text-base">
            {/* Highlights Box */}
            <div className="p-6 sm:p-8 rounded-3xl ios-glass border border-amber-500/30 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Our Student Privacy Commitments
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  We do NOT sell student data or personal contact records to third-party advertisers.
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  You choose your public directory visibility and whether your profile is searchable.
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Passphrases are salted and hashed with modern industry-standard bcrypt encryption.
                </li>
              </ul>
            </div>

            {/* Section 1 */}
            <section className="space-y-3 p-6 sm:p-8 rounded-3xl ios-glass-prominent border border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                1. Information We Collect
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                To tailor relocation roadmaps to your university, we collect your display name, email address, country of origin, destination country, destination city, enrolled institution, arrival date, and preferred languages. When connecting with senior peer buddies, messages and connection statuses are stored securely to support your experience.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3 p-6 sm:p-8 rounded-3xl ios-glass-prominent border border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-400" />
                2. How We Protect Your Information
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                We implement stringent security controls: automatic session timeout after 15 minutes of inactivity, IP rate limiting against brute-force attacks, and automatic account lockout after 5 consecutive incorrect password attempts. All communications occur over encrypted TLS connections.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3 p-6 sm:p-8 rounded-3xl ios-glass-prominent border border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-rose-400" />
                3. Your Privacy Controls & Right to Deletion
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                You can toggle your visibility in the Buddy Directory at any time in your Account Settings. Furthermore, you can deactivate your account and purge your personal records from our servers with one click using the Danger Zone in your settings dashboard.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
