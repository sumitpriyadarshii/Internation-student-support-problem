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
    <div className="min-h-screen flex flex-col bg-[#0d0a09] text-stone-100">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* HERO / MISSION BANNER */}
        <section className="relative py-16 sm:py-24 overflow-hidden border-b border-white/[0.08]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-orange-500/10 to-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-warm opacity-40 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20">
              Our Story & Mission
            </span>
            <h1 className="mt-4 text-4xl sm:text-6xl font-black text-white tracking-tight">
              Bridging the Distance to Your <span className="text-gradient-sunset">Dreams</span>
            </h1>
            <p className="mt-6 text-base sm:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed">
              Far From Home was created with a single purpose: to ensure no international student ever feels stranded, confused, or alone in a new country.
            </p>
          </div>
        </section>

        {/* MISSION & VISION */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              <div className="p-8 sm:p-10 rounded-3xl ios-glass border border-white/10 relative">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Our Mission</h2>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  To democratize access to reliable, personalized relocation support for every international scholar. We believe moving abroad for higher education is one of the bravest leaps a young person can take, and they deserve a compassionate, tech-enabled safety net at every step.
                </p>
              </div>

              <div className="p-8 sm:p-10 rounded-3xl ios-glass border border-white/10 relative">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 mb-6">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white mb-4">Our Vision</h2>
                <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
                  A borderless world where international students arrive at their universities feeling fully prepared, financially savvy, culturally welcomed, and connected to an inspiring global network of peers who lift each other up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="py-16 sm:py-24 border-t border-white/[0.08] bg-black/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Guiding Principles
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
                What We Stand For
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((val, idx) => {
                const Icon = val.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl ios-glass border border-white/10 flex flex-col justify-between hover:border-amber-500/40 transition-all group"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{val.title}</h3>
                      <p className="text-xs text-stone-400 leading-relaxed">{val.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* TEAM MEMBERS */}
        <section className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Built by Scholars
              </span>
              <h2 className="mt-4 text-3xl sm:text-5xl font-black text-white tracking-tight">
                Meet the Leadership Team
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEAM_MEMBERS.map((member, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-3xl ios-glass border border-white/10 text-center flex flex-col items-center hover:border-amber-500/40 transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 flex items-center justify-center text-white text-lg font-black mb-4 shadow-md">
                    {member.avatar}
                  </div>
                  <h3 className="text-base font-bold text-white">{member.name}</h3>
                  <p className="text-xs text-amber-400 font-semibold mt-0.5">{member.role}</p>
                  <span className="mt-2 text-xs text-stone-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5 font-medium">
                    {member.flag}
                  </span>
                  <p className="mt-4 text-xs text-stone-400 leading-relaxed">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
