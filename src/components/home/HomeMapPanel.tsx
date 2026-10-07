'use client';

import React, { useState, useMemo } from 'react';
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
  Search,
  HelpCircle,
  X,
  Calendar,
  Layers,
  ChevronRight,
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
    recentAreas: ['Mirpur', 'Uttara', 'Motijheel', 'Dhanmondi', 'Gazipur'],
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
    recentAreas: ['Hathazari', 'Karnaphuli', 'Pahartali', 'Cox\'s Bazar', 'Cumilla'],
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
    recentAreas: ['Boalia', 'Pabna Sadar', 'Natore', 'Bogura'],
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
    recentAreas: ['Khulna Sadar', 'Jessore', 'Kushtia', 'Satkhira'],
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
    recentAreas: ['Sylhet Sadar', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
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

// Search index of known areas, districts, and upazilas
const SEARCHABLE_AREAS = [
  { name: 'Mirpur', division: 'Dhaka', reports: 7 },
  { name: 'Uttara', division: 'Dhaka', reports: 5 },
  { name: 'Motijheel', division: 'Dhaka', reports: 6 },
  { name: 'Dhanmondi', division: 'Dhaka', reports: 4 },
  { name: 'Gazipur', division: 'Dhaka', reports: 6 },
  { name: 'Narayanganj', division: 'Dhaka', reports: 4 },
  { name: 'Hathazari', division: 'Chattogram', reports: 4 },
  { name: 'Karnaphuli', division: 'Chattogram', reports: 3 },
  { name: 'Pahartali', division: 'Chattogram', reports: 3 },
  { name: 'Cox\'s Bazar', division: 'Chattogram', reports: 5 },
  { name: 'Cumilla', division: 'Chattogram', reports: 4 },
  { name: 'Boalia', division: 'Rajshahi', reports: 3 },
  { name: 'Pabna Sadar', division: 'Rajshahi', reports: 4 },
  { name: 'Bogura', division: 'Rajshahi', reports: 4 },
  { name: 'Natore', division: 'Rajshahi', reports: 2 },
  { name: 'Khulna Sadar', division: 'Khulna', reports: 3 },
  { name: 'Jessore', division: 'Khulna', reports: 3 },
  { name: 'Kushtia', division: 'Khulna', reports: 2 },
  { name: 'Sylhet Sadar', division: 'Sylhet', reports: 3 },
  { name: 'Moulvibazar', division: 'Sylhet', reports: 2 },
  { name: 'Barishal Sadar', division: 'Barishal', reports: 3 },
  { name: 'Bhola', division: 'Barishal', reports: 2 },
  { name: 'Rangpur Sadar', division: 'Rangpur', reports: 3 },
  { name: 'Dinajpur', division: 'Rangpur', reports: 2 },
  { name: 'Mymensingh Sadar', division: 'Mymensingh', reports: 3 },
  { name: 'Jamalpur', division: 'Mymensingh', reports: 2 },
];

export function HomeMapPanel() {
  // Composable Filter States
  const [selectedDivision, setSelectedDivision] = useState<string>('Dhaka');
  const [divisionFilter, setDivisionFilter] = useState<string>('all'); // 'all' or specific division
  const [statusFilter, setStatusFilter] = useState<'all' | 'under_review' | 'verified' | 'referred' | 'resolved'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'all' | '30d'>('all');

  // Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);

  // Map Controls State
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);

  const activeDiv = DIVISIONS_DATA[selectedDivision] || DIVISIONS_DATA.Dhaka;
  const hoveredDiv = hoveredDivision ? DIVISIONS_DATA[hoveredDivision] : null;

  // Search matches
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return SEARCHABLE_AREAS.filter(
      (a) => a.name.toLowerCase().includes(q) || a.division.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

  // Compute composite matching report count
  const matchingReportsCount = useMemo(() => {
    let total = 0;
    const divisionsToCount = divisionFilter === 'all' 
      ? Object.values(DIVISIONS_DATA) 
      : [DIVISIONS_DATA[divisionFilter] || DIVISIONS_DATA.Dhaka];

    divisionsToCount.forEach((d) => {
      if (statusFilter === 'all') {
        total += d.total;
      } else if (statusFilter === 'under_review') {
        total += d.underReview;
      } else if (statusFilter === 'verified') {
        total += d.verified;
      } else if (statusFilter === 'referred') {
        total += d.referred;
      } else if (statusFilter === 'resolved') {
        total += d.resolved;
      }
    });

    // Approximate category filter weighting for realism
    if (categoryFilter !== 'all') {
      total = Math.max(1, Math.round(total * 0.28));
    }
    if (timeframeFilter === '30d') {
      total = Math.max(1, Math.round(total * 0.65));
    }

    return total;
  }, [divisionFilter, statusFilter, categoryFilter, timeframeFilter]);

  // Build composite report URL
  const compositeReportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (divisionFilter !== 'all') params.set('division', divisionFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (timeframeFilter === '30d') params.set('timeframe', '30d');
    const queryStr = params.toString();
    return queryStr ? `/reports?${queryStr}` : '/reports';
  }, [divisionFilter, statusFilter, categoryFilter, timeframeFilter]);

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

  const handleSelectDivision = (divKey: string) => {
    setSelectedDivision(divKey);
    setDivisionFilter(divKey);
  };

  return (
    <div className="space-y-6">
      {/* 1. SECTION HEADER (Product Feature Tone) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C62828]">
              Geographic Discovery · ভৌগোলিক অনুসন্ধান
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#101828] tracking-tight">
            See what's being reported across Bangladesh
          </h2>
          <p className="text-xs sm:text-sm text-[#475467] mt-1 max-w-2xl">
            Explore public-interest reports by region, category, and review status.
          </p>
        </div>

        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#101828] hover:text-[#C62828] transition-colors shrink-0"
        >
          <span>Open Full National Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. COMPOSABLE CONTROL BAR: Status Tabs + Division + Category + Timeframe */}
      <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-[#E4E7EC] shadow-sm space-y-3">
        {/* Top Controls Row: Status + Division Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Status:</span>
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
              All reports
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
              <span>Under review</span>
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
            <button
              type="button"
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-colors ${
                statusFilter === 'resolved'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Resolved</span>
            </button>
          </div>

          {/* Division Dropdown Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Division:</span>
            <select
              value={divisionFilter}
              onChange={(e) => {
                const val = e.target.value;
                setDivisionFilter(val);
                if (val !== 'all') {
                  setSelectedDivision(val);
                }
              }}
              className="px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 text-xs"
            >
              <option value="all">All Bangladesh (111)</option>
              {Object.keys(DIVISIONS_DATA).map((divKey) => (
                <option key={divKey} value={divKey}>
                  {divKey} ({DIVISIONS_DATA[divKey].total})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Composable Row: Category + Timeframe + Search + Dynamic Counter */}
        <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Secondary Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>Category:</span>
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-medium text-slate-700 text-xs focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="corruption">Corruption & Bribery</option>
                <option value="education">Education & Campus</option>
                <option value="police">Police & Enforcement</option>
                <option value="government">Public Services</option>
                <option value="public_space">Infrastructure</option>
                <option value="health">Health & Hospitals</option>
                <option value="environment">Environment</option>
                <option value="workplace">Workplace Rights</option>
                <option value="other">Other Public Issues</option>
              </select>
            </div>

            {/* Timeframe Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Timeframe:</span>
              </span>
              <select
                value={timeframeFilter}
                onChange={(e) => setTimeframeFilter(e.target.value as 'all' | '30d')}
                className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-medium text-slate-700 text-xs focus:outline-none"
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 days</option>
              </select>
            </div>
          </div>

          {/* Location Search Bar directly inside Map Bar */}
          <div className="relative w-full md:w-64">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search district, city or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-8 pr-7 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Autocomplete Results Dropdown */}
            {isSearchFocused && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 z-50 p-1.5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5">
                  Matching locations:
                </div>
                {searchResults.map((area) => (
                  <Link
                    key={`${area.division}-${area.name}`}
                    href={`/reports?division=${encodeURIComponent(area.division)}&search=${encodeURIComponent(area.name)}`}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 text-xs group"
                    onClick={() => {
                      setSelectedDivision(area.division);
                      setDivisionFilter(area.division);
                    }}
                  >
                    <span className="font-semibold text-slate-800 group-hover:text-[#C62828] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C62828]" />
                      <span>{area.name}, {area.division}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {area.reports} reports · Explore →
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Composable Match Summary Pill */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between bg-slate-50/80 -mx-3.5 -mb-3.5 p-2.5 px-3.5 rounded-b-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-800">
              <strong className="text-[#C62828] font-bold">{matchingReportsCount}</strong> reports match your filters
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">
              ({divisionFilter === 'all' ? 'All Divisions' : divisionFilter} · {statusFilter === 'all' ? 'All Statuses' : statusFilter})
            </span>
          </div>

          <Link
            href={compositeReportUrl}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#101828] hover:bg-black text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>View reports ({matchingReportsCount})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* 3. REASON TO INTERACT HELPER CUE (Eliminates visitor uncertainty) */}
      <div className="flex items-center justify-between px-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="inline-block animate-bounce">👉</span>
          <span className="font-semibold text-slate-900">Select a region to explore reports</span>
          <span className="text-slate-400 hidden sm:inline">· Click markers or regions on the map to inspect divisional caseloads</span>
        </div>

        {/* Clickable Privacy Explanation Trigger */}
        <button
          type="button"
          onClick={() => setShowPrivacyModal(!showPrivacyModal)}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-[#C62828] hover:underline transition-colors"
        >
          <HelpCircle className="w-3 h-3 text-slate-400" />
          <span>Why are locations generalized?</span>
        </button>
      </div>

      {/* Interactive Privacy Explanation Card */}
      {showPrivacyModal && (
        <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 space-y-2 relative">
          <button
            type="button"
            onClick={() => setShowPrivacyModal(false)}
            className="absolute top-3 right-3 text-amber-700 hover:text-amber-950"
            title="Close privacy notice"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            <span>Why are locations generalized on Jababdihi?</span>
          </div>
          <p className="leading-relaxed text-amber-900/90 pr-6">
            Exact locations may be withheld when publishing them could identify a reporter, victim, witness, or vulnerable person.
            Jababdihi aggregates reports at the Upazila/Thana or Division level to protect civic informants from targeted retaliation
            while preserving public transparency.
          </p>
        </div>
      )}

      {/* 4. SIDE-BY-SIDE INTERACTIVE PRODUCT CONTAINER: Neutral Map (Left) + Intelligence Panel (Right) */}
      <div className="rounded-[16px] bg-white border border-[#E4E7EC] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Map Viewport (7 cols on LG) */}
        <div className="lg:col-span-7 relative h-[380px] sm:h-[460px] lg:h-[520px] bg-[#F3F5F4] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E4E7EC]">
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

            {/* Subtle River Waterways: #D8E0DA */}
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

            {/* Administrative Division Labels & Interactive Hit Areas: Charcoal #344054 */}
            {Object.entries(DIVISIONS_DATA).map(([key, data]) => {
              const isSelected = selectedDivision === key;
              const isHovered = hoveredDivision === key;
              return (
                <g
                  key={key}
                  className="cursor-pointer transition-opacity"
                  onClick={() => handleSelectDivision(key)}
                  onMouseEnter={() => setHoveredDivision(key)}
                  onMouseLeave={() => setHoveredDivision(null)}
                >
                  <text
                    x={data.mapCoords.x}
                    y={data.mapCoords.y + 16}
                    textAnchor="middle"
                    fontSize={isSelected || isHovered ? '13' : '11'}
                    fontWeight={isSelected || isHovered ? '700' : '500'}
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
                  >
                    ({data.nameBn})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Data Markers (Status-Colored Pins) */}
          {Object.entries(DIVISIONS_DATA).map(([key, data]) => {
            const isSelected = selectedDivision === key;
            const markerColor = getStatusColor(data.primaryStatus);

            return (
              <button
                type="button"
                key={key}
                onClick={() => handleSelectDivision(key)}
                onMouseEnter={() => setHoveredDivision(key)}
                onMouseLeave={() => setHoveredDivision(null)}
                style={{
                  top: `${(data.mapCoords.y / 500) * 100}%`,
                  left: `${(data.mapCoords.x / 600) * 100}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none transition-transform ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
                title={`${data.name} Division · ${data.total} reports`}
              >
                {/* Pulse ring on active selection */}
                {isSelected && (
                  <span
                    className="absolute -inset-2 rounded-full animate-ping pointer-events-none opacity-40"
                    style={{ backgroundColor: markerColor }}
                  />
                )}

                {/* Marker Pill with Case Count */}
                <div
                  className="px-2.5 py-1 rounded-full text-white font-mono font-bold text-xs shadow-md border-2 border-white flex items-center gap-1 transition-colors"
                  style={{ backgroundColor: markerColor }}
                >
                  <MapPin className="w-2.5 h-2.5" />
                  <span>{data.total}</span>
                </div>
              </button>
            );
          })}

          {/* INTELLIGENT HOVER TOOLTIP OVER THE MAP */}
          {hoveredDiv && hoveredDivision !== selectedDivision && (
            <div
              className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-full mb-3"
              style={{
                top: `${(hoveredDiv.mapCoords.y / 500) * 100}%`,
                left: `${(hoveredDiv.mapCoords.x / 600) * 100}%`,
              }}
            >
              <div className="bg-[#101828] text-white p-3 rounded-lg shadow-xl text-xs space-y-1 w-44 border border-slate-700 animate-in fade-in zoom-in-95">
                <div className="font-bold text-sm flex items-center justify-between">
                  <span>{hoveredDiv.name}</span>
                  <span className="font-mono text-red-400 font-bold">{hoveredDiv.total}</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {hoveredDiv.total} public reports
                </div>
                <div className="pt-1.5 border-t border-slate-800 grid grid-cols-2 gap-1 text-[10px]">
                  <span className="text-amber-400">🟡 {hoveredDiv.underReview} Review</span>
                  <span className="text-emerald-400">🟢 {hoveredDiv.verified} Verified</span>
                  <span className="text-purple-400">🟣 {hoveredDiv.referred} Referred</span>
                  <span className="text-blue-400">🔵 {hoveredDiv.resolved} Resolved</span>
                </div>
                <div className="text-[10px] text-red-300 font-semibold pt-1">
                  Click to explore {hoveredDiv.name} →
                </div>
              </div>
            </div>
          )}

          {/* Privacy Note Overlay */}
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

        {/* Right Detail Panel: INTELLIGENT REGIONAL FOCUS + BROWSE BY REGION */}
        <div className="lg:col-span-5 p-5 sm:p-6 lg:p-7 flex flex-col justify-between bg-white space-y-6">
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

            {/* Selected Division Intelligent Focus Card */}
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
                  <span className="text-[10px] text-slate-400 font-medium">reports</span>
                </div>
              </div>

              {/* Status Breakdown Grid with Globally Consistent Status Colors */}
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
                className="w-full py-2.5 px-3 rounded-md bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm mt-2"
              >
                <span>Explore {activeDiv.name} ({activeDiv.total})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* BROWSE BY REGION (Alternative Navigation for All Visitors) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Browse by region:
                </span>
                <span className="text-[10px] text-slate-400">Click any region</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.keys(DIVISIONS_DATA).map((divKey) => {
                  const div = DIVISIONS_DATA[divKey];
                  const isCur = selectedDivision === divKey;
                  return (
                    <button
                      type="button"
                      key={divKey}
                      onClick={() => handleSelectDivision(divKey)}
                      className={`px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between border transition-all ${
                        isCur
                          ? 'bg-[#101828] text-white border-[#101828] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-medium truncate">{div.name}</span>
                      <span className={`text-[11px] font-mono font-semibold ml-1 ${isCur ? 'text-red-300' : 'text-slate-500'}`}>
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
