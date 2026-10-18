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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* HEADER */}
        <section className="relative py-14 sm:py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
              User Agreement
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Terms of Use
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Last updated on {lastUpdated}
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-invert max-w-none space-y-10 text-slate-300 leading-relaxed text-sm sm:text-base">
            {/* Legal Disclaimer Alert */}
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <h3 className="text-base font-bold flex items-center gap-2 text-amber-300">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                Informational Disclaimer Regarding Immigration & Visas
              </h3>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                The guides, checklists, and student peer mentorship provided on Far From Home are for informational and peer-assistance purposes only. Far From Home does NOT provide certified legal immigration advice. Always verify visa criteria directly with official embassy portals and your host university&apos;s licensed international student advisers.
              </p>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-teal-400" />
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, browsing guides, or participating in the buddy mentorship program on Far From Home (&ldquo;the Platform&rdquo;), you agree to comply with and be legally bound by these Terms of Use and our Privacy Policy. If you do not accept these terms, you must discontinue using the platform immediately.
              </p>
            </section>

            {/* Section 2 */}
            <section id="conduct" className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Scale className="w-5 h-5 text-teal-400" />
                2. Student & Mentor Code of Conduct
              </h2>
              <p>
                Far From Home is a safe, empathetic community for scholars around the world. We enforce a zero-tolerance policy for:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-400 text-sm">
                <li>Harassment, hate speech, bullying, discrimination, or abusive conduct based on race, nationality, religion, sexual orientation, or gender.</li>
                <li>Fraudulent housing schemes, predatory sublet advertising, or unverified financial solicitations.</li>
                <li>Impersonating university staff, immigration officials, or embassy personnel.</li>
                <li>Posting malicious code, phishing links, or unsolicited advertising and spam.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                3. Account Registration & Security
              </h2>
              <p>
                You must provide accurate, current, and complete information during registration. You are solely responsible for maintaining the confidentiality of your password and credentials. You agree to notify Far From Home immediately upon discovering any unauthorized access to your account.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                4. Intellectual Property Rights
              </h2>
              <p>
                All editorial content, system software, logos, trademarks, database schema, design assets, and checklist algorithms are the exclusive property of Far From Home or its content licensors. You may not reproduce, redistribute, scrape, or reverse engineer any part of the service without written permission.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                5. Account Suspension & Termination
              </h2>
              <p>
                We reserve the right, at our sole discretion, to suspend or terminate any user account without prior notice if we find evidence of fraudulent activities, abusive behavior towards fellow students, or violations of these Terms of Use.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                6. Limitation of Liability
              </h2>
              <p>
                In no event shall Far From Home, its founders, directors, or mentors be held liable for any direct, indirect, incidental, or consequential damages resulting from your inability to obtain visas, accommodation disputes with third-party landlords, or university admission outcomes.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-teal-400" />
                7. Questions & Contact Information
              </h2>
              <p>
                For questions regarding these Terms of Use, please reach out to our legal compliance desk at{' '}
                <a
                  href="mailto:legal@farfromhome.org"
                  className="text-teal-400 hover:underline font-medium"
                >
                  legal@farfromhome.org
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
