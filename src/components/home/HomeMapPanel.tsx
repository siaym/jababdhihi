'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Minus, Maximize2, MapPin, ArrowRight, ShieldCheck, Clock, FileCheck } from 'lucide-react';

export function HomeMapPanel() {
  const regionalActivity = [
    {
      division: 'Dhaka Division',
      divisionBn: 'ঢাকা বিভাগ',
      count: '1 verified finding',
      status: 'VERIFIED',
      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      recentCity: 'Mirpur, Uttara, Motijheel',
    },
    {
      division: 'Chattogram Division',
      divisionBn: 'চট্টগ্রাম বিভাগ',
      count: '1 case in review',
      status: 'UNDER REVIEW',
      statusColor: 'text-amber-700 bg-amber-50 border-amber-200',
      recentCity: 'Hathazari, Karnaphuli',
    },
    {
      division: 'Rajshahi Division',
      divisionBn: 'রাজশাহী বিভাগ',
      count: '1 referred dossier',
      status: 'REFERRED TO ACC',
      statusColor: 'text-purple-700 bg-purple-50 border-purple-200',
      recentCity: 'Boalia, Pabna',
    },
    {
      division: 'Sylhet & Khulna Divisions',
      divisionBn: 'সিলেট ও খুলনা বিভাগ',
      count: 'Active intake',
      status: 'MONITORING',
      statusColor: 'text-slate-700 bg-slate-50 border-slate-200',
      recentCity: 'Sylhet Sadar, Jessore',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C62828]" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C62828]">
              Geographic Distribution · ভৌগোলিক বিস্তার
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">
            Reports across Bangladesh
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            See where citizen allegations and public-interest documentation are being recorded.
          </p>
        </div>

        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111827] hover:text-[#C62828] transition-colors"
        >
          <span>Open Full Interactive Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Side-by-Side Product Container: Map Canvas (Left 60%) + Regional Activity (Right 40%) */}
      <div className="rounded-[16px] bg-white border border-[#E2E8F0] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Map Viewport (7 Cols on LG) */}
        <div className="lg:col-span-7 relative h-[380px] sm:h-[440px] lg:h-[480px] bg-[#EEF2F6] overflow-hidden border-b lg:border-b-0 lg:border-r border-[#E2E8F0]">
          {/* Stylized Geographic Map Background */}
          <svg
            className="absolute inset-0 w-full h-full object-cover"
            viewBox="0 0 600 500"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Terrain Base */}
            <rect width="600" height="500" fill="#E8EEF5" />

            {/* River Networks (Padma, Jamuna, Meghna delta) */}
            <path
              d="M 120 0 Q 180 120 220 200 T 320 340 T 420 500"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M 280 0 Q 270 120 240 180 T 320 260"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="7"
            />
            <path
              d="M 450 60 Q 400 160 360 250 T 380 390"
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="7"
            />

            {/* Bangladesh Geographic Silhouette */}
            <path
              d="M 160 80 Q 280 70 380 90 T 500 140 T 460 260 T 380 320 T 300 420 T 200 380 T 130 260 Z"
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />

            {/* Administrative Division Labels */}
            <text x="245" y="275" fontSize="13" fontWeight="700" fill="#1E293B">
              Dhaka (ঢাকা)
            </text>
            <text x="350" y="340" fontSize="12" fontWeight="600" fill="#475569">
              Chattogram (চট্টগ্রাম)
            </text>
            <text x="120" y="240" fontSize="12" fontWeight="600" fill="#475569">
              Rajshahi (রাজশাহী)
            </text>
            <text x="370" y="160" fontSize="11" fontWeight="600" fill="#64748B">
              Sylhet (সিলেট)
            </text>
            <text x="170" y="360" fontSize="11" fontWeight="600" fill="#64748B">
              Khulna (খুলনা)
            </text>
            <text x="210" y="150" fontSize="11" fontWeight="600" fill="#64748B">
              Mymensingh (ময়মনসিংহ)
            </text>
          </svg>

          {/* Real Regional Hotspot Indicators with Pulsing Civic Rings */}
          {/* Dhaka Hotspot */}
          <div className="absolute top-[52%] left-[46%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
            <span className="absolute -inset-2 rounded-full bg-red-400/30 animate-ping pointer-events-none" />
            <div className="relative w-8 h-8 rounded-full bg-[#C62828] text-white font-bold text-xs flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
              BD
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Dhaka · High Court / Mirpur
            </div>
          </div>

          {/* Chattogram Hotspot */}
          <div className="absolute top-[68%] left-[64%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
            <span className="absolute -inset-1.5 rounded-full bg-emerald-400/30 animate-pulse pointer-events-none" />
            <div className="relative w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
              CTG
            </div>
          </div>

          {/* Rajshahi Hotspot */}
          <div className="absolute top-[46%] left-[27%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer">
            <div className="relative w-7 h-7 rounded-full bg-purple-700 text-white font-bold text-xs flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
              RAJ
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-white/95 rounded-md shadow-sm border border-slate-200 p-0.5">
            <button
              type="button"
              className="w-7 h-7 hover:bg-slate-100 rounded text-slate-700 flex items-center justify-center text-xs font-bold transition-colors"
              title="Zoom In"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              className="w-7 h-7 hover:bg-slate-100 rounded text-slate-700 flex items-center justify-center text-xs font-bold transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/map"
              className="w-7 h-7 hover:bg-slate-100 rounded text-slate-700 flex items-center justify-center transition-colors border-t border-slate-200 mt-0.5"
              title="Maximize"
            >
              <Maximize2 className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Right Regional Activity Feed (5 Cols on LG) */}
        <div className="lg:col-span-5 p-5 sm:p-7 flex flex-col justify-between bg-white space-y-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                Active Regional Jurisdictions
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                8 Divisions
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {regionalActivity.map((region) => (
                <div key={region.division} className="py-3 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#111827]">
                      {region.division}
                      <span className="text-[11px] font-normal text-slate-500 font-bengali ml-1.5">
                        ({region.divisionBn})
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Locations: {region.recentCity}
                    </p>
                  </div>
                  <span
                    className={`text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border shrink-0 ${region.statusColor}`}
                  >
                    {region.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/map"
              className="w-full py-2.5 px-4 rounded-md bg-slate-900 hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Explore All Reports by Location</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
