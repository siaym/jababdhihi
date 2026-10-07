'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, MapPin, ArrowRight, ShieldCheck, Clock, FileCheck, CheckCircle, Paperclip } from 'lucide-react';

interface ReportCardItem {
  id: string;
  title: string;
  category: string;
  location: string;
  district: string;
  description: string;
  timeAgo: string;
  statusLabel: string;
  statusType: 'under_review' | 'verified' | 'referred' | 'resolved';
  evidenceCount: number;
  evidenceType: string;
}

const DEFAULT_LATEST_REPORTS: ReportCardItem[] = [
  {
    id: 'rep-001',
    title: 'Arbitrary extortion during vehicle documentation checkpoint',
    category: 'Police & Law Enforcement',
    location: 'Mirpur, Dhaka',
    district: 'Dhaka',
    description:
      'Citizen allegedly detained at a routine motorcycle checkpoint without grounds. Formal receipt for demanded inspection fee was refused.',
    timeAgo: '3 hours ago',
    statusLabel: 'UNDER REVIEW',
    statusType: 'under_review',
    evidenceCount: 2,
    evidenceType: 'Video recording & inspection slip',
  },
  {
    id: 'rep-002',
    title: 'Dormitory student ragging and unauthorized intimidation',
    category: 'Education & Campus',
    location: 'Hathazari, Chattogram',
    district: 'Chattogram',
    description:
      'First-year student subjected to late-night intimidation in campus dormitory guest room. Video and audio recordings submitted.',
    timeAgo: '7 hours ago',
    statusLabel: 'VERIFIED FINDING',
    statusType: 'verified',
    evidenceCount: 3,
    evidenceType: 'Corroborated audio & medical report',
  },
  {
    id: 'rep-003',
    title: 'Sub-registry office mutation fee irregularity and bribery demands',
    category: 'Corruption & Bribery',
    location: 'Boalia, Rajshahi',
    district: 'Rajshahi',
    description:
      'Service-seeker applying for standard land deed certification informed file would not move without unrecorded speed fee.',
    timeAgo: '1 day ago',
    statusLabel: 'REFERRED TO ACC',
    statusType: 'referred',
    evidenceCount: 2,
    evidenceType: 'Bank challan & audio log',
  },
];

export function LatestReportsFeed() {
  const [reports, setReports] = useState<ReportCardItem[]>(DEFAULT_LATEST_REPORTS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'under_review' | 'referred'>('all');

  useEffect(() => {
    fetch('/api/v1/public/reports?limit=6')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: ReportCardItem[] = json.data.map((r: any) => {
            const isVerified = r.verified_status === true || r.status === 'verified';
            const isReferred = r.status === 'referred';
            const isResolved = r.status === 'resolved';

            let statusLabel = 'UNDER REVIEW';
            let statusType: ReportCardItem['statusType'] = 'under_review';

            if (isVerified) {
              statusLabel = 'VERIFIED FINDING';
              statusType = 'verified';
            } else if (isReferred) {
              statusLabel = 'REFERRED TO ACC';
              statusType = 'referred';
            } else if (isResolved) {
              statusLabel = 'RESOLVED';
              statusType = 'resolved';
            }

            const district = r.district || r.division || 'Dhaka';
            const locationStr = [r.upazila_thana || r.area_landmark, district]
              .filter(Boolean)
              .join(', ') || 'Bangladesh';

            return {
              id: r.id || r.report_number,
              title: r.public_summary || r.description || 'Public interest allegation',
              category: r.category?.name_en || 'Public Service',
              location: locationStr,
              district,
              description: r.description || 'Documentation submitted to Jababdihi registry.',
              timeAgo: 'Recently logged',
              statusLabel,
              statusType,
              evidenceCount: r.evidence_count || 1,
              evidenceType: r.evidence_type || 'Audited evidence dossier',
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
            <span>✓ {label}</span>
          </span>
        );
      case 'referred':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-purple-50 text-purple-800 border border-purple-300">
            <FileCheck className="w-3 h-3 text-purple-600" />
            <span>{label}</span>
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-blue-50 text-blue-800 border border-blue-300">
            <CheckCircle className="w-3 h-3 text-blue-600" />
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
    if (activeFilter === 'referred') return item.statusType === 'referred';
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
          <h2 className="text-2xl sm:text-3xl font-black text-[#101828] tracking-tight">
            Latest Public Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#475467] mt-1">
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
                  ? 'bg-white text-[#101828] shadow-sm'
                  : 'hover:text-[#101828]'
              }`}
            >
              All Reports
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('under_review')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFilter === 'under_review'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'hover:text-[#101828]'
              }`}
            >
              Under Review
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('verified')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFilter === 'verified'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'hover:text-[#101828]'
              }`}
            >
              Verified
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('referred')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeFilter === 'referred'
                  ? 'bg-white text-purple-800 shadow-sm'
                  : 'hover:text-[#101828]'
              }`}
            >
              Referred
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

      {/* Editorial Report Cards Grid (Zero vanity metrics, verified subtle accent) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.map((item) => {
          const isVerified = item.statusType === 'verified';
          return (
            <div
              key={item.id}
              className={`group flex flex-col justify-between rounded-xl bg-white border p-5 shadow-sm hover:shadow-md hover:border-slate-400 transition-all text-left ${
                isVerified
                  ? 'border-emerald-200 border-l-[3.5px] border-l-emerald-600'
                  : 'border-[#E2E8F0]'
              }`}
            >
              <div className="space-y-3">
                {/* Prominent Status Badge First */}
                <div className="flex items-center justify-between gap-2">
                  {getStatusBadge(item.statusType, item.statusLabel)}
                  <span className="text-[11px] font-mono text-slate-400">
                    {item.category}
                  </span>
                </div>

                {/* Title with link to dossier */}
                <Link href={`/reports/${item.id}`} className="block">
                  <h3 className="font-bold text-sm sm:text-[15px] text-[#101828] group-hover:text-[#C62828] transition-colors leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </Link>

                {/* Location with direct navigation link to Map & Time */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Link
                    href={`/map?division=${encodeURIComponent(item.district)}`}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-[#C62828] hover:underline transition-colors font-medium"
                    title="View this region on the map"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
                    <span>{item.location}</span>
                  </Link>
                  <span className="text-slate-300">·</span>
                  <span>{item.timeAgo}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 pt-1">
                  {item.description}
                </p>
              </div>

              {/* Bottom Meta Row: Evidence indicator only (Zero vanity views/upvoting) */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px] text-slate-600 font-medium">
                  <Paperclip className="w-3 h-3 text-slate-400" />
                  <span>{item.evidenceCount} evidence files attached</span>
                </span>

                <Link
                  href={`/reports/${item.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#101828] hover:text-[#C62828] transition-colors"
                >
                  <span>View Case Dossier</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
