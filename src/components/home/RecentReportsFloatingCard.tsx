'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface EditorialReport {
  id: string;
  title: string;
  location: string;
  timeAgo?: string;
  statusLabel: string;
  dotColor: string;
  statusColor: string;
}

const DEFAULT_EDITORIAL_REPORTS: EditorialReport[] = [
  {
    id: 'rep-001',
    title: 'Unauthorized road obstruction',
    location: 'Uttara · 2h ago',
    statusLabel: 'UNDER REVIEW',
    dotColor: 'text-amber-400',
    statusColor: 'text-amber-300/90',
  },
  {
    id: 'rep-002',
    title: 'Dormitory student harassment',
    location: 'Chattogram · 5h ago',
    statusLabel: 'REVIEW IN PROGRESS',
    dotColor: 'text-sky-400',
    statusColor: 'text-sky-300/90',
  },
  {
    id: 'rep-003',
    title: 'River boundary violation',
    location: 'Chattogram · 2d ago',
    statusLabel: 'VERIFIED FINDING',
    dotColor: 'text-emerald-400',
    statusColor: 'text-emerald-300/90',
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
  const [reports, setReports] = useState<EditorialReport[]>(DEFAULT_EDITORIAL_REPORTS);

  useEffect(() => {
    fetch('/api/v1/public/reports?limit=3')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: EditorialReport[] = json.data.slice(0, 3).map((r: any) => {
            const isVerified = r.verified_status === true || r.status === 'verified';
            const isReferred = r.status === 'referred';
            const isReview = r.status === 'under_review';

            let statusLabel = 'UNDER REVIEW';
            let dotColor = 'text-amber-400';
            let statusColor = 'text-amber-300/90';

            if (isVerified) {
              statusLabel = 'VERIFIED FINDING';
              dotColor = 'text-emerald-400';
              statusColor = 'text-emerald-300/90';
            } else if (isReferred) {
              statusLabel = 'REFERRED TO ACC';
              dotColor = 'text-purple-400';
              statusColor = 'text-purple-300/90';
            } else if (!isReview) {
              statusLabel = 'REVIEW IN PROGRESS';
              dotColor = 'text-sky-400';
              statusColor = 'text-sky-300/90';
            }

            const locationCity = r.district || r.division || r.upazila_thana || 'Bangladesh';

            return {
              id: r.id || r.report_number,
              title: r.public_summary || r.description || 'Public interest allegation',
              location: `${locationCity} · ${formatTimeAgo(r.created_at)}`,
              statusLabel,
              dotColor,
              statusColor,
            };
          });
          setReports(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="w-full max-w-[340px] sm:max-w-[350px] rounded-lg bg-[#0E131C]/90 border border-white/12 p-5 text-white shadow-2xl shadow-black/50">
      {/* Editorial Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
          Recent reports
        </span>
        <Link
          href="/reports"
          className="group inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Reports Feed */}
      <div className="divide-y divide-white/10">
        {reports.map((item) => (
          <Link
            key={item.id}
            href={`/reports/${item.id}`}
            className="block py-3.5 first:pt-3.5 last:pb-1 group transition-colors"
          >
            {/* Top Line: Dot + Title */}
            <div className="flex items-start gap-2">
              <span className={`text-[11px] leading-tight mt-0.5 shrink-0 ${item.dotColor}`}>
                ●
              </span>
              <h4 className="text-[13px] font-medium text-white/95 leading-snug line-clamp-2 group-hover:text-red-300 transition-colors">
                {item.title}
              </h4>
            </div>

            {/* Location & Time */}
            <div className="text-xs text-slate-400 pl-4 mt-1">
              {item.location}
            </div>

            {/* Restrained Editorial Status Label */}
            <div className={`text-[10px] font-mono tracking-widest uppercase font-semibold pl-4 mt-1.5 ${item.statusColor}`}>
              {item.statusLabel}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
