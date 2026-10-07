'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { INITIAL_CATEGORIES, EMERGENCY_HOTLINES, BANGLADESH_DIVISIONS } from '@/config/constants';
import {
  Shield,
  FileCheck,
  Lock,
  ArrowRight,
  Eye,
  AlertTriangle,
  ExternalLink,
  MapPin,
  Clock,
  Phone,
  CheckCircle,
  HelpCircle,
  Building,
  UserCheck,
  Scale,
  PlusCircle,
} from 'lucide-react';

export default function HomePage() {
  const { locale, t } = useI18n();

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-civic-navy to-civic-navyDark text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('hero.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            <span>{t('hero.title')}</span> <br className="hidden sm:inline" />
            <span className="text-emerald-400">{t('hero.titleAccent')}</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/80 leading-relaxed">
            {t('hero.description')}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/report" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{t('hero.primaryCta')}</span>
              </Button>
            </Link>

            <Link href="/reports" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-medium text-white border-white/30 hover:bg-white/10 text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <span>{t('hero.secondaryCta')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Civic Core Doctrine Badge */}
          <div className="pt-6 border-t border-white/10 text-[11px] text-white/60 tracking-wider uppercase font-semibold flex flex-wrap justify-center gap-3 sm:gap-6">
            <span>REPORT</span>
            <span>•</span>
            <span>PROTECT</span>
            <span>•</span>
            <span>REVIEW</span>
            <span>•</span>
            <span>VERIFY</span>
            <span>•</span>
            <span>REFER</span>
            <span>•</span>
            <span>TRACK</span>
          </div>
        </div>
      </section>

      {/* 2. LIVE CIVIC METRICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-xl border border-civic-slate-200 shadow-md">
          <div className="p-3 rounded-lg bg-civic-slate-50 border border-civic-slate-100 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-civic-navy">
              {locale === 'bn' ? '১,২৮৪' : '1,284'}
            </div>
            <div className="text-xs font-medium text-civic-slate-600 mt-1">
              {t('stats.totalReports')}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-amber-700">
              {locale === 'bn' ? '৪১২' : '412'}
            </div>
            <div className="text-xs font-medium text-amber-800 mt-1">
              {t('stats.underReview')}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {locale === 'bn' ? '৩২৪' : '324'}
            </div>
            <div className="text-xs font-medium text-emerald-800 mt-1">
              {t('stats.verified')}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-100 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-700">
              {locale === 'bn' ? '১৮৬' : '186'}
            </div>
            <div className="text-xs font-medium text-indigo-800 mt-1">
              {t('stats.referred')}
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 p-3 rounded-lg bg-civic-slate-50 border border-civic-slate-100 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-civic-slate-700">
              {locale === 'bn' ? '২৭২' : '272'}
            </div>
            <div className="text-xs font-medium text-civic-slate-600 mt-1">
              {t('stats.resolved')}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-civic-slate-500 mt-2.5">
          ℹ️ {t('stats.note')}
        </p>
      </section>

      {/* 3. HOW IT WORKS 4-STEP PIPELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-civic-navy">
            {locale === 'bn' ? 'প্ল্যাটফর্মটি কীভাবে কাজ করে' : 'How Reporting Works'}
          </h2>
          <p className="text-sm text-civic-slate-600 max-w-xl mx-auto">
            {locale === 'bn'
              ? 'গোপনীয়তা রক্ষা করে প্রতিবেদন দাখিল থেকে শুরু করে আইনি রেফারেল পর্যন্ত প্রতিটি পদক্ষেপ স্বচ্ছ।'
              : 'From protected citizen submission to rigorous human review and agency referral.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-civic-slate-200 relative">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-civic-navy text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-semibold text-base text-civic-slate-900">
                {locale === 'bn' ? '১. প্রতিবেদন দাখিল করুন' : '1. Submit Incident'}
              </h3>
              <p className="text-xs text-civic-slate-600 leading-relaxed">
                {locale === 'bn'
                  ? 'বেনামে বা গোপনীয়ভাবে বিবরণ এবং ভিডিও/নথি লিঙ্ক প্রদান করুন। কোনো অ্যাকাউন্ট বা আইপি লাগবে না।'
                  : 'Document what happened anonymously or confidentially. Attach direct files or external video links.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-civic-slate-200 relative">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-semibold text-base text-civic-slate-900">
                {locale === 'bn' ? '২. গোপন কোডে সুরক্ষিত ট্র্যাক' : '2. Cryptographic Tracking'}
              </h3>
              <p className="text-xs text-civic-slate-600 leading-relaxed">
                {locale === 'bn'
                  ? 'আপনার BD-2026 কোড ও গোপন পাসকি ব্যবহার করে যে কোনো সময় অগ্রগতি দেখুন ও তথ্য আপডেট করুন।'
                  : 'Receive your unique reference ID and secret passkey to monitor review progress privately.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-civic-slate-200 relative">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-semibold text-base text-civic-slate-900">
                {locale === 'bn' ? '৩. বস্তুনিষ্ঠ পর্যালোচনা' : '3. Objective Evidence Review'}
              </h3>
              <p className="text-xs text-civic-slate-600 leading-relaxed">
                {locale === 'bn'
                  ? 'প্রশিক্ষিত পর্যালোচক প্রমাণ ও নথি যাচাই করেন। ব্যক্তিগত নিরাপত্তা ক্ষুন্ন হতে পারে এমন তথ্য অপসারণ করা হয়।'
                  : 'Trained moderators inspect evidence, filter personal risks, and examine corroborating facts.'}
              </p>
            </CardContent>
          </Card>

          <Card className="border-civic-slate-200 relative">
            <CardContent className="p-6 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-semibold text-base text-civic-slate-900">
                {locale === 'bn' ? '৪. সংস্থা রেফারেল ও স্বচ্ছতা' : '4. Action & Agency Referral'}
              </h3>
              <p className="text-xs text-civic-slate-600 leading-relaxed">
                {locale === 'bn'
                  ? 'প্রয়োজনে জাতীয় মানবাধিকার কমিশন, লিগ্যাল এইড বা সংশ্লিষ্ট প্রতিষ্ঠানে ব্যবস্থা গ্রহণের জন্য পাঠানো হয়।'
                  : 'Credible cases are referred to legal aid or oversight bodies, and anonymized trends are published.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 4. INCIDENT CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-civic-navy">
              {locale === 'bn' ? 'প্রতিবেদন দাখিলের ক্ষেত্রসমূহ' : 'Reportable Incident Categories'}
            </h2>
            <p className="text-sm text-civic-slate-600 mt-1">
              {locale === 'bn'
                ? 'আইনশৃঙ্খলা, দুর্নীতি, শিক্ষা এবং জনস্বার্থ সংশ্লিষ্ট যে কোনো অনিয়ম নির্বাচন করুন।'
                : 'Select an incident classification to view guidelines and document a case.'}
            </p>
          </div>

          <Link href="/report">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <span>{locale === 'bn' ? 'সকল বিভাগ দেখুন' : 'Explore All Categories'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {INITIAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/report?category=${cat.code}`}
              className="group block p-4 rounded-lg border border-civic-slate-200 bg-white hover:border-civic-navy hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-md bg-civic-slate-100 group-hover:bg-civic-navy group-hover:text-white flex items-center justify-center text-civic-slate-700 transition-colors shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3 className="font-semibold text-sm text-civic-slate-900 group-hover:text-civic-navy transition-colors truncate">
                    {locale === 'bn' ? cat.name_bn : cat.name_en}
                  </h3>
                  <p className="text-xs text-civic-slate-500 line-clamp-2 leading-relaxed">
                    {locale === 'bn' ? cat.description_bn : cat.description_en}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. BANGLADESH MAP DIVISION BREAKDOWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-civic-slate-100 rounded-xl p-6 sm:p-8 border border-civic-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>{locale === 'bn' ? 'জাতীয় ভৌগোলিক তথ্য' : 'Geographic Accountability'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-civic-navy">
                {locale === 'bn' ? '৮ বিভাগে নাগরিক প্রতিবেদনের চিত্র' : 'Reports Across 8 Divisions'}
              </h2>
              <p className="text-xs sm:text-sm text-civic-slate-600 mt-1">
                {locale === 'bn'
                  ? 'ব্যক্তিগত নিরাপত্তা রক্ষার্থে সুনির্দিষ্ট ঠিকানা গোপন রেখে বিভাগ ও জেলা পর্যায়ে সার্বিক তথ্য প্রদর্শিত হয়।'
                  : 'Aggregated to Division and District levels to protect victim safety without pinpointing residences.'}
              </p>
            </div>

            <Link href="/map">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs whitespace-nowrap">
                <span>{locale === 'bn' ? 'ইন্টারেক্টিভ মানচিত্র খুলুন' : 'Open Full Map'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.keys(BANGLADESH_DIVISIONS).map((divName, idx) => {
              // Deterministic sample counts for divisions
              const counts = [482, 294, 142, 118, 76, 68, 59, 45];
              return (
                <div
                  key={divName}
                  className="bg-white p-3.5 rounded-lg border border-civic-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs sm:text-sm text-civic-slate-900">
                      {divName}
                    </div>
                    <div className="text-[11px] text-civic-slate-500">
                      {BANGLADESH_DIVISIONS[divName].length} Districts
                    </div>
                  </div>
                  <div className="text-xs font-bold text-civic-navy bg-civic-slate-100 px-2 py-1 rounded">
                    {locale === 'bn' ? `${counts[idx]}টি` : counts[idx]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. ETHICAL / LEGAL DISCLAIMER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-amber-900">
                {locale === 'bn' ? 'প্ল্যাটফর্মের আইনি নীতি ও নৈতিক সীমা' : 'Ethical Standard & Civic Policy'}
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed max-w-3xl">
                {locale === 'bn'
                  ? 'এই প্ল্যাটফর্মটি সামাজিক যোগাযোগ মাধ্যম বা কাউকে হেয় প্রতিপন্ন করার সাইট নয়। প্রতিটি দাখিলকৃত তথ্য প্রাথমিক অভিযোগ। প্রমাণ যাচাই ও প্রাতিষ্ঠানিক জবাবদিহিতা নিশ্চিত করাই আমাদের উদ্দেশ্য।'
                  : 'This platform is not a social gossip or naming-and-shaming board. Every submission is an allegation until appropriately reviewed and corroborated through our defined methodology.'}
              </p>
            </div>
          </div>

          <Link href="/methodology" className="shrink-0">
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs">
              {locale === 'bn' ? 'নীতিমালা পড়ুন' : 'Read Methodology'}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
