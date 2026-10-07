import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function AccountabilityDoctrineBanner({ className = '' }: { className?: string }) {
  const steps = [
    {
      num: '01',
      title: 'RECEIVED',
      titleBn: 'জমা প্রাপ্ত',
      desc: 'Cryptographic tracking key issued; EXIF/GPS scrubbed; zero IP address retention.',
      badgeBorder: 'border-slate-300',
      badgeBg: 'bg-slate-50',
      badgeText: 'text-slate-700',
      statusColor: '#64748B',
    },
    {
      num: '02',
      title: 'UNDER REVIEW',
      titleBn: 'পর্যালোচনা',
      desc: 'Moderators evaluate public-interest merit, redact personal victim data, and inspect evidence.',
      badgeBorder: 'border-amber-400',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      statusColor: '#F59E0B',
    },
    {
      num: '03',
      title: 'VERIFIED FINDING',
      titleBn: 'যাচাইকৃত',
      desc: 'Corroborated by authentic audio, video, or official documentary verification standards.',
      badgeBorder: 'border-emerald-500',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      statusColor: '#16A34A',
    },
    {
      num: '04',
      title: 'REFERRED & RESOLVED',
      titleBn: 'নিষ্পত্তি ও প্রেরণ',
      desc: 'Transmitted to official civic ombudsmen, legal aid, or archived with institutional response.',
      badgeBorder: 'border-purple-500',
      badgeBg: 'bg-purple-50',
      badgeText: 'text-purple-800',
      statusColor: '#7C3AED',
    },
  ];

  return (
    <section className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="rounded-[16px] bg-white border border-[#E2E8F0] shadow-md shadow-slate-900/5 overflow-hidden">
        {/* Top Header */}
        <div className="p-6 sm:p-8 lg:p-10 border-b border-[#F1F5F9] bg-[#FAFAF9]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C62828]">
                  Our Process · আমাদের পদ্ধতি
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#111827] tracking-tight leading-tight">
                A report is a starting point — not a verdict.
              </h2>
              <p className="font-bengali font-bold text-base sm:text-lg text-slate-500">
                প্রতিবেদন একটি সূচনা — কখনোই চূড়ান্ত রায় নয়।
              </p>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed pt-1 max-w-2xl">
                Every report submitted to Jababdihi is treated strictly as an allegation until it has undergone
                systematic reviewer inspection and multi-source corroboration through our published verification methodology.
              </p>
            </div>

            <Link
              href="/methodology"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#111827] hover:bg-black text-white text-xs font-semibold shrink-0 shadow-sm transition-colors"
            >
              <span>Our Methodology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Continuous Process Stepper with Horizontal Connecting Line */}
        <div className="relative p-6 sm:p-8 lg:p-10 bg-white">
          {/* Continuous line connecting the 4 stages on desktop */}
          <div className="hidden md:block absolute top-[44px] lg:top-[48px] left-[8%] right-[8%] h-[2px] bg-slate-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step) => (
              <div key={step.num} className="flex flex-col items-start space-y-2.5">
                {/* Number Circle Badge */}
                <div
                  className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 ${step.badgeBorder} ${step.badgeBg} ${step.badgeText} flex items-center justify-center font-mono font-bold text-xs lg:text-sm shadow-sm`}
                >
                  {step.num}
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-bold text-sm lg:text-[15px] text-[#111827] tracking-tight flex items-center gap-1.5">
                    <span>{step.title}</span>
                  </h3>
                  <p className="font-bengali text-xs text-slate-400 font-medium">
                    {step.titleBn}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed max-w-[260px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
