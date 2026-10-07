import React from 'react';
import Link from 'next/link';
import { ArrowRight, FileCheck, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface RecentReport {
  id: string;
  allegationPrefix: string;
  summary: string;
  location: string;
  timeAgo: string;
  category: string;
  statusLabel: string;
  statusType: 'under_review' | 'review_in_progress' | 'verified_finding' | 'referred';
  evidenceType: 'document' | 'video' | 'photo';
  image: string;
}

const RECENT_REPORTS: RecentReport[] = [
  {
    id: 'rep-01',
    allegationPrefix: 'Allegation',
    summary: 'Unauthorized road obstruction & commercial encroachment',
    location: 'Sector 11, Uttara · Dhaka',
    timeAgo: '2h ago',
    category: 'Infrastructure',
    statusLabel: 'Under Review',
    statusType: 'under_review',
    evidenceType: 'photo',
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rep-02',
    allegationPrefix: 'Report',
    summary: 'Dormitory student ragging & unauthorized intimidation',
    location: 'Hathazari · Chattogram',
    timeAgo: '5h ago',
    category: 'Education',
    statusLabel: 'Review In Progress',
    statusType: 'review_in_progress',
    evidenceType: 'document',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rep-03',
    allegationPrefix: 'Allegation',
    summary: 'Unreceipted speed-fee demanded during vehicle document check',
    location: 'Mirpur 10 · Dhaka',
    timeAgo: '1d ago',
    category: 'Law Enforcement',
    statusLabel: 'Under Review',
    statusType: 'under_review',
    evidenceType: 'video',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rep-04',
    allegationPrefix: 'Verified',
    summary: 'River boundary illegal landfill violation inspected',
    location: 'Karnaphuli · Chattogram',
    timeAgo: '2d ago',
    category: 'Environment',
    statusLabel: 'Verified Finding',
    statusType: 'verified_finding',
    evidenceType: 'photo',
    image: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'rep-05',
    allegationPrefix: 'Referred',
    summary: 'Sub-registry office mutation fee irregularity dossier',
    location: 'Boalia · Rajshahi',
    timeAgo: '3d ago',
    category: 'Corruption',
    statusLabel: 'Referred to ACC',
    statusType: 'referred',
    evidenceType: 'document',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=150&q=80',
  },
];

export function RecentReportsFloatingCard() {
  const getStatusBadge = (type: RecentReport['statusType'], label: string) => {
    switch (type) {
      case 'verified_finding':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span>{label}</span>
          </span>
        );
      case 'review_in_progress':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-950/70 text-sky-300 border border-sky-500/40">
            <Clock className="w-2.5 h-2.5" />
            <span>{label}</span>
          </span>
        );
      case 'referred':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-500/40">
            <FileCheck className="w-2.5 h-2.5" />
            <span>{label}</span>
          </span>
        );
      case 'under_review':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/40">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>{label}</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[340px] sm:max-w-[350px] rounded-[14px] bg-[#0B132B]/90 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 text-white shadow-2xl">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-white tracking-tight flex items-center gap-1.5">
            <span>Recent Reports</span>
            <span className="text-[10px] font-normal text-white/50">(লাইভ ফিড)</span>
          </h3>
          <p className="text-[10px] text-white/60">Legally classified allegations under review</p>
        </div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-white/80 hover:text-white transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Reports List */}
      <div className="divide-y divide-white/10">
        {RECENT_REPORTS.map((item) => (
          <Link
            key={item.id}
            href={`/reports/${item.id}`}
            className="flex items-start gap-2.5 py-2.5 group hover:bg-white/5 rounded-lg px-1 transition-colors"
          >
            {/* Safe Redacted/Evidence Thumbnail */}
            <div className="relative w-10 h-10 rounded-md overflow-hidden shrink-0 bg-[#1E293B] border border-white/10 mt-0.5">
              <img
                src={item.image}
                alt={item.summary}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <span className="text-[9px] font-mono text-white/80 bg-black/60 px-1 rounded uppercase">
                  {item.evidenceType}
                </span>
              </div>
            </div>

            {/* Content with Legally Precise Allegation Prefix */}
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="text-[11px] sm:text-xs font-semibold text-white/95 truncate group-hover:text-[#F87171] transition-colors leading-snug">
                <span className="text-[#FCA5A5] font-bold mr-1">[{item.allegationPrefix}]</span>
                {item.summary}
              </h4>
              <div className="text-[10px] text-white/60">
                {item.location} · {item.timeAgo}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {getStatusBadge(item.statusType, item.statusLabel)}
                <span className="text-[9px] text-white/50 font-medium">{item.category}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
