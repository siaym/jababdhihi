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
  Shield,
  ShieldCheck,
  Users,
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

const CATEGORIES: CategoryCardData[] = [
  {
    id: 'c1',
    name: 'Corruption',
    slug: 'corruption',
    reportCount: '1.2K',
    iconType: 'corruption',
  },
  {
    id: 'c2',
    name: 'Education',
    slug: 'education',
    reportCount: '980',
    iconType: 'education',
  },
  {
    id: 'c3',
    name: 'Law Enforcement',
    slug: 'police',
    reportCount: '860',
    iconType: 'law',
  },
  {
    id: 'c4',
    name: 'Public Services',
    slug: 'government',
    reportCount: '740',
    iconType: 'services',
  },
  {
    id: 'c5',
    name: 'Infrastructure',
    slug: 'public_space',
    reportCount: '690',
    iconType: 'infrastructure',
  },
  {
    id: 'c6',
    name: 'Health',
    slug: 'health',
    reportCount: '420',
    iconType: 'health',
  },
  {
    id: 'c7',
    name: 'Environment',
    slug: 'environment',
    reportCount: '380',
    iconType: 'environment',
  },
  {
    id: 'c8',
    name: 'Workplace',
    slug: 'workplace',
    reportCount: '350',
    iconType: 'workplace',
  },
  {
    id: 'c9',
    name: 'Others',
    slug: 'other',
    reportCount: '310',
    iconType: 'others',
  },
];

export default function HomePage() {
  const { locale } = useI18n();

  return (
    <div className="bg-[#F8F7F3] min-h-screen">
      {/* ===================================================================
          1. HERO SECTION (EXACT COMPOSITION MATCHING REFERENCE IMAGE)
         =================================================================== */}
      <section className="relative w-full overflow-hidden bg-[#0A0E17] min-h-[480px] lg:h-[530px] flex items-center">
        {/* Real Bangladesh Documentary Photograph (Dhaka Urban Infrastructure & Civic Life) */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1800&q=80"
            alt="Bangladesh civic life and public streets"
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1440px"
            className="object-cover object-center"
          />
        </div>

        {/* Serious Civic Vignette Overlay: Deep charcoal with subtle dark crimson undertone */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/82 to-[#180808]/88 backdrop-brightness-75" />

        {/* Hero Content Container */}
        <div className="relative max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            {/* Left Content (65% width to give breathing room) */}
            <div className="w-full lg:max-w-[64%] space-y-3.5 text-white">
              {/* English Headline (Refined: 12-15% smaller for optimal vertical hierarchy) */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-[1.12] text-white">
                A more accountable <br />
                Bangladesh — together.
              </h1>

              {/* Bangla Supporting Line */}
              <p className="text-lg sm:text-2xl font-bold font-bengali text-white/95 tracking-wide pt-0.5">
                দেখুন। জানান। জবাবদিহি নিশ্চিত করুন।
              </p>

              {/* Descriptive Paragraph */}
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-[560px] pt-0.5">
                Jababdihi is a people-powered platform to document and raise awareness about abuse,
                corruption, misconduct, and other public issues across Bangladesh. Your evidence can help
                create a safer, fairer society.
              </p>

              {/* CTA Buttons */}
              <div className="pt-1.5 flex flex-wrap items-center gap-3">
                {/* Primary Red Button */}
                <Link href="/report">
                  <button
                    type="button"
                    className="h-11 sm:h-11.5 px-5 sm:px-6 rounded-md bg-[#C62828] hover:bg-[#B71C1C] active:bg-[#991B1B] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Submit a Report</span>
                  </button>
                </Link>

                {/* Secondary Transparent/Border Button */}
                <Link href="/reports">
                  <button
                    type="button"
                    className="h-11 sm:h-11.5 px-5 sm:px-6 rounded-md bg-white/10 hover:bg-white/15 border border-white/40 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>Explore Reports</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Informative Trust & Methodology Pillars (3-Column Informative Element) */}
              <div className="pt-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-[620px]">
                <div className="flex items-start gap-2 bg-white/5 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[11px] sm:text-xs text-white block">Anonymous reporting</span>
                    <span className="text-[10px] text-white/70 block leading-tight">Your identity can remain protected.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/5 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[11px] sm:text-xs text-white block">Evidence-based review</span>
                    <span className="text-[10px] text-white/70 block leading-tight">Reports are reviewed before verification.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/5 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                  <Users className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[11px] sm:text-xs text-white block">Public interest</span>
                    <span className="text-[10px] text-white/70 block leading-tight">We prioritize community issues.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side on Desktop: Narrower Floating Recent Reports Card (35% width) */}
            <div className="hidden lg:flex shrink-0 justify-end w-[350px]">
              <RecentReportsFloatingCard />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile-Only In-Flow Recent Reports Section (prevents cramped hero on phone screens) */}
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
          {CATEGORIES.map((cat) => (
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
