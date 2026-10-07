import React from 'react';
import Link from 'next/link';
import { Plus, Minus, Maximize2 } from 'lucide-react';

export function HomeMapPanel() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
          Reports on Map
        </h2>
        <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
          See reports from across Bangladesh
        </p>
      </div>

      {/* Map Canvas Card */}
      <div className="relative w-full h-[400px] sm:h-[440px] rounded-[16px] overflow-hidden border border-[#E5E7EB] bg-[#E8ECEF] shadow-sm">
        {/* Stylized Bangladesh Map Background */}
        <svg
          className="absolute inset-0 w-full h-full object-cover"
          viewBox="0 0 600 500"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Geographic Background Gradients */}
          <rect width="600" height="500" fill="#EAF1E7" />

          {/* Waterways and River systems (Padma, Jamuna, Meghna) */}
          <path
            d="M 120 0 Q 180 120 220 200 T 320 340 T 420 500"
            fill="none"
            stroke="#BDD7EE"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 280 0 Q 270 120 240 180 T 320 260"
            fill="none"
            stroke="#BDD7EE"
            strokeWidth="9"
          />
          <path
            d="M 450 60 Q 400 160 360 250 T 380 390"
            fill="none"
            stroke="#BDD7EE"
            strokeWidth="8"
          />

          {/* Bangladesh Region outlines and terrain fills */}
          <path
            d="M 160 80 Q 280 70 380 90 T 500 140 T 460 260 T 380 320 T 300 420 T 200 380 T 130 260 Z"
            fill="#D5E8D4"
            opacity="0.6"
          />

          {/* City & Division Region Labels */}
          <text x="210" y="190" fontSize="13" fontWeight="600" fill="#4B5563">
            Mymensingh
          </text>
          <text x="212" y="206" fontSize="11" fill="#6B7280" fontStyle="italic">
            ময়মনসিংহ
          </text>

          <text x="360" y="180" fontSize="13" fontWeight="600" fill="#4B5563">
            Sylhet
          </text>
          <text x="362" y="196" fontSize="11" fill="#6B7280" fontStyle="italic">
            সিলেট
          </text>

          <text x="110" y="270" fontSize="13" fontWeight="600" fill="#4B5563">
            Rajshahi
          </text>
          <text x="112" y="286" fontSize="11" fill="#6B7280" fontStyle="italic">
            রাজশাহী
          </text>

          <text x="245" y="310" fontSize="14" fontWeight="bold" fill="#1F2937">
            Dhaka
          </text>
          <text x="248" y="326" fontSize="11" fill="#4B5563" fontStyle="italic">
            ঢাকা
          </text>
        </svg>

        {/* Aggregated Cluster Circles Exactly Matching Reference Image */}
        {/* 1. Yellow Cluster: 12 (Northern / Mymensingh) */}
        <div className="absolute top-[28%] left-[28%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div className="w-11 h-11 rounded-full bg-[#FBBF24]/90 text-[#78350F] border-2 border-white shadow-md flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
            12
          </div>
        </div>

        {/* 2. Red Cluster: 34 (Dhaka Central) */}
        <div className="absolute top-[52%] left-[44%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div className="w-14 h-14 rounded-full bg-[#EF4444]/90 text-white border-2 border-white shadow-lg flex items-center justify-center font-extrabold text-base group-hover:scale-110 transition-transform">
            34
          </div>
        </div>

        {/* 3. Green Cluster: 5 (South-West / Khulna-Rajshahi) */}
        <div className="absolute top-[68%] left-[29%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-[#10B981]/90 text-white border-2 border-white shadow-md flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
            5
          </div>
        </div>

        {/* 4. Blue Cluster: 8 (North-East / Sylhet) */}
        <div className="absolute top-[38%] left-[58%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-[#3B82F6]/90 text-white border-2 border-white shadow-md flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform">
            8
          </div>
        </div>

        {/* Map Control Buttons (Top Right of Map) */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 shadow-md">
          <button
            type="button"
            className="w-8 h-8 rounded-t bg-white hover:bg-[#F3F4F6] text-[#374151] flex items-center justify-center font-bold border border-[#E5E7EB]"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="w-8 h-8 rounded-b bg-white hover:bg-[#F3F4F6] text-[#374151] flex items-center justify-center font-bold border-x border-b border-[#E5E7EB]"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <Link
            href="/map"
            className="w-8 h-8 rounded bg-white hover:bg-[#F3F4F6] text-[#374151] flex items-center justify-center border border-[#E5E7EB] mt-1"
            title="Fullscreen / Explore Interactive Map"
          >
            <Maximize2 className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
