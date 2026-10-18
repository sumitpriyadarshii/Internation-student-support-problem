import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  HeartHandshake,
  Sliders,
  Users2,
  ShieldCheck,
  Target,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Globe2,
} from 'lucide-react';

export const metadata = {
  title: 'About Us - Far From Home',
  description:
    'Learn about Far From Home, our mission, vision, core values, and the international student community behind our platform.',
};

const VALUES = [
  {
    icon: HeartHandshake,
    title: 'Inclusivity',
    description:
      'We welcome students of all nationalities, languages, socio-economic backgrounds, and identities. Borders should expand minds, not divide people.',
  },
  {
    icon: Sliders,
    title: 'Personalisation',
    description:
      'No two student journeys are identical. Our guides adapt strictly to your home origin, target city, university, visa regulations, and lifestyle.',
  },
  {
    icon: Users2,
    title: 'Community',
    description:
      'Relocating halfway across the world is hard alone. We build empathetic peer networks that turn complete strangers into lifelong friends.',
  },
  {
    icon: ShieldCheck,
    title: 'Security & Trust',
    description:
      'Verified guidance only. We fiercely protect student data, verify senior mentors, and provide accurate, scam-free relocation information.',
  },
];

const TEAM_MEMBERS = [
  {
    name: 'Sarah Chen',
    role: 'Co-Founder & CEO',
    bio: 'Former Singaporean scholar at UC Berkeley. Passionate about removing administrative barriers for global learners.',
    flag: '🇸🇬 ➔ 🇺🇸',
    avatar: 'SC',
  },
  {
    name: 'David Kim',
    role: 'Co-Founder & CTO',
    bio: 'Software engineer and international graduate from South Korea to University of Waterloo. Building secure, accessible student tools.',
    flag: '🇰🇷 ➔ 🇨🇦',
    avatar: 'DK',
  },
  {
    name: 'Fatima Zahra',
    role: 'Head of Student Experience',
    bio: 'Multilingual mentor who navigated the student visa transition from Morocco to Sorbonne University in Paris.',
    flag: '🇲🇦 ➔ 🇫🇷',
    avatar: 'FZ',
  },
  {
    name: 'Alex Johnson',
    role: 'Lead Community Director',
    bio: 'Organized international student arrivals in Melbourne and London for 7+ years. Advocate for international scholar wellbeing.',
    flag: '🇬🇧 ➔ 🇦🇺',
    avatar: 'AJ',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1">
        {/* HERO / MISSION BANNER */}
        <section className="relative py-16 sm:py-24 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden border-b border-slate-800">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
              Our Story & Mission
            </span>
            <h1 className="mt-4 text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Bridging the Distance to Your Dreams
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Far From Home was created with a single purpose: to ensure no international student ever feels stranded, confused, or alone in a new country.
            </p>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="py-16 sm:py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 relative">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Our Mission
                </h2>
                <p className="text-slate-300 leading-relaxed text-base">
                  To eliminate the stress, cultural shock, and bureaucratic disorientation of studying abroad by providing verified, personalized knowledge, milestone tracking, and a compassionate peer community.
                </p>
                <div className="mt-6 flex items-center gap-2 text-teal-400 text-sm font-medium">
                  <Sparkles className="w-4 h-4" />
                  Every student deserves a smooth landing.
                </div>
              </div>

              <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 relative">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 mb-6">
                  <Globe2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Our Vision
                </h2>
                <p className="text-slate-300 leading-relaxed text-base">
                  A borderless educational landscape where international students thrive academically, socially, and emotionally — feeling confident and connected from day one to graduation.
                </p>
                <div className="mt-6 flex items-center gap-2 text-sky-400 text-sm font-medium">
                  <GraduationCap className="w-4 h-4" />
                  Building global citizenship together.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section id="values" className="py-16 sm:py-24 bg-slate-900 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
                Pillars of Our Work
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                The Values That Drive Far From Home
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-400">
                We believe in ethical support, student privacy, and genuine peer connections.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val) => {
                const IconComponent = val.icon;
                return (
                  <div
                    key={val.title}
                    className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-teal-500/40 transition-all flex flex-col"
                  >
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20 mb-5">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {val.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed flex-1">
                      {val.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section id="team" className="py-16 sm:py-24 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
                The Builders
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Built by Former International Students
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-400">
                We’ve spent nights pacing airport terminals, decoding visa acronyms, and shivering in new climates. We’re building the product we wished we had.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.name}
                  className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center group hover:border-teal-500/30 transition-all"
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4 group-hover:scale-105 transition-transform">
                    {member.avatar}
                  </div>
                  <h3 className="text-lg font-bold text-white">{member.name}</h3>
                  <p className="text-xs font-semibold text-teal-400 mt-0.5">
                    {member.role}
                  </p>
                  <div className="mt-2 px-2.5 py-1 rounded-md bg-slate-800 text-[11px] font-medium text-slate-300">
                    {member.flag}
                  </div>
                  <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-16 bg-slate-900 border-t border-slate-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Ready to start your journey with us?
            </h2>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm sm:text-base">
              Create your student profile today and connect with mentors and guides tailored for your destination.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-md shadow-teal-500/20 text-sm transition-all"
              >
                Join Far From Home
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
