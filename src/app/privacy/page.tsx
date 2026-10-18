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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* HEADER */}
        <section className="relative py-14 sm:py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
              Legal & Trust
            </span>
            <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Last updated on {lastUpdated}
            </p>
          </div>
        </section>

        {/* CONTENT */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-invert max-w-none space-y-10 text-slate-300 leading-relaxed text-sm sm:text-base">
            {/* Highlights Box */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-teal-500/30 space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-400" />
                Our Student Privacy Commitments
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  We do NOT sell student data or personal contact records to third-party advertisers.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  Passphrases are salted and cryptographically hashed with industry-standard bcrypt algorithms.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  You have full ownership of your profile and can request total account deletion at any time.
                </li>
              </ul>
            </div>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-teal-400" />
                1. Information We Collect
              </h2>
              <p>
                When you create an account or interact with Far From Home, we collect information required to personalize your relocation roadmaps and connect you with verified mentors:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-400 text-sm">
                <li>
                  <strong>Account Data:</strong> Full name, verified email address, and hashed password.
                </li>
                <li>
                  <strong>Student Journey Profile:</strong> Country of origin, destination country, target city, university or college, degree level, and planned arrival date.
                </li>
                <li>
                  <strong>Preferences & Interests:</strong> Spoken languages, hobbies, and specific support areas requested (such as housing advice, visa guidance, or bank setup).
                </li>
                <li>
                  <strong>Platform Usage:</strong> Completed checklist items, saved guide bookmarks, and feedback submissions.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-teal-400" />
                2. How We Use Your Information
              </h2>
              <p>We process your personal information strictly to operate and enhance our student platform:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-400 text-sm">
                <li>Filtering and displaying accurate city-specific guides and packing checklists.</li>
                <li>Computing mentor matching scores with senior peer buddies at your university.</li>
                <li>Notifying you about critical pre-departure milestones, deadlines, and orientation webinars.</li>
                <li>Preventing malicious activity, spam, harassment, and unauthorized access.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section id="security" className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Lock className="w-5 h-5 text-teal-400" />
                3. Data Storage & Security
              </h2>
              <p>
                We implement technical and organizational measures to secure your personal data. All traffic between your browser and our servers is encrypted using modern TLS (HTTPS). Sensitive fields and authentication credentials are encrypted using modern hashing algorithms. Access to production databases is restricted to authorized administrative engineers.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                4. Third-Party Services
              </h2>
              <p>
                We may utilize reputable third-party infrastructure providers for hosting (e.g., Vercel, MongoDB Atlas) and transactional email notifications. These providers are bound by strict data processing agreements and are prohibited from utilizing your personal data for their own independent marketing purposes.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                5. Your Data Rights (GDPR & International Protections)
              </h2>
              <p>Regardless of where you reside, you possess rights concerning your personal information:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-400 text-sm">
                <li><strong>Right to Access:</strong> Review all personal information linked to your student account.</li>
                <li><strong>Right to Rectification:</strong> Edit or update your student profile at any time in your dashboard settings.</li>
                <li><strong>Right to Erasure:</strong> Request the total permanent deletion of your profile, messages, and associated records.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                6. Contact Our Privacy Officer
              </h2>
              <p>
                If you have inquiries, complaints, or data requests regarding this Privacy Policy, please reach out to our team at{' '}
                <a
                  href="mailto:privacy@farfromhome.org"
                  className="text-teal-400 hover:underline font-medium"
                >
                  privacy@farfromhome.org
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
