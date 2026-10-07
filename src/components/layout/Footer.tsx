'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Shield, AlertCircle, Phone, Lock, FileText, CheckCircle } from 'lucide-react';
import { EMERGENCY_HOTLINES } from '@/config/constants';

export function Footer() {
  const { locale, t } = useI18n();

  return (
    <footer className="bg-civic-navy text-white border-t border-civic-navyDark">
      {/* Emergency Hotlines Strip */}
      <div className="bg-civic-navyDark/80 border-b border-white/10 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <Phone className="w-4 h-4 shrink-0" />
            <span>
              {locale === 'bn'
                ? 'জরুরি সহায়তা প্রয়োজন? টোল-ফ্রি জাতীয় হটলাইনসমূহে যোগাযোগ করুন:'
                : 'Need immediate emergency assistance? Official toll-free hotlines:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {EMERGENCY_HOTLINES.slice(0, 4).map((hl) => (
              <span key={hl.number} className="inline-flex items-center gap-1.5">
                <span className="text-white/70">
                  {locale === 'bn' ? hl.name_bn : hl.name_en}:
                </span>
                <span className="font-bold text-emerald-400 bg-white/10 px-1.5 py-0.5 rounded">
                  {hl.number}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-base tracking-tight">
                {t('nav.title')}
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {locale === 'bn'
                ? 'একটি নিরপেক্ষ, নিরাপদ ও প্রমাণভিত্তিক নাগরিক পর্যবেক্ষণ প্ল্যাটফর্ম। নাগরিকদের হয়রানি, দুর্নীতি ও ক্ষমতার অপব্যবহার নথিভুক্ত করতে সহায়তা করে।'
                : 'A secure, non-partisan, evidence-based civic platform empowering citizens to document abuse, corruption, and institutional violations.'}
            </p>
            <div className="pt-2 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>REPORT • REVIEW • VERIFY • REFER</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {locale === 'bn' ? 'প্ল্যাটফর্ম লিংক' : 'Platform Navigation'}
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/reports" className="hover:text-white transition-colors">
                  {t('nav.reports')}
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-white transition-colors">
                  {t('nav.map')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {t('nav.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/organizations" className="hover:text-white transition-colors">
                  {t('nav.organizations')}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-white transition-colors">
                  {t('nav.track')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Standards & Guidelines */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {locale === 'bn' ? 'পদ্ধতি ও সুরক্ষা' : 'Methodology & Safety'}
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  {t('nav.howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="/methodology" className="hover:text-white transition-colors">
                  {t('nav.methodology')}
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:text-white transition-colors">
                  {t('nav.safety')}
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-white transition-colors">
                  {t('nav.resources')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Reviewer Workspace
                </Link>
              </li>
            </ul>
          </div>

          {/* Civic Principles & Legal Disclaimers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {locale === 'bn' ? 'আইনি ও নৈতিক নীতি' : 'Civic & Legal Principles'}
            </h4>
            <div className="p-3 bg-white/5 rounded border border-white/10 space-y-2 text-[11px] text-white/70 leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {locale === 'bn' ? 'অভিযোগ বনাম প্রমাণ' : 'Allegation vs Proof'}
                </span>
              </div>
              <p>
                {t('footer.disclaimer')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>{t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>TLS 1.3 & Zero-IP Anonymous Architecture</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
