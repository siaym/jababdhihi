'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { CategoryCard, CategoryCardData } from '@/components/home/CategoryCard';
import { RecentReportsFloatingCard } from '@/components/home/RecentReportsFloatingCard';
import { HomeMapPanel } from '@/components/home/HomeMapPanel';
import { LatestReportsFeed } from '@/components/home/LatestReportsFeed';
import {
  FileText,
  ArrowRight,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';

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
      <section className="relative w-full overflow-hidden bg-[#111827] min-h-[500px] lg:h-[530px] flex items-center">
        {/* Background Editorial Photograph of Bangladesh Civic Gathering & Martyrs Memorial */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=2000&q=80')`,
          }}
        />

        {/* Dark Editorial Overlay & Vignette ensuring high contrast white text */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/80 backdrop-brightness-75" />

        {/* Hero Content Container */}
        <div className="relative max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 lg:py-0">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
            {/* Left Content (Max width ~620px) */}
            <div className="w-full lg:max-w-[620px] space-y-4 text-white">
              {/* English Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.08] text-white">
                A more accountable <br />
                Bangladesh — together.
              </h1>

              {/* Bangla Supporting Line */}
              <p className="text-xl sm:text-2xl font-bold font-bengali text-white/95 tracking-wide pt-0.5">
                দেখুন। জানান। জবাবদিহি নিশ্চিত করুন।
              </p>

              {/* Descriptive Paragraph */}
              <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-[560px] pt-1">
                Jababdihi is a people-powered platform to document and raise awareness about abuse,
                corruption, misconduct, and other public issues across Bangladesh. Your evidence can help
                create a safer, fairer society.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                {/* Primary Red Button */}
                <Link href="/report">
                  <button
                    type="button"
                    className="h-11 sm:h-12 px-5 sm:px-6 rounded-md bg-[#C62828] hover:bg-[#B71C1C] active:bg-[#991B1B] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Submit a Report</span>
                  </button>
                </Link>

                {/* Secondary Transparent/Border Button */}
                <Link href="/reports">
                  <button
                    type="button"
                    className="h-11 sm:h-12 px-5 sm:px-6 rounded-md bg-white/10 hover:bg-white/15 border border-white/40 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors"
                  >
                    <span>Explore Reports</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-5 sm:gap-6 text-xs text-white/80 font-medium">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-white/70" />
                  <span>Anonymous Reporting</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Evidence-based</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-white/70" />
                  <span>Public Interest</span>
                </div>
              </div>
            </div>

            {/* Right Side: Floating Recent Reports Card */}
            <div className="w-full lg:w-auto shrink-0 flex justify-center lg:justify-end">
              <RecentReportsFloatingCard />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          2. CATEGORY SECTION ("Explore by Category")
         =================================================================== */}
      <section id="categories" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
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

        {/* 9 Category Cards Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-3.5">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* ===================================================================
          3. SPLIT SECTION: REPORTS ON MAP (LEFT) & LATEST REPORTS (RIGHT)
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
