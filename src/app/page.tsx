import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  BookOpen,
  CheckSquare,
  Users,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Compass,
  Star,
  Quote,
  CheckCircle2,
  Globe2,
} from 'lucide-react';

export const metadata = {
  title: 'Far From Home - International Student Support Platform',
  description:
    'Your new home starts here. Personalised support, relocation guides, checklist task tracking, buddy matching, and community events for international students.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 lg:pt-28 lg:pb-36 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
              <Globe2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>International Student Support Platform</span>
              <span className="w-1 h-1 rounded-full bg-teal-400" />
              <span className="text-slate-300">Over 50+ Countries</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
              Your New Home <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-teal-300 to-sky-400">Starts Here.</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Relocating to a new country shouldn't feel terrifying. Get personalised visa roadmaps, interactive relocation checklists, verified senior student buddies, and welcoming community events.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-lg shadow-teal-500/25 transition-all text-base hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition-all text-base"
              >
                Learn More
                <Compass className="w-4 h-4 text-teal-400" />
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-14 pt-8 border-t border-slate-800/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>100% Free for Students</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Verified Senior Mentors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>City & University Tailored</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-12 bg-slate-900 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 text-center">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  <span className="text-teal-400">50</span>+
                </p>
                <p className="mt-2 text-sm sm:text-base font-medium text-slate-300">
                  Countries Represented
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Students across the globe</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  <span className="text-teal-400">1,000</span>+
                </p>
                <p className="mt-2 text-sm sm:text-base font-medium text-slate-300">
                  Active Students
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Supported this semester</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  <span className="text-teal-400">500</span>+
                </p>
                <p className="mt-2 text-sm sm:text-base font-medium text-slate-300">
                  Curated Guides
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Verified local insights</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  <span className="text-teal-400">100</span>+
                </p>
                <p className="mt-2 text-sm sm:text-base font-medium text-slate-300">
                  Community Events
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Mixers, tours & webinars</p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-20 sm:py-28 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
                Core Capabilities
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Everything You Need Before and After Landing
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-400">
                Say goodbye to fragmented Google searches and confusing government portals. Far From Home brings every step of your international student journey into one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {/* Feature 1 */}
              <div className="group relative p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all duration-300 mb-6">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Personalised Guides
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  Step-by-step guidance filtered by your destination country, university, visa type, and city living essentials.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-medium text-teal-400 group-hover:text-teal-300 flex items-center gap-1">
                  Explore Guides <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all duration-300 mb-6">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Task Tracking
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  Interactive checklists for visa milestones, bank accounts, local SIM cards, accommodation, and university orientation.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-medium text-teal-400 group-hover:text-teal-300 flex items-center gap-1">
                  View Checklists <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all duration-300 mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Buddy Matching
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  Match with experienced senior students who speak your language, share your major, and know campus life inside out.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-medium text-teal-400 group-hover:text-teal-300 flex items-center gap-1">
                  Find a Buddy <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Feature 4 */}
              <div className="group relative p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900/90 transition-all duration-300 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 group-hover:bg-teal-500 group-hover:text-slate-950 transition-all duration-300 mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Community Events
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">
                  Join online pre-departure AMA webinars, campus walk tours, international dinners, and city exploration meetups.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-medium text-teal-400 group-hover:text-teal-300 flex items-center gap-1">
                  Browse Events <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-20 sm:py-28 bg-slate-900 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
                Simple 4-Step Process
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                How Far From Home Works
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-400">
                From admission offer to settling into your student dorm, we walk by your side every single day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Step 1 */}
              <div className="relative p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-teal-500 text-slate-950 font-bold text-xl flex items-center justify-center shadow-lg shadow-teal-500/30 mb-5">
                  1
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Create Profile</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Tell us where you are traveling from, your destination university, degree program, and arrival timeline.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-teal-400 text-teal-300 font-bold text-xl flex items-center justify-center mb-5">
                  2
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Get Personalised Info</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Instantly receive bespoke guides on visas, health insurance, local banks, SIM cards, and student transport passes.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-teal-400 text-teal-300 font-bold text-xl flex items-center justify-center mb-5">
                  3
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Track Your Tasks</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Tick off prioritized tasks categorized by pre-departure, arrival week, and first month of college life.
                </p>
              </div>

              {/* Step 4 */}
              <div className="relative p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-teal-400 text-teal-300 font-bold text-xl flex items-center justify-center mb-5">
                  4
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Connect with Peers</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Get matched with friendly senior buddies and join university orientation meetups to build lifelong friendships.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="py-20 sm:py-28 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
                Student Stories
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Loved by Students Moving Across the World
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-400">
                Here is what students say about making their foreign study experience feel like home.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between relative shadow-lg">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-teal-500/30 mb-3" />
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;Far From Home made my visa and housing transition so effortless. I found my roommate before landing and knew exactly which bank account to open without predatory fees!&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600/30 text-teal-300 font-bold flex items-center justify-center border border-teal-500/40">
                    PS
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Priya Sharma</h4>
                    <p className="text-xs text-slate-400">India ➔ University of Toronto (Canada)</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between relative shadow-lg">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-teal-500/30 mb-3" />
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;The pre-arrival checklist prevented me from forgetting critical health insurance and blocked account paperwork. The Munich winter packing guide was a lifesaver.&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600/30 text-teal-300 font-bold flex items-center justify-center border border-teal-500/40">
                    MR
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Mateo Rossi</h4>
                    <p className="text-xs text-slate-400">Brazil ➔ TU Munich (Germany)</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between relative shadow-lg">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-teal-500/30 mb-3" />
                  <p className="text-sm text-slate-300 italic leading-relaxed">
                    &ldquo;My student buddy answered all my questions about London public transit and SIM cards on day one. I attended my first student dinner through Far From Home!&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-600/30 text-teal-300 font-bold flex items-center justify-center border border-teal-500/40">
                    AA
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Aisha Al-Mansoor</h4>
                    <p className="text-xs text-slate-400">UAE ➔ University College London (UK)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-950/40 border border-teal-500/30 p-8 sm:p-14 text-center shadow-2xl">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Ready to feel at home?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Join thousands of ambitious international students who turned relocation anxiety into an unforgettable global adventure.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-xl shadow-teal-500/20 text-base transition-all hover:scale-[1.02]"
                >
                  Create Your Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-base transition-colors"
                >
                  Talk to Our Team
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-400">
                Free forever for students • No credit card required • Instant access
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
