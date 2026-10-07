import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface RecentReport {
  id: string;
  title: string;
  location: string;
  timeAgo: string;
  category: string;
  categoryColor: string;
  image: string;
}

const RECENT_REPORTS: RecentReport[] = [
  {
    id: 'rep-01',
    title: 'Illegal construction blocking public road',
    location: 'Uttara, Dhaka',
    timeAgo: '2 hours ago',
    category: 'Infrastructure',
    categoryColor: 'bg-[#1E293B] text-[#93C5FD] border-[#334155]',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rep-02',
    title: 'Harassment at university by authority figure',
    location: 'Dhaka',
    timeAgo: '5 hours ago',
    category: 'Education',
    categoryColor: 'bg-[#3B0764] text-[#E9D5FF] border-[#581C87]',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rep-03',
    title: 'Police misconduct during a traffic stop',
    location: 'Chittagong',
    timeAgo: '1 day ago',
    category: 'Law Enforcement',
    categoryColor: 'bg-[#7F1D1D] text-[#FECACA] border-[#991B1B]',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rep-04',
    title: 'Corruption in government office',
    location: 'Khulna',
    timeAgo: '1 day ago',
    category: 'Corruption',
    categoryColor: 'bg-[#78350F] text-[#FDE68A] border-[#92400E]',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rep-05',
    title: 'Environmental violation near river',
    location: 'Savar, Dhaka',
    timeAgo: '2 days ago',
    category: 'Environment',
    categoryColor: 'bg-[#064E3B] text-[#A7F3D0] border-[#065F46]',
    image: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?auto=format&fit=crop&w=150&q=80',
  },
];

export function RecentReportsFloatingCard() {
  return (
    <div className="w-full max-w-[420px] rounded-[16px] bg-[#111827]/75 backdrop-blur-md border border-white/20 p-4 sm:p-5 text-white shadow-2xl">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
        <h3 className="font-bold text-[15px] sm:text-base text-white tracking-tight">
          Recent Reports
        </h3>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Reports List */}
      <div className="divide-y divide-white/10">
        {RECENT_REPORTS.map((item) => (
          <Link
            key={item.id}
            href={`/reports/${item.id}`}
            className="flex items-center gap-3 py-3 group hover:bg-white/5 rounded-lg px-1.5 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#374151] border border-white/10">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-xs font-semibold text-white/95 truncate group-hover:text-[#F87171] transition-colors leading-snug">
                {item.title}
              </h4>
              <div className="text-[11px] text-white/60">
                {item.location} · {item.timeAgo}
              </div>
              <div>
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.categoryColor}`}
                >
                  {item.category}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
