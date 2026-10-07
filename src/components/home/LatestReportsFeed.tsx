'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, MapPin, Eye, ArrowRight, ShieldCheck, Clock, FileCheck } from 'lucide-react';

interface ReportCardItem {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  timeAgo: string;
  statusLabel: string;
  statusType: 'under_review' | 'verified' | 'referred' | 'in_progress';
  readersCount: string;
  evidenceCount: number;
}

const DEFAULT_LATEST_REPORTS: ReportCardItem[] = [
  {
    id: 'rep-001',
    title: 'Arbitrary extortion during vehicle documentation checkpoint',
    category: 'Police & Law Enforcement',
    location: 'Mirpur, Dhaka',
    description:
      'Citizen allegedly detained at a routine motorcycle checkpoint without grounds. Formal receipt for demanded inspection fee was refused.',
    timeAgo: '3 hours ago',
    statusLabel: 'UNDER REVIEW',
    statusType: 'under_review',
    readersCount: '1.2k readers',
    evidenceCount: 2,
  },
  {
    id: 'rep-002',
    title: 'Dormitory student ragging and unauthorized intimidation',
    category: 'Education & Campus',
    location: 'Hathazari, Chattogram',
    description:
      'First-year student subjected to late-night intimidation in campus dormitory guest room. Video and audio recordings submitted.',
    timeAgo: '7 hours ago',
    statusLabel: 'VERIFIED FINDING',
    statusType: 'verified',
    readersCount: '3.4k readers',
    evidenceCount: 3,
  },
  {
    id: 'rep-003',
    title: 'Sub-registry office mutation fee irregularity and bribery demands',
    category: 'Corruption & Bribery',
    location: 'Boalia, Rajshahi',
    description:
      'Service-seeker applying for standard land deed certification informed file would not move without unrecorded speed fee.',
    timeAgo: '1 day ago',
    statusLabel: 'REFERRED TO ACC',
    statusType: 'referred',
    readersCount: '2.1k readers',
    evidenceCount: 1,
  },
];

export function LatestReportsFeed() {
  const [reports, setReports] = useState<ReportCardItem[]>(DEFAULT_LATEST_REPORTS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'under_review'>('all');

  useEffect(() => {
    fetch('/api/v1/public/reports?limit=6')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: ReportCardItem[] = json.data.map((r: any) => {
            const isVerified = r.verified_status === true || r.status === 'verified';
            const isReferred = r.status === 'referred';
            let statusLabel = 'UNDER REVIEW';
            let statusType: ReportCardItem['statusType'] = 'under_review';

            if (isVerified) {
              statusLabel = 'VERIFIED FINDING';
              statusType = 'verified';
            } else if (isReferred) {
              statusLabel = 'REFERRED TO AUTHORITIES';
              statusType = 'referred';
            }

            const locationStr = [r.upazila_thana || r.area_landmark, r.district || r.division]
              .filter(Boolean)
              .join(', ') || 'Bangladesh';

            return {
              id: r.id || r.report_number,
              title: r.public_summary || r.description || 'Public interest allegation',
              category: r.category?.name_en || 'Public Service',
              location: locationStr,
              description: r.description || 'Documentation submitted to Jababdihi registry.',
              timeAgo: 'Recently logged',
              statusLabel,
              statusType,
              readersCount: 'Registry record',
              evidenceCount: r.evidence_count || 1,
            };
          });
          setReports(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const getStatusBadge = (type: ReportCardItem['statusType'], label: string) => {
    switch (type) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>{label}</span>
          </span>
        );
      case 'referred':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-purple-50 text-purple-800 border border-purple-300">
            <FileCheck className="w-3 h-3 text-purple-600" />
            <span>{label}</span>
          </span>
        );
      case 'under_review':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-50 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>{label}</span>
          </span>
        );
    }
  };

  const filteredReports = reports.filter((item) => {
    if (activeFilter === 'verified') return item.statusType === 'verified';
    if (activeFilter === 'under_review') return item.statusType === 'under_review';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C62828]">
              Public Intake Stream · সাম্প্রতিক প্রতিবেদন
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            Latest Public Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Civil allegations and verified public disclosures under active editorial review.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Filter Buttons */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFilter === 'all'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'hover:text-[#111827]'
              }`}
            >
              All Reports
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('verified')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFilter === 'verified'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'hover:text-[#111827]'
              }`}
            >
              Verified
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('under_review')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFilter === 'under_review'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'hover:text-[#111827]'
              }`}
            >
              Under Review
            </button>
          </div>

          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-black border border-slate-200 bg-white px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter</span>
          </Link>
        </div>
      </div>

      {/* Editorial Report Cards Grid (Status prominent, no popularity voting) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((item) => (
          <Link
            key={item.id}
            href={`/reports/${item.id}`}
            className="group flex flex-col justify-between rounded-xl bg-white border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md hover:border-slate-400 transition-all text-left"
          >
            <div className="space-y-3">
              {/* Prominent Status Badge First */}
              <div className="flex items-center justify-between gap-2">
                {getStatusBadge(item.statusType, item.statusLabel)}
                <span className="text-[11px] font-mono text-slate-400">
                  {item.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-sm sm:text-[15px] text-[#111827] group-hover:text-[#C62828] transition-colors leading-snug line-clamp-2">
                {item.title}
              </h3>

              {/* Location & Time */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{item.location}</span>
                <span className="text-slate-300">·</span>
                <span>{item.timeAgo}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 pt-1">
                {item.description}
              </p>
            </div>

            {/* Bottom Meta Row (Readers & Evidence, zero popularity upvoting) */}
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.readersCount}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#111827] group-hover:text-[#C62828] transition-colors">
                <span>View Case Dossier</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
