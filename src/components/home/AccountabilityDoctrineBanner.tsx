import React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function AccountabilityDoctrineBanner({ className = '' }: { className?: string }) {
  return (
    <section className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="rounded-[14px] bg-white border border-[#E2E8F0] shadow-xl shadow-slate-900/5 overflow-hidden">
        {/* Top Warning / Doctrine Header */}
        <div className="p-5 sm:p-7 border-b border-[#F1F5F9] bg-[#FAFAF9]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-[#C62828] border border-rose-200">
                <Shield className="w-3 h-3 text-[#C62828]" />
                <span>Civic Accountability Doctrine • আইনি ও নাগরিক মূলনীতি</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">
                Reports are not verdicts. <span className="font-bengali font-bold text-lg sm:text-xl text-[#374151]">(প্রতিবেদন কখনোই চূড়ান্ত রায় নয়)</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed pt-0.5">
                Every report submitted to Jababdihi is treated strictly as an unverified citizen allegation
                until it has undergone systematic reviewer inspection and multi-source corroboration through
                our published verification methodology. We do not pass judgment or operate as a social naming-and-shaming board.
              </p>
            </div>

            <Link
              href="/methodology"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#111827] hover:bg-black text-white text-xs font-semibold shrink-0 shadow-sm transition-colors"
            >
              <span>Our Methodology</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4-Stage Lifecycle Stepper: Received -> Under Review -> Verified -> Resolved */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#F1F5F9] bg-white">
          {/* Stage 1 */}
          <div className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-[#111827] text-[11px] font-bold flex items-center justify-center font-mono">
                1
              </span>
              <h3 className="font-bold text-xs sm:text-[13px] text-[#111827]">
                Received <span className="font-normal text-slate-500">(জমা প্রাপ্ত)</span>
              </h3>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-snug pl-7">
              Cryptographic tracking key generated; EXIF/metadata scrubbed; zero IP address retention.
            </p>
          </div>

          {/* Stage 2 */}
          <div className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center justify-center font-mono">
                2
              </span>
              <h3 className="font-bold text-xs sm:text-[13px] text-[#111827]">
                Under Review <span className="font-normal text-slate-500">(পর্যালোচনাধীন)</span>
              </h3>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-snug pl-7">
              Trained moderators evaluate public-interest merit, redact personal victim data, and inspect evidence.
            </p>
          </div>

          {/* Stage 3 */}
          <div className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold flex items-center justify-center font-mono">
                3
              </span>
              <h3 className="font-bold text-xs sm:text-[13px] text-[#111827]">
                Verified Finding <span className="font-normal text-slate-500">(যাচাইকৃত তথ্য)</span>
              </h3>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-snug pl-7">
              Corroborated by authentic audio/video/documentary evidence according to strict verification standards.
            </p>
          </div>

          {/* Stage 4 */}
          <div className="p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold flex items-center justify-center font-mono">
                4
              </span>
              <h3 className="font-bold text-xs sm:text-[13px] text-[#111827]">
                Referred / Resolved <span className="font-normal text-slate-500">(নিষ্পত্তি)</span>
              </h3>
            </div>
            <p className="text-[11px] text-[#6B7280] leading-snug pl-7">
              Transmitted to official civic ombudsmen, legal aid, or archived as verified public disclosure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
