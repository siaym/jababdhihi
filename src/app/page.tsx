'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useI18n } from '@/lib/i18n';
import { CategoryCard, CategoryCardData } from '@/components/home/CategoryCard';
import { RecentReportsFloatingCard } from '@/components/home/RecentReportsFloatingCard';
import { AccountabilityDoctrineBanner } from '@/components/home/AccountabilityDoctrineBanner';
import { LatestReportsFeed } from '@/components/home/LatestReportsFeed';
import { FinalCtaSection } from '@/components/home/FinalCtaSection';
import {
  FileText,
  ArrowRight,
} from 'lucide-react';

// Lazy-load interactive map so it never blocks FCP/LCP or initial mobile paint
const HomeMapPanel = dynamic(
  () => import('@/components/home/HomeMapPanel').then((mod) => mod.HomeMapPanel),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
            Reports on Map
          </h2>
          <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
            See reports from across Bangladesh
          </p>
        </div>
        <div className="w-full h-[400px] sm:h-[440px] rounded-[16px] bg-[#E8ECEF] border border-[#E5E7EB] animate-pulse flex items-center justify-center">
          <span className="text-xs text-slate-400 font-medium">
            Loading Bangladesh map...
          </span>
        </div>
      </div>
    ),
  }
);

const DEFAULT_CATEGORIES: CategoryCardData[] = [
  {
    id: 'c1',
    index: '01',
    name: 'Corruption',
    nameBn: 'দুর্নীতি ও ঘুষ',
    slug: 'corruption',
    description: 'Bribery demands, extortion, procurement fraud, and abuse of public resources.',
    reportCount: 0,
    iconType: 'corruption',
  },
  {
    id: 'c2',
    index: '02',
    name: 'Education',
    nameBn: 'শিক্ষা ও ক্যাম্পাস',
    slug: 'education',
    description: 'University misconduct, dormitory ragging, illegal fees, and campus harassment.',
    reportCount: 0,
    iconType: 'education',
  },
  {
    id: 'c3',
    index: '03',
    name: 'Law Enforcement',
    nameBn: 'পুলিশ ও আইনশৃঙ্খলা',
    slug: 'police',
    description: 'Unlawful custody, extortion, excessive force, or refusal to take official FIR/GD.',
    reportCount: 0,
    iconType: 'law',
  },
  {
    id: 'c4',
    index: '04',
    name: 'Public Services',
    nameBn: 'সরকারি দপ্তর ও সেবা',
    slug: 'government',
    description: 'Administrative negligence, public utility bribery, and civil office harassment.',
    reportCount: 0,
    iconType: 'services',
  },
  {
    id: 'c5',
    index: '05',
    name: 'Infrastructure',
    nameBn: 'সড়ক ও অবকাঠামো',
    slug: 'public_space',
    description: 'Dangerous road defects, unauthorized commercial encroachment, and contractor fraud.',
    reportCount: 0,
    iconType: 'infrastructure',
  },
  {
    id: 'c6',
    index: '06',
    name: 'Health',
    nameBn: 'স্বাস্থ্য ও হাসপাতাল',
    slug: 'health',
    description: 'Government hospital medication withholding, illegal dispensary fees, and negligence.',
    reportCount: 0,
    iconType: 'health',
  },
  {
    id: 'c7',
    index: '07',
    name: 'Environment',
    nameBn: 'পরিবেশ ও নদী দূষণ',
    slug: 'environment',
    description: 'Illegal river encroachment, industrial toxic dumping, and ecological violations.',
    reportCount: 0,
    iconType: 'environment',
  },
  {
    id: 'c8',
    index: '08',
    name: 'Workplace',
    nameBn: 'কর্মক্ষেত্র ও শ্রম অধিকার',
    slug: 'workplace',
    description: 'Wage theft, unsafe labor conditions, abusive intimidation, and worker exploitation.',
    reportCount: 0,
    iconType: 'workplace',
  },
  {
    id: 'c9',
    index: '09',
    name: 'Others',
    nameBn: 'অন্যান্য জনস্বার্থ বিষয়',
    slug: 'other',
    description: 'Other public-interest violations, consumer fraud, and community safety hazards.',
    reportCount: 0,
    iconType: 'others',
  },
];

export default function HomePage() {
  const { locale } = useI18n();
  const [categories, setCategories] = React.useState<CategoryCardData[]>(DEFAULT_CATEGORIES);

  React.useEffect(() => {
    fetch('/api/v1/public/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.byCategory) {
          const byCat = json.data.byCategory as Record<string, number>;
          setCategories((prev) =>
            prev.map((c) => {
              const matchKey = Object.keys(byCat).find(
                (k) =>
                  k.toLowerCase().includes(c.name.toLowerCase()) ||
                  c.name.toLowerCase().includes(k.toLowerCase())
              );
              const count = matchKey && typeof byCat[matchKey] === 'number' ? byCat[matchKey] : 0;
              return {
                ...c,
                reportCount: count,
              };
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#F8F7F3] min-h-screen">
      {/* ===================================================================
          1. EDITORIAL CIVIC HERO SECTION
          - High-contrast charcoal canvas on left (#0F131A)
          - Dhaka documentary photography fully visible on right 56%
          - Directional feather gradient transition between dark & photo
          - Prominent typographic anchor on "Bangladesh — together."
          - Brand statement: "দেখুন। জানান। জবাবদিহি নিশ্চিত করুন।"
          - Restrained civic CTAs and inline trust line
          - Editorial Recent Reports activity feed floating naturally
         =================================================================== */}
      <section className="relative w-full overflow-hidden bg-[#0F131A] min-h-[580px] lg:h-[640px] flex items-center">
        {/* Right-Anchored Documentary Photograph (Dhaka Urban Civic Thoroughfare & Metro Infrastructure) */}
        <div className="absolute top-0 right-0 w-full lg:w-[56%] h-full overflow-hidden pointer-events-none">
          <Image
            src="/images/hero-bangladesh.jpg"
            alt="Dhaka civic street and citizens in Bangladesh"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 56vw"
            className="object-cover object-[72%_center]"
          />
          {/* Directional feather gradient: transitions smoothly from left dark charcoal into the photo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F131A] via-[#0F131A]/40 to-transparent hidden lg:block" />
          {/* Top & bottom gentle framing scrims */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F131A] via-transparent to-[#0F131A]/30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F131A]/40 via-transparent to-transparent" />
        </div>

        {/* Mobile vertical falloff */}
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F131A]/95 via-[#0F131A]/85 to-[#0F131A]" />
        </div>

        {/* Hero Content Container */}
        <div className="relative max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Left Content (Asymmetrical Editorial Column - 56% max-width) */}
            <div className="w-full lg:max-w-[56%] space-y-4 sm:space-y-5 text-white">
              {/* Eyebrow */}
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D32F2F]" />
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-slate-300">
                  Bangladesh · Civic Accountability
                </span>
              </div>

              {/* Headline with "Bangladesh" as visual anchor */}
              <h1 className="tracking-tight text-white leading-none">
                <span className="block text-2xl sm:text-3xl lg:text-[34px] font-normal text-slate-300 tracking-tight leading-snug">
                  A more accountable
                </span>
                <span className="block text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-white leading-[1.08] mt-1.5">
                  Bangladesh — together.
                </span>
              </h1>

              {/* Bangla Brand Statement */}
              <div className="pt-0.5">
                <p className="text-xl sm:text-2xl lg:text-[25px] font-bold font-bengali text-red-300/95 tracking-wide leading-snug">
                  দেখুন। জানান। জবাবদিহি নিশ্চিত করুন।
                </p>
                <div className="w-12 h-[2px] bg-red-600/50 mt-3" />
              </div>

              {/* Description */}
              <p className="text-sm sm:text-[15px] text-slate-300/85 leading-relaxed max-w-[500px]">
                Jababdihi gives citizens a safer way to document public-interest issues,
                submit evidence, and follow what happens after a report is made.
              </p>

              {/* Action CTAs */}
              <div className="pt-1.5 flex flex-wrap items-center gap-3.5">
                <Link href="/report">
                  <button
                    type="button"
                    className="h-11 px-6 rounded-md bg-[#C62828] hover:bg-[#B71C1C] active:bg-[#8E1717] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Submit a Report</span>
                  </button>
                </Link>

                <Link href="/reports">
                  <button
                    type="button"
                    className="h-11 px-5 rounded-md bg-transparent hover:bg-white/5 border border-white/20 hover:border-white/40 text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <span>Explore Reports</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>

              {/* Minimal Trust Line */}
              <div className="pt-2 text-xs sm:text-[13px] text-slate-400 font-normal tracking-normal flex items-center flex-wrap gap-2">
                <span>Anonymous reporting</span>
                <span className="text-slate-600">·</span>
                <span>Evidence-based review</span>
                <span className="text-slate-600">·</span>
                <span>Public interest</span>
              </div>
            </div>

            {/* Right Side: Floating Editorial Recent Reports Activity Feed */}
            <div className="hidden lg:flex shrink-0 justify-end w-[350px]">
              <RecentReportsFloatingCard />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-Only In-Flow Recent Reports Section */}
      <section className="block lg:hidden max-w-[1440px] mx-auto px-4 sm:px-6 pt-6">
        <div className="w-full">
          <RecentReportsFloatingCard />
        </div>
      </section>

      {/* ===================================================================
          2. ACCOUNTABILITY DOCTRINE BANNER (Overlapping Floating Transition)
         =================================================================== */}
      <AccountabilityDoctrineBanner className="relative z-20 -mt-6 sm:-mt-10 lg:-mt-12 pb-4 sm:pb-6" />

      {/* ===================================================================
          3. CATEGORY SECTION ("Explore by Category")
         =================================================================== */}
      <section id="categories" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C62828]">
                Civic Categories · ক্যাটাগরিভিত্তিক অনুসন্ধান
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Documented public-interest issues organized by institutional sector.
            </p>
          </div>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111827] hover:text-[#C62828] transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 9 Category Cards 3x3 Editorial Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* ===================================================================
          4. REPORTS ACROSS BANGLADESH SECTION (MAP + REGIONAL BREAKDOWN)
         =================================================================== */}
      <section className="bg-slate-50/70 border-t border-slate-200/80 py-12 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <HomeMapPanel />
        </div>
      </section>

      {/* ===================================================================
          5. LATEST REPORTS SECTION (STATUS-PROMINENT DOSSIERS)
         =================================================================== */}
      <section className="bg-white border-t border-slate-200/80 py-14 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <LatestReportsFeed />
        </div>
      </section>

      {/* ===================================================================
          6. FINAL CALL TO ACTION ("Do you have something to report?")
         =================================================================== */}
      <FinalCtaSection />
    </div>
  );
}
