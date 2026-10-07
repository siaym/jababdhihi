import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

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
      dotColor: 'bg-slate-400',
    },
    {
      num: '02',
      title: 'REVIEWED',
      titleBn: 'পর্যালোচনা',
      desc: 'Moderators evaluate public-interest merit, redact personal victim data, and inspect evidence.',
      badgeBorder: 'border-amber-400',
      badgeBg: 'bg-amber-50',
      badgeText: 'text-amber-800',
      dotColor: 'bg-amber-500',
    },
    {
      num: '03',
      title: 'VERIFIED',
      titleBn: 'যাচাইকৃত',
      desc: 'Corroborated by authentic audio, video, or official documentary verification standards.',
      badgeBorder: 'border-emerald-500',
      badgeBg: 'bg-emerald-50',
      badgeText: 'text-emerald-800',
      dotColor: 'bg-emerald-500',
    },
    {
      num: '04',
      title: 'REFERRED',
      titleBn: 'নিষ্পত্তি ও প্রেরণ',
      desc: 'Transmitted to official civic ombudsmen, legal aid, or preserved as public archive.',
      badgeBorder: 'border-blue-500',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-800',
      dotColor: 'bg-blue-500',
    },
  ];

  return (
    <section className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="rounded-[16px] bg-white border border-[#E2E8F0] shadow-xl shadow-slate-900/5 overflow-hidden">
        {/* Top Header */}
        <div className="p-6 sm:p-8 lg:p-10 border-b border-[#F1F5F9] bg-[#FAFAF9]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C62828]">
                  Our Approach · আমাদের পদ্ধতি
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
                  <h3 className="font-bold text-xs sm:text-sm text-[#111827] tracking-tight flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${step.dotColor}`} />
                    <span>{step.title}</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-bengali">
                    ({step.titleBn})
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#64748B] leading-relaxed">
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
