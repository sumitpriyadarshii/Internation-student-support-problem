import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FileCheck, ShieldAlert, Scale, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Terms of Use - Far From Home',
  description:
    'Review the Terms of Use and Community Guidelines governing access to the Far From Home international student platform.',
};

export default function TermsPage() {
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
              User Agreement
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
              Terms of <span className="text-gradient-sunset">Use</span>
            </h1>
            <p className="mt-3 text-sm text-stone-400">
              Last updated on {lastUpdated}
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-10 text-stone-300 leading-relaxed text-sm sm:text-base">
            {/* Legal Disclaimer Alert */}
            <div className="p-6 rounded-3xl ios-glass border border-amber-500/30 text-amber-200 space-y-2">
              <h3 className="text-base font-bold flex items-center gap-2 text-amber-300">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                Informational Disclaimer Regarding Immigration & Visas
              </h3>
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                The guides, checklists, and student peer mentorship provided on Far From Home are for informational and peer-assistance purposes only. Far From Home does NOT provide certified legal immigration advice. Always verify visa criteria directly with official embassy portals and your host university&apos;s licensed international student advisers.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3 p-6 sm:p-8 rounded-3xl ios-glass-prominent border border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                1. Acceptance of Terms
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                By creating an account, browsing destination guides, or connecting with peer mentors on Far From Home, you agree to comply with and be bound by these Terms of Use and our Community Guidelines. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3 p-6 sm:p-8 rounded-3xl ios-glass-prominent border border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-orange-400" />
                2. User Eligibility & Student Accounts
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Far From Home is intended for prospective, incoming, and currently enrolled international higher education students, exchange scholars, and university peer mentors. You agree to provide accurate, truthful personal and academic information during registration. You are responsible for safeguarding your login credentials.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3 p-6 sm:p-8 rounded-3xl ios-glass-prominent border border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-rose-400" />
                3. Peer Mentorship & Community Safety
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Our Buddy Matching network is built on trust, respect, and mutual safety. Users must never solicit funds, engage in harassment, share unverified financial schemes, or attempt fraudulent academic assistance. Any violation will result in immediate account suspension and notification to campus authorities if necessary.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3 p-6 sm:p-8 rounded-3xl ios-glass-prominent border border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                4. Intellectual Property & User Contributions
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                All platform content, including relocation roadmap templates, verification seals, algorithms, and design interfaces, are owned by Far From Home. Feedback, reviews, and community guide tips submitted by students remain your property, but grant us a royalty-free license to display them to fellow scholars.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
