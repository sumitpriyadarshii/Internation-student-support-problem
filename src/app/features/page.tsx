import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  BookOpen,
  CheckSquare,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Compass,
  Check,
  Layers,
  MapPin,
  MessageSquare,
  GraduationCap,
} from 'lucide-react';

export const metadata = {
  title: 'Features - Far From Home',
  description:
    'Explore the powerful tools built for international students: personalised relocation guides, interactive task checklists, senior buddy matching, and global events.',
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative py-16 sm:py-24 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden border-b border-slate-800">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
              Platform Modules
            </span>
            <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Engineered for Global Student Success
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Every feature in Far From Home addresses a real hurdle international scholars experience: from visa confusion and social isolation to housing leases and bank accounts.
            </p>
          </div>
        </section>

        {/* DETAILED MODULES */}
        <div className="py-16 sm:py-24 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* MODULE 1: GUIDES */}
          <section id="guides" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-semibold tracking-wide border border-teal-500/20">
                <BookOpen className="w-4 h-4" />
                Module 01 • Destination Intelligence
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Personalised Country & University Guides
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Skip outdated blogs and confusing immigration portals. Get verified, step-by-step documentation roadmaps specifically curated for your destination country, city, and degree institution.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Visa & Legal Checklists:</strong> Direct links to official embassy paperwork, biometrics instructions, and interview tips.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Cost of Living Calculator:</strong> Neighborhood-by-neighborhood rent estimates, public transit passes, groceries, and student discounts.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Banking & SIM Cards:</strong> Step-by-step guides to opening fee-free student bank accounts and obtaining local eSIMs upon arrival.</span>
                </li>
              </ul>
            </div>

            {/* Mock UI illustration for Guides */}
            <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">guide-uk-student-visa.pdf</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300">
                      UNITED KINGDOM
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      TIER 4 / STUDENT ROUTE
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">Opening a UK Bank Account & NHS Surcharge</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Once you arrive at Heathrow or Gatwick, you have 10 days to collect your Biometric Residence Permit (BRP) from your chosen Post Office branch...
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Average Monthly Budget</p>
                      <p className="text-sm font-bold text-teal-400">£1,150 / mo</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-[10px] text-slate-400">Processing Time</p>
                      <p className="text-sm font-bold text-sky-400">3-4 Weeks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* MODULE 2: TASK TRACKING */}
          <section id="tasks" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Mock UI illustration for Tasks */}
            <div className="order-2 lg:order-1 p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-slate-200">Relocation Milestones</span>
                  </div>
                  <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                    4 of 6 Completed
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-teal-500 to-teal-400 h-2 rounded-full w-[67%]" />
                </div>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-teal-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-teal-500 flex items-center justify-center text-slate-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-medium text-slate-200 line-through">
                        Upload passport biometrics & CAS
                      </span>
                    </div>
                    <span className="text-[10px] text-teal-400 font-semibold uppercase">Done</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-teal-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-teal-500 flex items-center justify-center text-slate-950">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs font-medium text-slate-200 line-through">
                        Confirm on-campus housing contract
                      </span>
                    </div>
                    <span className="text-[10px] text-teal-400 font-semibold uppercase">Done</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-slate-600" />
                      <span className="text-xs font-medium text-white">
                        Collect BRP card from postal branch
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-semibold uppercase">Due in 3d</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-slate-600" />
                      <span className="text-xs font-medium text-white">
                        Attend Faculty Welcome Orientation
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Next Week</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-semibold tracking-wide border border-teal-500/20">
                <CheckSquare className="w-4 h-4" />
                Module 02 • Smart Checklists
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Interactive Task & Milestone Tracking
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Stay entirely in control of your timeline. Our automated tracker breaks down the monstrous relocation process into manageable, bite-sized tasks with smart reminders.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Phase-Based Roadmaps:</strong> Tasks categorized by &ldquo;3 Months Before Departure&rdquo;, &ldquo;Final Week&rdquo;, and &ldquo;Arrival Fortnight&rdquo;.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Deadline Alerts:</strong> Never miss a tuition fee deposit or visa submission date with proactive reminders.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Custom Tasks:</strong> Add personal errands, flight reservations, luggage packing items, or course enrollments.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* MODULE 3: BUDDY MATCHING */}
          <section id="buddies" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-semibold tracking-wide border border-teal-500/20">
                <Users className="w-4 h-4" />
                Module 03 • Peer Mentorship
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Intelligent Buddy Matching
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Nothing beats advice from someone who was in your exact shoes 12 months ago. Our matching engine pairs incoming students with verified senior mentors based on university, degree, native languages, and shared interests.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Verified Senior Mentors:</strong> All buddies are currently enrolled, university-verified international students.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Cultural & Linguistic Comfort:</strong> Request a mentor who speaks your native language for zero miscommunication.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Safe Messaging:</strong> Communicate in real time without having to distribute your personal phone number upfront.</span>
                </li>
              </ul>
            </div>

            {/* Mock UI illustration for Buddies */}
            <div className="p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold text-teal-400">Recommended Match</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold">
                    96% Compatibility
                  </span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-400 to-sky-500 text-slate-950 font-bold text-lg flex items-center justify-center shadow-lg">
                    KL
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">Kenji Lin</h4>
                    <p className="text-xs text-slate-400">3rd Year Computer Science • University of Toronto</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">Japanese</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">English</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-teal-400">Housing Expert</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800 italic">
                  &ldquo;Hey! I moved from Tokyo to Toronto 2 years ago. Happy to help with transit passes, winter coats, and finding groceries!&rdquo;
                </p>

                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 transition-colors flex items-center justify-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Connect with Kenji
                  </button>
                  <button className="py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors">
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* MODULE 4: EVENTS */}
          <section id="events" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Mock UI illustration for Events */}
            <div className="order-2 lg:order-1 p-4 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden group">
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-semibold text-slate-200">Upcoming Campus & Online Mixers</span>
                  </div>
                  <span className="text-xs text-slate-400">London Hub</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-500/30 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase">
                        Virtual Webinar
                      </span>
                      <h4 className="text-sm font-bold text-white">UK Visa & Border Control Q&A</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-teal-400" /> Oct 24 • 18:00 BST
                      </p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-teal-400 shrink-0">
                      RSVP
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold uppercase">
                        In-Person
                      </span>
                      <h4 className="text-sm font-bold text-white">International Student Chai & Social</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" /> Student Union Hall • Oct 28
                      </p>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 shrink-0">
                      Join (34 going)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-semibold tracking-wide border border-teal-500/20">
                <Calendar className="w-4 h-4" />
                Module 04 • Student Community
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Global & Local Community Events
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Connect before you pack your bags. Discover online AMA sessions, campus walking tours, cultural potlucks, and pre-arrival mixers hosted by fellow students and alumni.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Virtual Pre-Departure AMAs:</strong> Ask urgent questions about packing, customs, and dorm essentials before boarding your plane.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>City Welcome Walkabouts:</strong> Join senior students to explore public transit routes, best grocery markets, and local cafes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Cultural Celebrations:</strong> Celebrate Diwali, Lunar New Year, Eid, Thanksgiving, and more with an inclusive global family.</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* BOTTOM CTA */}
        <section className="py-20 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Experience the Complete Toolkit Today
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto text-base">
              Set up your profile in 2 minutes and explore custom roadmaps built for your university.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-lg text-sm transition-all"
              >
                Sign Up for Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-slate-300 hover:text-white bg-slate-800 border border-slate-700 text-sm transition-colors"
              >
                Read Our Story
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
