import React from 'react';
import Link from 'next/link';
import { FileText, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export function FinalCtaSection() {
  return (
    <section className="w-full bg-gradient-to-b from-[#111722] via-[#0E121A] to-[#0A0D14] text-white py-16 sm:py-20 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/40 text-[11px] font-bold uppercase tracking-widest text-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>See Something That Needs Attention? · নাগরিক উদ্যোগ</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight leading-tight text-white">
            Your report can help create accountability.
          </h2>

          {/* Bengali Subheadline */}
          <p className="font-bengali font-bold text-lg sm:text-xl text-red-200/90">
            আপনার সঠিক তথ্য ও নির্ভুল প্রমাণ একটি নিরাপদ বাংলাদেশ গড়ে তুলতে পারে।
          </p>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-300/85 leading-relaxed max-w-2xl mx-auto pt-1">
            You can submit completely anonymously or choose to communicate with our verification team.
            All metadata is scrubbed, evidence is secured with strict encryption, and no IP addresses are ever stored.
          </p>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/report">
              <button
                type="button"
                className="h-12 px-7 rounded-md bg-[#C62828] hover:bg-[#B71C1C] active:bg-[#8E1717] text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-950/50 transition-all hover:scale-[1.02]"
              >
                <FileText className="w-4 h-4" />
                <span>Submit a Report Now</span>
              </button>
            </Link>

            <Link href="/how-it-works">
              <button
                type="button"
                className="h-12 px-6 rounded-md bg-transparent hover:bg-white/5 border border-white/25 hover:border-white/50 text-white text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <span>How Verification Works</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 border-t border-white/10 mt-6 max-w-xl mx-auto">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-IP Address Retention</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Cryptographic Tracking Keys</span>
            </span>
            <span className="text-slate-600">·</span>
            <span>Right of Reply Policy</span>
          </div>
        </div>
      </div>
    </section>
  );
}
