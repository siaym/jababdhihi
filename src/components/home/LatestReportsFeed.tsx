import React, { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, MapPin, Eye, ThumbsUp } from 'lucide-react';

interface LatestReportItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  location: string;
  description: string;
  timeAgo: string;
  views: string;
  supports: string;
  image: string;
}

const LATEST_REPORTS: LatestReportItem[] = [
  {
    id: 'rep-latest-1',
    title: 'Dangerous road condition causing accidents',
    category: 'Public Services',
    categoryColor: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
    location: 'Mirpur, Dhaka',
    description:
      'Large potholes causing frequent accidents. Authorities have been informed multiple times but no action has been taken.',
    timeAgo: '3 hours ago',
    views: '1.2K views',
    supports: '45 supports',
    image:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'rep-latest-2',
    title: 'Unauthorized fees charged at government hospital counter',
    category: 'Health',
    categoryColor: 'bg-[#FFE4E6] text-[#BE123C] border-[#FECDD3]',
    location: 'Sirajganj Sadar',
    description:
      'Emergency medicine dispensary withholding prescribed medicines unless arbitrary cash sums are paid directly to duty counter.',
    timeAgo: '7 hours ago',
    views: '840 views',
    supports: '32 supports',
    image:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80',
  },
];

export function LatestReportsFeed() {
  const [activeTab, setActiveTab] = useState<'latest' | 'viewed' | 'supported'>('latest');

  return (
    <div className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
          Latest Reports
        </h2>

        <div className="flex items-center gap-3">
          {/* Tab Switcher Pills */}
          <div className="flex items-center bg-[#F3F4F6] p-0.5 rounded-full text-xs font-semibold text-[#4B5563]">
            <button
              type="button"
              onClick={() => setActiveTab('latest')}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeTab === 'latest'
                  ? 'bg-[#111827] text-white shadow-sm'
                  : 'hover:text-[#111827]'
              }`}
            >
              Latest
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('viewed')}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeTab === 'viewed'
                  ? 'bg-[#111827] text-white shadow-sm'
                  : 'hover:text-[#111827]'
              }`}
            >
              Most Viewed
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('supported')}
              className={`px-3 py-1.5 rounded-full transition-all ${
                activeTab === 'supported'
                  ? 'bg-[#111827] text-white shadow-sm'
                  : 'hover:text-[#111827]'
              }`}
            >
              Most Supported
            </button>
          </div>

          {/* Filter Trigger Button */}
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#374151] hover:text-[#111827] border border-[#E5E7EB] bg-white px-3 py-1.5 rounded-md hover:bg-[#F9FAFB] transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>Filter</span>
          </Link>
        </div>
      </div>

      {/* Reports Feed List */}
      <div className="space-y-3.5">
        {LATEST_REPORTS.map((item) => (
          <Link
            key={item.id}
            href={`/reports/${item.id}`}
            className="group block rounded-[14px] bg-white border border-[#E5E7EB] p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-[#D1D5DB] transition-all"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Photo Thumbnail */}
              <div className="relative w-full sm:w-44 h-36 sm:h-auto rounded-lg overflow-hidden shrink-0 bg-[#F3F4F6] border border-[#E5E7EB]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Text Information */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-base text-[#111827] group-hover:text-[#C62828] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <span
                    className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${item.categoryColor}`}
                  >
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                  <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <span>{item.location}</span>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2">
                  {item.description}
                </p>

                {/* Metadata Row */}
                <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-[#6B7280] border-t border-[#F3F4F6]">
                  <span>{item.timeAgo}</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>{item.views}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5 text-[#9CA3AF]" />
                    <span>{item.supports}</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
