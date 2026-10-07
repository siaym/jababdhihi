'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Minus,
  Maximize2,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Clock,
  FileCheck,
  CheckCircle,
  Filter,
} from 'lucide-react';

interface DivisionData {
  id: string;
  name: string;
  nameBn: string;
  total: number;
  underReview: number;
  verified: number;
  referred: number;
  resolved: number;
  recentAreas: string[];
  primaryStatus: 'under_review' | 'verified' | 'referred' | 'resolved';
  mapCoords: { x: number; y: number };
}

const DIVISIONS_DATA: Record<string, DivisionData> = {
  Dhaka: {
    id: 'dhaka',
    name: 'Dhaka',
    nameBn: 'ঢাকা',
    total: 34,
    underReview: 12,
    verified: 8,
    referred: 3,
    resolved: 11,
    recentAreas: ['Mirpur', 'Uttara', 'Motijheel', 'Dhanmondi'],
    primaryStatus: 'verified',
    mapCoords: { x: 275, y: 260 },
  },
  Chattogram: {
    id: 'chattogram',
    name: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    total: 21,
    underReview: 8,
    verified: 6,
    referred: 2,
    resolved: 5,
    recentAreas: ['Hathazari', 'Karnaphuli', 'Pahartali'],
    primaryStatus: 'under_review',
    mapCoords: { x: 380, y: 340 },
  },
  Rajshahi: {
    id: 'rajshahi',
    name: 'Rajshahi',
    nameBn: 'রাজশাহী',
    total: 15,
    underReview: 4,
    verified: 5,
    referred: 3,
    resolved: 3,
    recentAreas: ['Boalia', 'Pabna Sadar', 'Natore'],
    primaryStatus: 'referred',
    mapCoords: { x: 130, y: 220 },
  },
  Khulna: {
    id: 'khulna',
    name: 'Khulna',
    nameBn: 'খুলনা',
    total: 11,
    underReview: 5,
    verified: 3,
    referred: 1,
    resolved: 2,
    recentAreas: ['Khulna Sadar', 'Jessore', 'Kushtia'],
    primaryStatus: 'under_review',
    mapCoords: { x: 170, y: 330 },
  },
  Sylhet: {
    id: 'sylhet',
    name: 'Sylhet',
    nameBn: 'সিলেট',
    total: 9,
    underReview: 2,
    verified: 4,
    referred: 1,
    resolved: 2,
    recentAreas: ['Sylhet Sadar', 'Moulvibazar', 'Habiganj'],
    primaryStatus: 'verified',
    mapCoords: { x: 380, y: 160 },
  },
  Barishal: {
    id: 'barishal',
    name: 'Barishal',
    nameBn: 'বরিশাল',
    total: 7,
    underReview: 3,
    verified: 2,
    referred: 1,
    resolved: 1,
    recentAreas: ['Barishal Sadar', 'Bhola', 'Patuakhali'],
    primaryStatus: 'resolved',
    mapCoords: { x: 250, y: 370 },
  },
  Rangpur: {
    id: 'rangpur',
    name: 'Rangpur',
    nameBn: 'রংপুর',
    total: 8,
    underReview: 3,
    verified: 3,
    referred: 1,
    resolved: 1,
    recentAreas: ['Rangpur Sadar', 'Dinajpur', 'Kurigram'],
    primaryStatus: 'under_review',
    mapCoords: { x: 160, y: 100 },
  },
  Mymensingh: {
    id: 'mymensingh',
    name: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    total: 6,
    underReview: 2,
    verified: 2,
    referred: 1,
    resolved: 1,
    recentAreas: ['Mymensingh Sadar', 'Jamalpur', 'Netrokona'],
    primaryStatus: 'under_review',
    mapCoords: { x: 250, y: 160 },
  },
};

export function HomeMapPanel() {
  const [selectedDivision, setSelectedDivision] = useState<string>('Dhaka');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'under_review' | 'referred'>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const activeDiv = DIVISIONS_DATA[selectedDivision] || DIVISIONS_DATA.Dhaka;

  const getStatusColor = (status: DivisionData['primaryStatus']) => {
    switch (status) {
      case 'verified':
        return '#16A34A'; // emerald
      case 'referred':
        return '#7C3AED'; // purple
      case 'resolved':
        return '#2563EB'; // blue
      case 'under_review':
      default:
        return '#F59E0B'; // amber
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C62828]">
              Geographic Discovery · ভৌগোলিক অনুসন্ধান
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#101828] tracking-tight">
            Reports across Bangladesh
          </h2>
          <p className="text-xs sm:text-sm text-[#475467] mt-1">
            See where public-interest reports and citizen allegations are being submitted.
          </p>
        </div>

        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#101828] hover:text-[#C62828] transition-colors"
        >
          <span>Open Full Interactive Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Bar directly above Map */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-xl border border-[#E4E7EC] text-xs">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Reports
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('under_review')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              statusFilter === 'under_review'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Under Review</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('verified')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              statusFilter === 'verified'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Verified</span>
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('referred')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              statusFilter === 'referred'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Referred</span>
          </button>
        </div>

        {/* Division Quick Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium hidden sm:inline">Division:</span>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            {Object.keys(DIVISIONS_DATA).map((divKey) => (
              <option key={divKey} value={divKey}>
                {divKey} ({DIVISIONS_DATA[divKey].total})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Product Container: Neutral Map (Left 60%) + Division Detail (Right 40%) */}
      <div className="rounded-[16px] bg-white border border-[#E4E7EC] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Map Viewport (7 cols on LG) */}
        <div className="lg:col-span-7 relative h-[380px] sm:h-[460px] lg:h-[500px] bg-[#F3F5F4] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E4E7EC]">
          {/* Neutral Base Map SVG */}
          <svg
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
            viewBox="0 0 600 500"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Canvas: Neutral #F3F5F4 */}
            <rect width="600" height="500" fill="#F3F5F4" />

            {/* Subtle River Waterways (Padma, Jamuna, Meghna delta): very subtle #D8E0DA */}
            <path
              d="M 120 0 Q 180 120 220 200 T 320 340 T 420 500"
              fill="none"
              stroke="#D8E0DA"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M 280 0 Q 270 120 240 180 T 320 260"
              fill="none"
              stroke="#D8E0DA"
              strokeWidth="6"
            />
            <path
              d="M 450 60 Q 400 160 360 250 T 380 390"
              fill="none"
              stroke="#D8E0DA"
              strokeWidth="6"
            />

            {/* Bangladesh Geographic Land Area: Neutral warm gray #E5E9E6 */}
            <path
              d="M 160 80 Q 280 70 380 90 T 500 140 T 460 260 T 380 320 T 300 420 T 200 380 T 130 260 Z"
              fill="#E5E9E6"
              stroke="#CBD2CE"
              strokeWidth="1.5"
            />

            {/* Administrative Division Labels: Charcoal #344054 */}
            {Object.entries(DIVISIONS_DATA).map(([key, data]) => {
              const isSelected = selectedDivision === key;
              return (
                <g
                  key={key}
                  className="cursor-pointer transition-opacity"
                  onClick={() => setSelectedDivision(key)}
                >
                  <text
                    x={data.mapCoords.x}
                    y={data.mapCoords.y + 16}
                    textAnchor="middle"
                    fontSize={isSelected ? '13' : '11'}
                    fontWeight={isSelected ? '700' : '500'}
                    fill={isSelected ? '#101828' : '#344054'}
                  >
                    {data.name}
                  </text>
                  <text
                    x={data.mapCoords.x}
                    y={data.mapCoords.y + 28}
                    textAnchor="middle"
                    fontSize="9"
                    fill={isSelected ? '#C62828' : '#667085'}
                    fontFamily="inherit"
                  >
                    ({data.nameBn})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Data Markers (Strictly Status Colors on Neutral Canvas) */}
          {Object.entries(DIVISIONS_DATA).map(([key, data]) => {
            const isSelected = selectedDivision === key;
            const markerColor = getStatusColor(data.primaryStatus);

            return (
              <button
                type="button"
                key={key}
                onClick={() => setSelectedDivision(key)}
                style={{
                  top: `${(data.mapCoords.y / 500) * 100}%`,
                  left: `${(data.mapCoords.x / 600) * 100}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none transition-transform ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
                title={`${data.name} Division · ${data.total} reports`}
              >
                {/* Subtle pulse ring if selected */}
                {isSelected && (
                  <span
                    className="absolute -inset-2 rounded-full animate-ping pointer-events-none opacity-40"
                    style={{ backgroundColor: markerColor }}
                  />
                )}

                {/* Marker Pill with Real Case Count */}
                <div
                  className={`px-2.5 py-1 rounded-full text-white font-mono font-bold text-xs shadow-md border-2 border-white flex items-center gap-1 transition-colors`}
                  style={{ backgroundColor: markerColor }}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{data.total}</span>
                </div>
              </button>
            );
          })}

          {/* Privacy Note Overlay: Obscured precise locations */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm border border-slate-200 text-[10px] text-slate-500 font-medium pointer-events-none">
            🔒 Public map displays generalized areas only to protect reporter privacy.
          </div>

          {/* Map Zoom Controls */}
          <div className="absolute top-3 right-3 flex flex-col gap-1 bg-white rounded-md shadow-sm border border-slate-200 p-0.5">
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.min(prev + 0.15, 1.45))}
              className="w-7 h-7 hover:bg-slate-100 rounded text-slate-700 flex items-center justify-center text-xs font-bold transition-colors"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((prev) => Math.max(prev - 0.15, 0.9))}
              className="w-7 h-7 hover:bg-slate-100 rounded text-slate-700 flex items-center justify-center text-xs font-bold transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/map"
              className="w-7 h-7 hover:bg-slate-100 rounded text-slate-700 flex items-center justify-center transition-colors border-t border-slate-200 mt-0.5"
              title="Fullscreen Map"
            >
              <Maximize2 className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right Detail Panel: REPORT ACTIVITY BY REGION (5 cols on LG) */}
        <div className="lg:col-span-5 p-6 sm:p-7 flex flex-col justify-between bg-white space-y-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#101828]">
                Report Activity by Region
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                8 divisions with public activity
              </span>
            </div>

            {/* Selected Division Interactive Focus Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#101828] flex items-center gap-1.5">
                    <span>{activeDiv.name} Division</span>
                    <span className="text-sm font-normal text-slate-500 font-bengali">
                      ({activeDiv.nameBn} বিভাগ)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generalized areas: {activeDiv.recentAreas.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#101828] font-mono leading-none">
                    {activeDiv.total}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">total cases</span>
                </div>
              </div>

              {/* Status Breakdown Grid with Status Colors */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-100">
                  <span className="flex items-center gap-1.5 text-amber-700 font-medium text-[11px]">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Under Review</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">{activeDiv.underReview}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-100">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Verified</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">{activeDiv.verified}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-100">
                  <span className="flex items-center gap-1.5 text-purple-700 font-medium text-[11px]">
                    <FileCheck className="w-3 h-3 text-purple-600" />
                    <span>Referred</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">{activeDiv.referred}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-100">
                  <span className="flex items-center gap-1.5 text-blue-700 font-medium text-[11px]">
                    <CheckCircle className="w-3 h-3 text-blue-600" />
                    <span>Resolved</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">{activeDiv.resolved}</span>
                </div>
              </div>

              {/* Direct Navigation Action */}
              <Link
                href={`/reports?division=${activeDiv.name}`}
                className="w-full py-2 px-3 rounded-md bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm mt-2"
              >
                <span>View {activeDiv.name} Reports ({activeDiv.total})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Other Divisions Quick List */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block pb-1">
                Select another region:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(DIVISIONS_DATA).map((divKey) => {
                  const div = DIVISIONS_DATA[divKey];
                  const isCur = selectedDivision === divKey;
                  return (
                    <button
                      type="button"
                      key={divKey}
                      onClick={() => setSelectedDivision(divKey)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between border transition-all ${
                        isCur
                          ? 'bg-[#101828] text-white border-[#101828]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-medium truncate">{div.name}</span>
                      <span className={`text-[10px] font-mono ml-1 ${isCur ? 'text-red-300' : 'text-slate-400'}`}>
                        {div.total}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Link to Full Dedicated Map */}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/map"
              className="w-full py-2.5 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#101828] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Explore All Reports on Full National Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
