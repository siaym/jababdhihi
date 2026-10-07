'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ReportItem {
  id: string;
  type: 'allegation' | 'report' | 'verified' | 'referred';
  typeLabel: string;
  title: string;
  location: string;
  timeAgo: string;
  statusLabel: string;
  statusColor: 'amber' | 'sky' | 'emerald' | 'purple';
}

const DEFAULT_EDITORIAL_REPORTS: ReportItem[] = [
  {
    id: 'rep-001',
    type: 'allegation',
    typeLabel: 'Allegation',
    title: 'Unauthorized road obstruction & market encroachment',
    location: 'Sector 11, Uttara · Dhaka',
    timeAgo: '2h ago',
    statusLabel: 'UNDER REVIEW',
    statusColor: 'amber',
  },
  {
    id: 'rep-002',
    type: 'report',
    typeLabel: 'Report',
    title: 'Dormitory student ragging & unauthorized intimidation',
    location: 'Hathazari · Chattogram',
    timeAgo: '5h ago',
    statusLabel: 'REVIEW IN PROGRESS',
    statusColor: 'sky',
  },
  {
    id: 'rep-003',
    type: 'verified',
    typeLabel: 'Verified',
    title: 'River boundary illegal landfill violation inspected',
    location: 'Karnaphuli · Chattogram',
    timeAgo: '2d ago',
    statusLabel: 'VERIFIED FINDING',
    statusColor: 'emerald',
  },
];

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'recently';
  const diff = Date.now() - new Date(dateString).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentReportsFloatingCard() {
  const [reports, setReports] = useState<ReportItem[]>(DEFAULT_EDITORIAL_REPORTS);

  useEffect(() => {
    fetch('/api/v1/public/reports?limit=3')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: ReportItem[] = json.data.slice(0, 3).map((r: any) => {
            const isVerified = r.verified_status === true || r.status === 'verified';
            const isReferred = r.status === 'referred';
            const isReview = r.status === 'under_review';

            let type: ReportItem['type'] = 'allegation';
            let typeLabel = 'Allegation';
            let statusLabel = 'UNDER REVIEW';
            let statusColor: ReportItem['statusColor'] = 'amber';

            if (isVerified) {
              type = 'verified';
              typeLabel = 'Verified';
              statusLabel = 'VERIFIED FINDING';
              statusColor = 'emerald';
            } else if (isReferred) {
              type = 'referred';
              typeLabel = 'Referred';
              statusLabel = 'REFERRED TO AUTHORITIES';
              statusColor = 'purple';
            } else if (!isReview) {
              type = 'report';
              typeLabel = 'Report';
              statusLabel = 'REVIEW IN PROGRESS';
              statusColor = 'sky';
            }

            const location = [r.upazila_thana || r.area_landmark, r.district || r.division]
              .filter(Boolean)
              .join(', ');

            return {
              id: r.id || r.report_number,
              type,
              typeLabel,
              title: r.public_summary || r.description || 'Public interest allegation',
              location: location || 'Bangladesh',
              timeAgo: formatTimeAgo(r.created_at),
              statusLabel,
              statusColor,
            };
          });
          setReports(mapped);
        }
      })
      .catch(() => {
        // Fall back gracefully to DEFAULT_EDITORIAL_REPORTS
      });
  }, []);

  const getDotClass = (color: ReportItem['statusColor']) => {
    switch (color) {
      case 'emerald':
        return 'text-emerald-400';
      case 'sky':
        return 'text-sky-400';
      case 'purple':
        return 'text-purple-400';
      case 'amber':
      default:
        return 'text-amber-400';
    }
  };

  const getBadgeClass = (color: ReportItem['statusColor']) => {
    switch (color) {
      case 'emerald':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
      case 'sky':
        return 'text-sky-300 bg-sky-500/10 border-sky-500/20';
      case 'purple':
        return 'text-purple-300 bg-purple-500/10 border-purple-500/20';
      case 'amber':
      default:
        return 'text-amber-300 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="w-full max-w-[360px] rounded-xl bg-[#090F1C]/75 backdrop-blur-xl border border-white/10 p-5 text-white shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
          Recent Reports
        </span>
        <Link
          href="/reports"
          className="group inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Reports List */}
      <div className="divide-y divide-white/10">
        {reports.map((item) => (
          <Link
            key={item.id}
            href={`/reports/${item.id}`}
            className="block py-3.5 first:pt-3.5 last:pb-1 group transition-colors"
          >
            {/* Category / Allegation Type */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <span className={`text-[10px] ${getDotClass(item.statusColor)}`}>●</span>
              <span>{item.typeLabel}</span>
            </div>

            {/* Title / Summary */}
            <h4 className="text-xs sm:text-[13px] font-medium text-white/95 leading-snug line-clamp-1 mt-1 group-hover:text-red-300 transition-colors">
              {item.title}
            </h4>

            {/* Location & Time */}
            <div className="text-[11px] text-slate-400 mt-1">
              {item.location} · {item.timeAgo}
            </div>

            {/* Editorial Status Badge */}
            <div className="mt-2">
              <span
                className={`inline-block font-mono text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded border ${getBadgeClass(
                  item.statusColor
                )}`}
              >
                {item.statusLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
