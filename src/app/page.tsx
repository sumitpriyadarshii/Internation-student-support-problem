'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Plane,
  Heart,
  CheckCircle2,
  ChevronRight,
  Building,
  GraduationCap,
  MapPin,
  Clock,
  HelpCircle,
  Home,
  Sun,
  Coffee,
} from 'lucide-react';

const DESTINATIONS = [
  {
    country: 'Canada',
    flag: '🇨🇦',
    cities: 'Toronto, Vancouver, Montreal',
    topUni: 'University of Toronto',
    tasks: ['Apply for Study Permit & SIN', 'Open Scotiabank Student GIC', 'Get Rogers/Freedom Mobile SIM', 'Find off-campus housing near TTC'],
    sampleBuddy: { name: 'Elena Rostova', role: '3rd Year Computer Science', match: 98, uni: 'U of T, St. George' },
    event: 'Toronto International Welcome Mixer',
    eventTime: 'This Saturday, 6:00 PM',
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    cities: 'London, Manchester, Edinburgh',
    topUni: 'Imperial College London',
    tasks: ['Collect BRP Card within 10 days', 'Register with GP (NHS Health)', 'Open Monzo/Revolut UK Account', 'Get 16-25 Railcard for 1/3 off travel'],
    sampleBuddy: { name: 'Liam O’Connor', role: 'Postgrad Data Science', match: 95, uni: 'Imperial College' },
    event: 'London Thames River Campus Walk',
    eventTime: 'Sunday, 2:30 PM',
  },
  {
    country: 'United States',
    flag: '🇺🇸',
    cities: 'New York, Boston, San Francisco',
    topUni: 'New York University (NYU)',
    tasks: ['Complete I-94 arrival record', 'Check in with ISO/DSO office', 'Open Chase College Checking', 'Purchase university health waiver'],
    sampleBuddy: { name: 'Aarav Patel', role: 'Senior Economics Major', match: 97, uni: 'NYU Stern' },
    event: 'Washington Square Park Meet & Greet',
    eventTime: 'Friday, 5:00 PM',
  },
  {
    country: 'Australia',
    flag: '🇦🇺',
    cities: 'Melbourne, Sydney, Brisbane',
    topUni: 'University of Melbourne',
    tasks: ['Apply for Australian Tax File Number (TFN)', 'Activate OSHC Health Cover', 'Set up Commonwealth Bank Smart Access', 'Get Opal or Myki public transit card'],
    sampleBuddy: { name: 'Chloe Chen', role: '2nd Year Biomedicine', match: 94, uni: 'UniMelb Parkville' },
    event: 'Melbourne Coffee Culture Tour',
    eventTime: 'Saturday, 11:00 AM',
  },
  {
    country: 'Germany',
    flag: '🇩🇪',
    cities: 'Berlin, Munich, Heidelberg',
    topUni: 'TU Munich',
    tasks: ['City Registration (Anmeldung) at Bürgeramt', 'Unblock Expatrio/Fintiba account', 'Enroll with TK or Barmer health insurance', 'Semesterticket public transit validation'],
    sampleBuddy: { name: 'Mateo Fischer', role: 'Masters Mechanical Engineering', match: 96, uni: 'TUM Garching' },
    event: 'Berlin International Stammtisch',
    eventTime: 'Thursday, 7:00 PM',
  },
];

const FAQS = [
  {
    q: 'How does the Senior Buddy matching system work?',
    a: 'Our smart matching algorithm pairs you with verified senior international students at your destination university based on shared home country, language, course of study, and specific support needs like housing or academics.',
  },
  {
    q: 'Is Far From Home completely free for international students?',
    a: 'Yes, 100% free! All guides, step-by-step checklists, buddy pairings, and community events are provided at zero cost to students.',
  },
  {
    q: 'Can I use Far From Home before I even arrive in my study country?',
    a: 'Absolutely! In fact, most students join 2 to 3 months before departure to prepare visa documents, secure accommodation, connect with senior buddies, and RSVP to orientation events.',
  },
  {
    q: 'Are the guides and tips verified by real students and advisors?',
    a: 'Yes! Every guide on Far From Home is written and verified by senior students and verified community leads who have personally navigated the exact visa, banking, and housing processes.',
  },
];

export default function HomePage() {
  const [selectedDest, setSelectedDest] = useState(DESTINATIONS[0]);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-[#f7f5f0] selection:bg-amber-500 selection:text-white relative">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-18 lg:pb-32">
          {/* Subtle Warm Ambient Glows (Warm Sunset & Golden Hour) */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[850px] h-[480px] bg-gradient-to-tr from-amber-600/15 via-orange-600/10 to-rose-600/15 rounded-full blur-[160px] pointer-events-none -z-10" />
          <div className="absolute top-1/3 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-rose-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute inset-0 bg-grid-warm opacity-30 pointer-events-none -z-10" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Pill Alert: Humanistic & Warm */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full ios-pill shadow-lg shadow-black/30 mb-8">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
                <span className="text-xs sm:text-sm font-medium text-stone-200">
                  A home away from home for <span className="text-amber-300 font-semibold">50+ countries</span>
                </span>
                <span className="text-xs text-orange-400 font-bold hidden sm:inline">✦ Built by Students</span>
              </div>
            </motion.div>

            {/* Main Headline: Warm & Humanistic */}
            <div className="text-center max-w-4xl mx-auto">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.14]"
              >
                You Don&apos;t Have To Do This Alone.{' '}
                <span className="text-gradient-sunset block mt-1 sm:mt-2">
                  Welcome to Your Global Family.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed"
              >
                Moving abroad for university is a brave leap. We connect you with verified senior peers who walked the exact same path, clear visa roadmaps, and warm friends waiting on campus.
              </motion.p>

              {/* Action Buttons: Apple Glass & Warm Sunset */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto"
              >
                <Link
                  href="/register"
                  className="btn-ios-primary w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full font-bold text-white shadow-xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base cursor-pointer"
                >
                  <span>Start Your Journey Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#simulator"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-stone-200 ios-glass hover:bg-white/10 transition-all text-sm sm:text-base cursor-pointer"
                >
                  <Coffee className="w-4 h-4 text-amber-400" />
                  <span>Interactive Preview</span>
                </a>
              </motion.div>

              {/* Human Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-stone-400"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>100% Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verified Senior Peer Mentors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-amber-400" />
                  <span>Tailored to Your Campus & City</span>
                </div>
              </motion.div>
            </div>

            {/* FLOATING HERO SHOWCASE: iOS FROSTED GLASS */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="mt-14 lg:mt-20 relative max-w-5xl mx-auto"
            >
              {/* Outer Frosted Glass Enclosure */}
              <div className="ios-glass-prominent rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
                
                {/* Floating Apple-style Pill Badges */}
                <div className="hidden lg:block absolute -top-4 -left-6 animate-float-gentle z-20">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl ios-glass border-emerald-500/30 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                      ✓
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Study Permit Approved</p>
                      <p className="text-[10px] text-stone-400">Toronto, Canada 🇨🇦</p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block absolute -bottom-4 -right-5 animate-float-gentle-rev z-20">
                  <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl ios-glass border-amber-500/30 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                      98%
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Senior Buddy Matched</p>
                      <p className="text-[10px] text-amber-300">Priya (3rd Year Computer Science)</p>
                    </div>
                  </div>
                </div>

                {/* Inside Cockpit Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  {/* Card 1: Relocation Checkpoints */}
                  <div className="rounded-2xl ios-glass p-5 flex flex-col justify-between hover:border-amber-500/30 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Pre-Departure Checklist</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          4 / 6 Done
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { title: 'Submit Biometrics Appointment', done: true },
                          { title: 'Student Banking Account Setup', done: true },
                          { title: 'Airport Pickup & Transit Pass', done: true },
                          { title: 'Campus Dorm Key & Move-In', done: false },
                        ].map((t, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium transition-colors ${
                              t.done ? 'bg-emerald-500/10 text-stone-300' : 'bg-white/[0.04] text-white border border-white/5'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                                t.done ? 'bg-emerald-500 text-stone-950 font-bold' : 'border border-stone-500'
                              }`}
                            >
                              {t.done ? '✓' : ''}
                            </div>
                            <span className={t.done ? 'line-through text-stone-400' : ''}>
                              {t.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Milestones Completed</span>
                      <span className="font-bold text-amber-300">67% Ready</span>
                    </div>
                  </div>

                  {/* Card 2: Senior Buddy Match */}
                  <div className="rounded-2xl ios-glass border-amber-500/20 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          <span>Matched Senior Peer</span>
                        </span>
                        <span className="text-xs font-black text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                          98% Affinity
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center text-white font-black text-base shadow-md">
                          P
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">Priya Sharma</h4>
                          <p className="text-xs text-stone-400">Senior CS Student</p>
                          <p className="text-[11px] text-amber-300">University of Toronto</p>
                        </div>
                      </div>

                      <p className="text-xs text-stone-300 bg-black/25 p-3 rounded-xl border border-white/5 italic leading-relaxed">
                        &ldquo;Hey! I moved here from Delhi 2 years ago. Happy to help you with housing contracts and cheap groceries!&rdquo;
                      </p>
                    </div>

                    <div className="mt-4">
                      <Link
                        href="/buddies"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl btn-ios-primary text-white font-bold text-xs shadow-md transition-all"
                      >
                        <span>Say Hello on FFH</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Card 3: Orientation Mixer */}
                  <div className="rounded-2xl ios-glass p-5 flex flex-col justify-between hover:border-rose-500/30 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Campus Welcome Event</span>
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          32 RSVP&apos;d
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm mb-1.5">
                        International Chai & Chat Mixer ☕
                      </h4>
                      <p className="text-xs text-stone-400 mb-3 line-clamp-2 leading-relaxed">
                        Meet other incoming freshers and seniors. Warm tea, local city advice, and icebreaker games!
                      </p>

                      <div className="space-y-1.5 text-xs text-stone-300">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Friday • 5:00 PM EST</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>Student Union Lounge</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5">
                      <span className="inline-block w-full text-center py-2 rounded-xl bg-white/10 text-stone-200 font-semibold text-xs">
                        Free Entry • Open for All
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LIVE INTERACTIVE RELOCATION SIMULATOR */}
        <section id="simulator" className="py-20 border-y border-white/[0.08] relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ios-pill text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Personalized Preview</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Where Are You Heading?
              </h2>
              <p className="mt-3 text-stone-300 text-base sm:text-lg">
                Select your destination country to preview how Far From Home customizes your arrival roadmaps and senior peer network.
              </p>

              {/* Country Tabs: Apple Liquid Glass pills */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                {DESTINATIONS.map((dest) => {
                  const isSelected = selectedDest.country === dest.country;
                  return (
                    <button
                      key={dest.country}
                      onClick={() => setSelectedDest(dest)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'btn-ios-primary text-white shadow-lg scale-105'
                          : 'ios-glass text-stone-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-base">{dest.flag}</span>
                      <span>{dest.country}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Destination Showcase Box */}
            <motion.div
              key={selectedDest.country}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto rounded-3xl ios-glass-prominent p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedDest.flag}</span>
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      Destination: {selectedDest.country}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Top hubs: {selectedDest.cities} • Campus: {selectedDest.topUni}
                    </p>
                  </div>
                </div>
                <Link
                  href="/register"
                  className="btn-ios-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-md"
                >
                  <span>Get Complete {selectedDest.country} Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* 1. Tailored Tasks */}
                <div className="rounded-2xl ios-glass p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    <span>First 4 Checkpoints</span>
                  </h4>
                  <div className="space-y-2.5">
                    {selectedDest.tasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-stone-300">
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Top Buddy Match */}
                <div className="rounded-2xl ios-glass p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-orange-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Ready Senior Mentor</span>
                    </h4>
                    <span className="text-xs font-black text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      {selectedDest.sampleBuddy.match}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/25 border border-white/5 space-y-1.5">
                    <p className="font-bold text-white text-sm">
                      {selectedDest.sampleBuddy.name}
                    </p>
                    <p className="text-xs text-amber-300">
                      {selectedDest.sampleBuddy.role}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      📍 {selectedDest.sampleBuddy.uni}
                    </p>
                  </div>
                  <p className="mt-3 text-[11px] text-stone-400">
                    Matches your study major, destination city, and native language.
                  </p>
                </div>

                {/* 3. Welcome Event */}
                <div className="rounded-2xl ios-glass p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Campus Welcome Event</span>
                  </h4>
                  <div className="p-3.5 rounded-2xl bg-black/25 border border-white/5 space-y-1.5">
                    <p className="font-bold text-white text-sm">
                      {selectedDest.event}
                    </p>
                    <p className="text-xs text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{selectedDest.eventTime}</span>
                    </p>
                    <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Free RSVP Open
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] text-stone-400">
                    Join live virtual or in-person meetups to make friends before classes start.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* BENTO GRID: WHY WE ARE UNIQUE */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
                Core Superpowers
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
                Everything You Need, Thoughtfully Crafted
              </h2>
              <p className="mt-3 text-stone-300 text-base sm:text-lg">
                No more confusing WhatsApp groups, conflicting Reddit rumors, or scary government documents.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="ios-glass rounded-3xl p-8 hover:border-amber-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Verified Country Handbooks
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Clear, verified instructions for visa applications, health insurance, local SIM cards, opening bank accounts, and grocery saving tips written by real senior students.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="ios-glass rounded-3xl p-8 hover:border-orange-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Smart Relocation Checklists
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Automatic countdown checklists generated from your departure date. Track packing, biometrics, housing contracts, and airport logistics with zero stress.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="ios-glass rounded-3xl p-8 hover:border-rose-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Empathetic Senior Buddy Matching
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Our algorithm factors in your university, study level, native languages, and support preferences to pair you with high-affinity senior mentors who care.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="ios-glass rounded-3xl p-8 hover:border-rose-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Community & Meetups
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Campus mixers, cultural food festivals, language coffee exchanges, and online pre-arrival sessions with verified capacity guards and instant ticket receipts.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="ios-glass rounded-3xl p-8 hover:border-amber-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Anti-Scam Verified Standards
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  All mentors and community events are monitored by platform admins to protect incoming students against housing scams, rental frauds, and fake advisory fees.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="ios-glass rounded-3xl p-8 hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Global Scholar Network
                </h3>
                <p className="text-sm text-stone-400 leading-relaxed">
                  Connect across borders with alumni who graduated and settled in top tech, medicine, finance, and engineering companies globally.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* STEP-BY-STEP JOURNEY */}
        <section className="py-20 border-t border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
                Simple Roadmap
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
                From Offer Letter To Thriving On Campus
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {[
                {
                  step: '01',
                  title: 'Create Your Profile',
                  desc: 'Pick your home nation, target university, intake semester, and what guidance you need most.',
                },
                {
                  step: '02',
                  title: 'Auto-Generate Tasks',
                  desc: 'Get your customized pre-departure checklist instantly assigned with deadlines and guides.',
                },
                {
                  step: '03',
                  title: 'Match With A Senior',
                  desc: 'Browse compatible senior students at your university and connect via one-click message requests.',
                },
                {
                  step: '04',
                  title: 'Land & Attend Events',
                  desc: 'RSVP to city tours, campus mixers, and settle into your new home with lifelong friendships.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl ios-glass p-6 relative flex flex-col justify-between hover:border-amber-500/30 transition-all"
                >
                  <div>
                    <span className="text-4xl font-black text-white/10 block mb-4">
                      {item.step}
                    </span>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center text-xs font-bold text-amber-400">
                    <span>Explore Stage {item.step}</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
            <p className="text-sm text-stone-400 mt-2">
              Everything you need to know about joining the Far From Home platform.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl ios-glass overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`w-4 h-4 text-amber-400 transition-transform duration-200 shrink-0 ml-4 ${
                        isOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 text-xs text-stone-300 leading-relaxed border-t border-white/5 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="rounded-3xl p-8 sm:p-14 ios-glass-prominent relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight relative z-10">
                Ready For Your Next Chapter?
              </h2>
              <p className="mt-4 text-stone-300 text-sm sm:text-base max-w-xl mx-auto relative z-10">
                Join thousands of international scholars who made their foreign journey smooth, confident, and joyful.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link
                  href="/register"
                  className="btn-ios-primary px-8 py-3.5 rounded-full font-bold text-white hover:scale-105 transition-all text-sm sm:text-base shadow-xl"
                >
                  Create Your Free Account
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3.5 rounded-full font-semibold text-stone-200 ios-glass hover:bg-white/10 transition-all text-sm sm:text-base"
                >
                  Already A Member? Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
