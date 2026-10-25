'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Mail,
  MapPin,
  Clock,
  Send,
  HelpCircle,
  ChevronDown,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  category: z.string().min(1, 'Please select a topic'),
  subject: z.string().min(4, 'Subject must be at least 4 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

type ContactFormData = z.infer<typeof contactSchema>;

const FAQS = [
  {
    q: 'Is Far From Home completely free for international students?',
    a: 'Yes! Far From Home is 100% free for students. All destination guides, checklists, mentorship matches, and community events are accessible without any subscription or hidden fees.',
  },
  {
    q: 'How does the Buddy Matching system work?',
    a: 'When you create an account, our algorithm analyzes your university, field of study, native language, and relocation timeline. We recommend senior student mentors who have lived in your target city and can answer questions safely through our platform.',
  },
  {
    q: 'Which countries and universities are supported?',
    a: 'We currently cover major student destinations including the United Kingdom, United States, Canada, Germany, Australia, Ireland, and Singapore, with hundreds of verified university guides expanding every month.',
  },
  {
    q: 'Can universities and international student offices partner with Far From Home?',
    a: 'Absolutely! We partner with university international offices to help onboard incoming cohorts smoothly and provide students with officially approved campus resources.',
  },
  {
    q: 'How is my personal information protected?',
    a: 'We take privacy seriously. Your contact information is never sold to third parties, lenders, or commercial recruiters. You control what details are visible on your student profile.',
  },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      category: 'Student Support',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    // Simulate contact form submission
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Message received! Our team will get back to you within 24 hours.');
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-slate-100">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28">
        {/* HERO HEADER */}
        <section className="relative py-14 sm:py-20 overflow-hidden border-b border-white/[0.08]">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-cyber opacity-30 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
              Get in Touch
            </span>
            <h1 className="mt-4 text-4xl sm:text-5xl font-black text-white tracking-tight">
              We&apos;re Here to Help You Feel <span className="text-gradient-aurora">at Home</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Have questions about your student relocation, university guides, or want to become a mentor? Send us a message and our support team will reply swiftly.
            </p>
          </div>
        </section>

        {/* CONTACT FORM & SIDEBAR */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Column */}
            <div className="lg:col-span-7 bg-slate-900 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Send Us a Message</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Fill in your details below and we&apos;ll be in touch.
                </p>
              </div>

              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center gap-3 text-teal-300">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">
                    Thank you! Your message has been safely delivered. We typically respond within 24 hours.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Your Name
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="e.g. Maria Gonzalez"
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.name ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="maria@university.edu"
                      className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                        errors.email ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Topic / Category */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Inquiry Topic
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Student Support">Student Support & Relocation Help</option>
                    <option value="Mentor Program">Becoming a Senior Buddy / Mentor</option>
                    <option value="University Partnership">University or College Partnership</option>
                    <option value="Bug or Feedback">Platform Feedback or Bug Report</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    {...register('subject')}
                    type="text"
                    placeholder="Brief summary of your question"
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.subject ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.subject && (
                    <p className="text-xs text-rose-400 mt-1">{errors.subject.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Message
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    placeholder="Please include relevant details like your destination country or university..."
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      errors.message ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-rose-400 mt-1">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 disabled:opacity-50 transition-all text-sm cursor-pointer shadow-lg shadow-teal-500/20"
                >
                  {isSubmitting ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Info Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-400" />
                  Contact Information
                </h3>

                <div className="space-y-4 text-sm text-slate-300">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Student Support Team</p>
                      <a
                        href="mailto:support@farfromhome.org"
                        className="text-teal-400 hover:underline text-xs"
                      >
                        support@farfromhome.org
                      </a>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Inquiries regarding guides, accounts & buddies
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Global Student Hubs</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        London (UK) • Toronto (Canada) • Melbourne (Australia) • Singapore
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Hours of Response</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Monday – Friday: 08:00 – 20:00 UTC
                      </p>
                      <p className="text-xs text-teal-300 mt-0.5 font-medium">
                        Student peer community forums active 24/7
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-tr from-slate-900 to-teal-950/40 border border-teal-500/20">
                <div className="flex items-center gap-2 text-teal-400 text-sm font-bold mb-2">
                  <Sparkles className="w-4 h-4" />
                  Urgent Student Help
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you are experiencing an urgent border or embassy deadline, please mark your subject with &ldquo;URGENT&rdquo; or contact your university&apos;s International Students Office directly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-16 sm:py-24 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20">
                Frequently Asked Questions
              </span>
              <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight">
                Quick Answers to Common Queries
              </h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 text-slate-200 hover:text-white transition-colors"
                    >
                      <span className="font-semibold text-sm sm:text-base flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-teal-400 shrink-0" />
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-800/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
