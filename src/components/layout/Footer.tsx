'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { useI18n, Locale } from '@/lib/i18n';
import { Lock, Globe } from 'lucide-react';

export function Footer() {
  const { locale, setLocale } = useI18n();

  return (
    <footer className="bg-white border-t border-[#E5E7EB] text-[#374151]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission Column */}
          <div className="space-y-3.5 md:col-span-1">
            <Logo size="md" href="/" />
            <p className="text-xs text-[#6B7280] leading-relaxed max-w-sm">
              Jababdihi is a citizen-powered platform for reporting, verifying, and documenting
              public misconduct, corruption, and safety hazards across Bangladesh.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#059669] font-medium pt-1">
              <Lock className="w-3.5 h-3.5 text-[#059669]" />
              <span>TLS 1.3 & Zero-IP Anonymous Reporting</span>
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#4B5563]">
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
                  Categories
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

          {/* Column 2: Resources & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Guidelines & Safety
            </h4>
            <ul className="space-y-2 text-xs text-[#4B5563]">
              <li>
                <Link href="/safety" className="hover:text-[#C62828] transition-colors">
                  Personal Safety Center
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-[#C62828] transition-colors">
                  Evidentiary Methodology
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#C62828] transition-colors">
                  Emergency Hotlines (999, 109)
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-[#C62828] transition-colors">
                  Institutional Directory
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#C62828] transition-colors">
                  Public Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Governance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
              Governance & Disclaimer
            </h4>
            <p className="text-xs text-[#6B7280] leading-relaxed">
              Every report on Jababdihi represents an allegation until independently verified according
              to published methodology. Target institutions are afforded an official right of reply.
            </p>
            <div className="pt-1">
              <Link
                href="/admin"
                className="inline-block text-xs font-semibold text-[#111827] hover:text-[#C62828]"
              >
                Reviewer & Moderator Portal →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] gap-4">
          <p>© 2026 Jababdihi (জবাবদিহি). Bangladesh. All rights reserved.</p>

          <div className="flex items-center gap-3">
            <Globe className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <button
              onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}
              className="hover:text-[#111827] font-medium"
            >
              {locale === 'bn' ? 'English Language' : 'বাংলা সংস্করণ'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
