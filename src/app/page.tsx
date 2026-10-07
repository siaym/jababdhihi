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
import {
  FileText,
  ArrowRight,
  Check,
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
    name: 'Corruption',
    slug: 'corruption',
    reportCount: 'Active',
    iconType: 'corruption',
  },
  {
    id: 'c2',
    name: 'Education',
    slug: 'education',
    reportCount: 'Active',
    iconType: 'education',
  },
  {
    id: 'c3',
    name: 'Law Enforcement',
    slug: 'police',
    reportCount: 'Active',
    iconType: 'law',
  },
  {
    id: 'c4',
    name: 'Public Services',
    slug: 'government',
    reportCount: 'Active',
    iconType: 'services',
  },
  {
    id: 'c5',
    name: 'Infrastructure',
    slug: 'public_space',
    reportCount: 'Active',
    iconType: 'infrastructure',
  },
  {
    id: 'c6',
    name: 'Health',
    slug: 'health',
    reportCount: 'Active',
    iconType: 'health',
  },
  {
    id: 'c7',
    name: 'Environment',
    slug: 'environment',
    reportCount: 'Active',
    iconType: 'environment',
  },
  {
    id: 'c8',
    name: 'Workplace',
    slug: 'workplace',
    reportCount: 'Active',
    iconType: 'workplace',
  },
  {
    id: 'c9',
    name: 'Others',
    slug: 'other',
    reportCount: 'Active',
    iconType: 'others',
  },
];

export default function HomePage() {
  const { locale } = useI18n();
  const [categories, setCategories] = React.useState<CategoryCardData[]>(DEFAULT_CATEGORIES);
  const [statsSummary, setStatsSummary] = React.useState<{
    totalReports: number;
    divisionCount: number;
  } | null>(null);

  React.useEffect(() => {
    fetch('/api/v1/public/stats')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          if (json.data.byCategory) {
            const byCat = json.data.byCategory as Record<string, number>;
            setCategories((prev) =>
              prev.map((c) => {
                const matchKey = Object.keys(byCat).find(
                  (k) =>
                    k.toLowerCase().includes(c.name.toLowerCase()) ||
                    c.name.toLowerCase().includes(k.toLowerCase())
                );
                const count = matchKey ? byCat[matchKey] : 0;
                return {
                  ...c,
                  reportCount: count > 0 ? String(count) : 'Active',
                };
              })
            );
          }
          const total = typeof json.data.totalReports === 'number' ? json.data.totalReports : 0;
          const divCount = json.data.byDivision ? Object.keys(json.data.byDivision).length : 0;
          setStatsSummary({ totalReports: total, divisionCount: divCount });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#F8F7F3] min-h-screen">
      {/* ===================================================================
          1. REDESIGNED EDITORIAL HERO SECTION
          - Documentary 35mm photo of Dhaka civic life & infrastructure
          - Asymmetric gradient: left deep dark -> center dark translucent -> right visible photo
          - Authoritative civic journalism hierarchy
          - Clean horizontal trust strip & live real registry stats
          - Floating translucent editorial Recent Reports panel
         =================================================================== */}
      <section className="relative w-full overflow-hidden bg-[#070A11] min-h-[500px] lg:min-h-[560px] py-10 lg:py-14 flex items-center">
        {/* Real Bangladesh Documentary Photograph (Dhaka Urban Civic Boulevard & Metro Infrastructure) */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bangladesh.jpg"
            alt="Dhaka civic boulevard and public life in Bangladesh"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1440px"
            className="object-cover object-[center_35%]"
          />
        </div>

        {/* Directional Asymmetric Gradient Overlay */}
        {/* Desktop: left very dark (for high text contrast) -> center dark translucent -> right photograph visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070B13] via-[#070B13]/85 to-[#070B13]/35 hidden md:block" />
        {/* Mobile vertical falloff */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070B13]/95 via-[#070B13]/90 to-[#070B13]/70 md:hidden" />
        {/* Subtle atmospheric top and bottom framing scrim */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070B13]/50 via-transparent to-[#070B13]/85 pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            {/* Left Content (Asymmetrical Editorial Column) */}
            <div className="w-full lg:max-w-[62%] space-y-4 text-white">
              {/* Eyebrow */}
              <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-slate-300/90">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E53935]" />
                <span>Bangladesh · Civic Accountability</span>
              </div>

              {/* English Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight leading-[1.15] text-white">
                A more accountable <br className="hidden sm:inline" />
                Bangladesh — together.
              </h1>

              {/* Bangla Secondary Headline */}
              <p className="text-xl sm:text-2xl font-bold font-bengali text-red-100/90 tracking-wide">
                দেখুন। জানান। জবাবদিহি নিশ্চিত করুন।
              </p>

              {/* Editorial Description */}
              <p className="text-sm sm:text-[15px] text-slate-300/90 leading-relaxed max-w-[540px]">
                Jababdihi gives citizens a safer way to document public-interest issues,
                submit evidence, and follow what happens after a report is made.
              </p>

              {/* CTA Buttons */}
              <div className="pt-1.5 flex flex-wrap items-center gap-3">
                {/* Primary Civic Red Button */}
                <Link href="/report">
                  <button
                    type="button"
                    className="h-11 px-6 rounded-md bg-[#C62828] hover:bg-[#B71C1C] active:bg-[#991B1B] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-red-950/40 transition-all hover:shadow-red-900/50"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Submit a Report</span>
                  </button>
                </Link>

                {/* Secondary Transparent/Border Button */}
                <Link href="/reports">
                  <button
                    type="button"
                    className="h-11 px-5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] border border-white/25 hover:border-white/40 text-white text-sm font-medium flex items-center gap-2 backdrop-blur-sm transition-all"
                  >
                    <span>Explore Reports</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Clean Horizontal Trust Strip */}
              <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-[13px] text-slate-300/85">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span>Anonymous reporting</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span>Evidence-based review</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span>Public interest</span>
                </span>
              </div>

              {/* Subtle Live Activity Indicator (Strictly Real Database Values) */}
              {statsSummary && statsSummary.totalReports > 0 ? (
                <div className="pt-3 flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 border-t border-white/10 max-w-[500px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    <strong className="text-white font-semibold">{statsSummary.totalReports}</strong> civic reports recorded
                    {statsSummary.divisionCount > 0 ? (
                      <> across <strong className="text-white font-semibold">{statsSummary.divisionCount}</strong> administrative divisions</>
                    ) : null}
                  </span>
                </div>
              ) : (
                <div className="pt-3 flex items-center gap-2 text-[11px] sm:text-xs text-slate-400 border-t border-white/10 max-w-[500px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Public accountability registry active</span>
                </div>
              )}
            </div>

            {/* Right Side: Floating Editorial Recent Reports Panel (Translucent & Natural) */}
            <div className="hidden lg:flex shrink-0 justify-end w-[360px]">
              <RecentReportsFloatingCard />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-Only In-Flow Recent Reports Section */}
      <section className="block lg:hidden max-w-[1440px] mx-auto px-4 sm:px-6 pt-5">
        <div className="w-full">
          <RecentReportsFloatingCard />
        </div>
      </section>

      {/* ===================================================================
          2. ACCOUNTABILITY DOCTRINE BANNER ("Reports are not verdicts")
         =================================================================== */}
      <AccountabilityDoctrineBanner />

      {/* ===================================================================
          3. CATEGORY SECTION ("Explore by Category")
         =================================================================== */}
      <section id="categories" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight">
            Explore by Category
          </h2>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#111827] hover:text-[#C62828] transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 9 Category Cards Horizontal Grid with Restrained Civic Styling */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5 sm:gap-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* ===================================================================
          4. SPLIT SECTION: REPORTS ON MAP (LEFT) & LATEST REPORTS (RIGHT)
         =================================================================== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 of 12 cols): Reports on Map */}
          <div className="lg:col-span-5">
            <HomeMapPanel />
          </div>

          {/* Right Column (7 of 12 cols): Latest Reports */}
          <div className="lg:col-span-7">
            <LatestReportsFeed />
          </div>
        </div>
      </section>
    </div>
  );
}
