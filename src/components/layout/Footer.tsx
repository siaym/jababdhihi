'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useI18n } from '@/lib/i18n';
import { Lock, Globe, ShieldCheck } from 'lucide-react';

export function Footer() {
  const { locale, setLocale } = useI18n();

  return (
    <footer className="bg-white border-t border-[#E2E8F0] text-[#334155]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission Column (2 of 5 cols) */}
          <div className="space-y-4 lg:col-span-2">
            <Logo size="md" href="/" />
            <p className="text-xs sm:text-[13px] text-[#64748B] leading-relaxed max-w-sm">
              A citizen-powered platform for reporting, documenting and following up on
              public-interest issues across Bangladesh.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium pt-1">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                <Lock className="w-3 h-3" />
              </span>
              <span>TLS 1.3 · Zero-IP Logging · Encrypted Evidence</span>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-[#475569]">
              <li>
                <Link href="/reports" className="hover:text-[#C62828] transition-colors">
                  Public Reports
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#C62828] transition-colors">
                  Reports on Map
                </Link>
              </li>
              <li>
                <Link href="/#categories" className="hover:text-[#C62828] transition-colors">
                  Explore Categories
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#C62828] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-[#C62828] transition-colors">
                  Track Your Report
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Safety & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Safety & Support
            </h4>
            <ul className="space-y-2.5 text-xs text-[#475569]">
              <li>
                <Link href="/safety" className="hover:text-[#C62828] transition-colors">
                  Personal Safety Center
                </Link>
              </li>
              <li>
                <Link href="/safety#guidelines" className="hover:text-[#C62828] transition-colors">
                  Reporting Guidelines
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#C62828] transition-colors">
                  Emergency Help (999, 109)
                </Link>
              </li>
              <li>
                <Link href="/safety#privacy" className="hover:text-[#C62828] transition-colors">
                  Privacy & Data Policy
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#C62828] transition-colors">
                  Public Statistics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              About
            </h4>
            <ul className="space-y-2.5 text-xs text-[#475569]">
              <li>
                <Link href="/methodology" className="hover:text-[#C62828] transition-colors">
                  Our Methodology
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-[#C62828] transition-colors">
                  Institutional Directory
                </Link>
              </li>
              <li>
                <Link href="/methodology#governance" className="hover:text-[#C62828] transition-colors">
                  Governance & Right of Reply
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#C62828] transition-colors font-medium text-[#111827]">
                  Reviewer Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Disclaimer Bar */}
        <div className="mt-12 pt-6 border-t border-[#E2E8F0] space-y-4">
          <p className="text-[11px] text-[#64748B] leading-relaxed max-w-4xl">
            <strong>Disclaimer:</strong> Every report registered on Jababdihi represents an allegation until
            independently verified in accordance with published evidentiary standards. Target institutions
            are afforded a formalized right of reply. Jababdihi does not operate as a judicial body or social naming-and-shaming board.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-4 pt-2">
            <p>© 2026 Jababdihi (জবাবদিহি). Bangladesh. All rights reserved.</p>

            <div className="flex items-center gap-3">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}
                className="hover:text-[#111827] font-medium"
              >
                {locale === 'bn' ? 'English Language' : 'বাংলা সংস্করণ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
