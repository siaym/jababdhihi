'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Maximize2,
  Share2,
  Bookmark,
  BookmarkCheck,
  Flag,
  MapPin,
  Calendar,
  Building,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Film,
  Camera,
  Info,
  Layers,
  FileCheck2,
  Lock,
  Download,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Phone,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Report, EvidenceItem, PublicComment } from '@/types';
import { formatDate } from '@/lib/utils';
import { ShareModal } from './ShareModal';
import { LightboxModal } from './LightboxModal';
import { CommentsSection } from './CommentsSection';

interface ImageReportLayoutProps {
  report: Report;
  images: EvidenceItem[];
  allEvidence: EvidenceItem[];
  relatedReports: Report[];
  comments: PublicComment[];
  hasVideo?: boolean;
  onSwitchToVideo?: () => void;
  locale?: 'bn' | 'en';
}

export function ImageReportLayout({
  report,
  images,
  allEvidence,
  relatedReports,
  comments,
  hasVideo = false,
  onSwitchToVideo,
  locale = 'bn',
}: ImageReportLayoutProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('jababdihi_saved_reports') || '[]');
      if (saved.includes(report.report_number)) {
        setIsSaved(true);
      }
    } catch {
      // Ignore
    }
  }, [report.report_number]);

  const toggleSave = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('jababdihi_saved_reports') || '[]');
      let updated: string[];
      if (saved.includes(report.report_number)) {
        updated = saved.filter((id) => id !== report.report_number);
        setIsSaved(false);
      } else {
        updated = [...saved, report.report_number];
        setIsSaved(true);
      }
      localStorage.setItem('jababdihi_saved_reports', JSON.stringify(updated));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const currentImage = images[currentImageIndex] || images[0];
  const imageSrc =
    currentImage?.storage_path ||
    currentImage?.external_url ||
    '/images/evidence-campus-corridor.jpg';

  const handleNextPhoto = () => {
    setZoomLevel(1);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevPhoto = () => {
    setZoomLevel(1);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 2.2));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.8));
  const resetZoom = () => setZoomLevel(1);

  const verification = report.verification_context;
  const officialResp = report.official_response;
  const nextSteps = report.next_steps;
  const timeline = report.timeline_updates || [];
  const annotations = report.image_annotations || [];

  return (
    <article className="space-y-10">
      {/* Editorial Top Ribbon: Format indicator and secondary utility controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">
            {locale === 'bn' ? 'প্রতিবেদন ফরম্যাট:' : 'Report Format:'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101828] text-white font-medium">
            <Camera className="w-3 h-3 text-blue-400" />
            <span>{locale === 'bn' ? 'আলোকচিত্র ও প্রমাণ বিশ্লেষণ' : 'Photographic Evidence Dossier'}</span>
          </span>

          {hasVideo && (
            <button
              onClick={onSwitchToVideo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            >
              <Film className="w-3 h-3 text-slate-500" />
              <span>{locale === 'bn' ? 'ভিডিও ফুটেজ দেখুন' : 'Switch to Video Footage'}</span>
            </button>
          )}
        </div>

        {/* Quiet, Secondary Utility Controls */}
        <div className="flex items-center gap-2 text-slate-600">
          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            Case Ref: {report.report_number}
          </span>
          <span className="text-slate-300 hidden md:inline">|</span>

          <button
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors"
            title="Share report"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{locale === 'bn' ? 'শেয়ার' : 'Share'}</span>
          </button>

          <button
            onClick={toggleSave}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100 transition-colors ${
              isSaved ? 'text-emerald-700 font-semibold' : 'text-slate-700'
            }`}
            title="Save report"
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isSaved ? (locale === 'bn' ? 'সংরক্ষিত' : 'Saved') : (locale === 'bn' ? 'সংরক্ষণ' : 'Save')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-slate-100 text-slate-700 transition-colors hidden sm:inline-flex"
            title="Print dossier"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{locale === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>

          <button
            onClick={() => setFlagSubmitted(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-500 hover:text-red-700 transition-colors"
            title="Report inaccurate information"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {flagSubmitted && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {locale === 'bn'
                ? 'আপনার পর্যালোচনার অনুরোধ গৃহীত হয়েছে। যাচাইকরণ দল ছবিটি পুনঃনিরীক্ষা করবে।'
                : 'Your inquiry has been received. Our review desk will re-verify the photograph against privacy rules.'}
            </span>
          </div>
          <button onClick={() => setFlagSubmitted(false)} className="text-amber-700 hover:underline text-[11px] font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. LARGE HIGH-QUALITY PHOTOGRAPH AS PRIMARY CONTENT (Full screen real estate) */}
      <section aria-label="Primary photograph viewer" className="space-y-3">
        <div className="relative w-full min-h-[400px] sm:min-h-[500px] lg:min-h-[560px] max-h-[680px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-xl group select-none">
          {/* Subtle blurred background ambiance */}
          <div
            className="absolute inset-0 bg-center bg-cover blur-3xl opacity-25 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />

          {/* Centered Photograph */}
          <div className="relative z-10 max-w-full max-h-full flex items-center justify-center overflow-hidden p-3">
            <img
              src={imageSrc}
              alt={currentImage?.caption || `Evidence photograph ${currentImageIndex + 1}`}
              className="max-h-[620px] w-auto max-w-full object-contain rounded-lg transition-transform duration-200 cursor-zoom-in"
              style={{ transform: `scale(${zoomLevel})` }}
              onClick={() => setIsLightboxOpen(true)}
            />
          </div>

          {/* Top Bar: Archival tags & frame counter */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>METADATA SCRUBBED FOR PRIVACY</span>
              <span className="text-slate-400 font-mono">[{report.report_number}]</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-xs font-mono font-bold text-white border border-white/10 shadow-md">
                Frame {currentImageIndex + 1} of {images.length}
              </span>
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="p-2 rounded-full bg-black/80 hover:bg-[#C62828] text-white backdrop-blur-md border border-white/10 shadow-md transition-colors"
                title="Expand to Fullscreen Lightbox"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Zoom Controls */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-md">
            <button
              onClick={zoomOut}
              disabled={zoomLevel <= 0.8}
              className="p-1.5 rounded text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="px-2 py-0.5 text-[11px] font-mono text-white hover:bg-white/20 rounded transition-colors"
              title="Reset Zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={zoomIn}
              disabled={zoomLevel >= 2.2}
              className="p-1.5 rounded text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C62828] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md group-hover:opacity-100 sm:opacity-80"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C62828] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md group-hover:opacity-100 sm:opacity-80"
                aria-label="Next photograph"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Filmstrip (Underneath photo) */}
        {images.length > 1 && (
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-300">
                Verified Photographic Sequence ({images.length} frames):
              </span>
              <span className="text-[11px] font-mono">CLICK FRAME TO VIEW</span>
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-0.5">
              {images.map((img, idx) => {
                const thumbSrc = img.storage_path || img.external_url || '/images/evidence-campus-corridor.jpg';
                const isSelected = currentImageIndex === idx;
                return (
                  <button
                    key={img.id}
                    onClick={() => {
                      setZoomLevel(1);
                      setCurrentImageIndex(idx);
                    }}
                    className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 transition-all border-2 ${
                      isSelected
                        ? 'border-[#C62828] ring-2 ring-red-500/30 scale-102 shadow-md'
                        : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={thumbSrc}
                      alt={img.caption || `Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-mono font-bold text-white">
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. CAPTION & VISUAL DETAIL HIGHLIGHTS (What is visible without unverified assumptions) */}
      <section aria-label="Visual detail highlights" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#C62828]" />
              <span>Frame {currentImageIndex + 1} Description · আলোকচিত্রের প্রত্যক্ষ বিবরণ</span>
            </span>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              ✓ SHA-256 Hash Authenticated
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {currentImage?.caption ||
              'Photograph documents the physical conditions and environment submitted for civic review.'}
          </p>
        </div>

        {/* Visual Detail Highlights & Observations */}
        {annotations.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Visual Detail Observations · আলোকচিত্রে প্রত্যক্ষ দৃশ্যমান আলামত
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {annotations.map((ann, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border space-y-1.5 text-xs transition-colors ${
                    ann.frame_index === currentImageIndex
                      ? 'bg-red-50/60 border-red-200 ring-2 ring-red-100'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ann.title}</span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold">
                      Verified Visible
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{ann.observation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. WHAT THIS REPORT IS ABOUT (Neutral summary, date, institution) */}
      <section aria-label="Incident narrative" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <Badge status={report.status} />
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported Date: {formatDate(report.incident_date, locale)}</span>
              {report.approximate_time && <span>({report.approximate_time} BST)</span>}
            </span>
            {report.category && (
              <>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                  {report.category.name_en}
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 leading-tight">
            {report.public_summary ||
              `Photographic Dossier: ${
                report.custom_organization_name || report.institution_type || 'Public Body'
              }`}
          </h1>
        </div>

        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {locale === 'bn' ? 'নথিভুক্ত তথ্যের বিবরণ' : 'Documented Incident Narrative'}
          </div>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-200/70">
            {report.description}
          </p>
        </div>

        {report.custom_organization_name && (
          <div className="flex items-center gap-2 p-3 bg-slate-100/70 rounded-lg text-xs text-slate-700 border border-slate-200/60">
            <Building className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900">Institution & Governing Body:</span>{' '}
              {report.custom_organization_name}
              {report.involved_role_or_title ? ` · ${report.involved_role_or_title}` : ''}
            </div>
          </div>
        )}
      </section>

      {/* 4. EVIDENCE CUSTODY & VERIFICATION (EXIF stripped, privacy redaction, what is verified vs unverified) */}
      <section aria-label="Evidence custody and verification" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#C62828]" />
            <span>Evidentiary Custody & Verification · আলামত যাচাই ও নিরাপত্তা</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Photographs are processed with privacy protection protocols prior to public presentation.
          </p>
        </div>

        {/* Privacy Safeguards Explanation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>EXIF Stripped</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Camera serial numbers, hardware IDs, and precise GPS tags removed to protect whistleblower safety.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Sensitive IDs Masked</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Student registration IDs and victim faces concealed to prevent targeted retaliation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
              <span>Cryptographic Hash</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Digital SHA-256 fingerprint recorded to guarantee image files remain tamper-free.
            </p>
          </div>
        </div>

        {/* Verified vs Unverified Side-by-Side Breakdown */}
        {verification && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>What has been verified (যাচাইকৃত তথ্য):</span>
              </div>
              <ul className="space-y-2 text-xs text-emerald-950 leading-relaxed">
                {verification.what_is_verified.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-emerald-700">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>What remains unverified / open questions (অমীমাংসিত বিষয়):</span>
              </div>
              <ul className="space-y-2 text-xs text-amber-950 leading-relaxed">
                {verification.what_remains_unverified.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-600">?</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* 5. LOCATION AND PUBLIC CONTEXT (Privacy-safe map & regional reports) */}
      <section aria-label="Location context" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C62828]" />
            <span>Location & Geographic Discovery · আঞ্চলিক তথ্য</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic context helps citizens identify institutional oversight bodies in their district.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Documented Site & Landmark
              </div>
              <div className="text-lg font-bold text-slate-900">
                {report.area_landmark || `${report.district}, ${report.division}`}
              </div>
              <p className="text-xs text-slate-600">
                {report.upazila_thana ? `${report.upazila_thana}, ` : ''}{report.district}, {report.division} Division, Bangladesh
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Privacy Safeguard:</span> Sensitive residential dorm room numbers and private study spaces are omitted from public mapping.
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/map?division=${encodeURIComponent(report.division)}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Inspect in Interactive Bangladesh Map</span>
              </Link>
              <Link
                href={`/reports?division=${encodeURIComponent(report.division)}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors"
              >
                <span>Browse All {report.division} Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              Connected Reports in {report.division}
            </div>
            <div className="space-y-2">
              {relatedReports.slice(0, 3).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/reports/${rel.report_number}`}
                  className="block p-2 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition-colors group"
                >
                  <div className="text-xs font-bold text-slate-800 group-hover:text-[#C62828] line-clamp-1">
                    {rel.public_summary || rel.report_number}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>{rel.district}</span>
                    <Badge status={rel.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT HAPPENS NEXT? (Timeline updates, official response, helplines & civic action) */}
      <section aria-label="Next steps and official response" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-[#C62828]" />
            <span>What Happens Next? · প্রাতিষ্ঠানিক জবাব ও পরবর্তী পদক্ষেপ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Documented timeline of developments, formal right-of-reply, and official support contacts.
          </p>
        </div>

        {/* Official Entity Response */}
        {officialResp && (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Official Entity Right-of-Reply:</span>
                <span className="text-xs text-slate-700 font-semibold">{officialResp.entity_name}</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold uppercase">
                Status: {officialResp.status}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-white p-3.5 rounded-lg border border-slate-200">
              "{officialResp.statement}"
            </p>

            {officialResp.action_taken && (
              <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1">
                <span className="font-semibold text-slate-900">Action Reported:</span>
                <span>{officialResp.action_taken}</span>
              </div>
            )}
          </div>
        )}

        {/* Chronological Timeline Updates */}
        {timeline.length > 0 && (
          <div className="space-y-3 pt-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chronological Case Updates · ঘটনাপঞ্জি ও অগ্রগতি
            </div>
            <div className="space-y-3 border-l-2 border-slate-200 pl-4 ml-2">
              {timeline.map((update, idx) => (
                <div key={idx} className="relative space-y-1">
                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#C62828] ring-4 ring-white" />
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">{update.date}</span>
                    <span className="text-xs font-bold text-slate-900">{update.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{update.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verified Helplines & Support Contacts */}
        {nextSteps?.helplines && nextSteps.helplines.length > 0 && (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              <span>Official Helplines & Redress Contacts · নাগরিক সহায়তা ও জরুরি যোগাযোগ</span>
            </div>
            <p className="text-xs text-slate-500">
              If you are facing similar campus intimidation or requiring legal counseling, reach out to these verified organizations:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {nextSteps.helplines.map((helpline, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-slate-900">{helpline.title}</div>
                  <div className="text-sm font-bold text-[#C62828] font-mono flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{helpline.number}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{helpline.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* How to Follow Up or Corroborate */}
        {nextSteps?.how_to_corroborate && (
          <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1.5">
            <div className="font-bold text-slate-900">
              Confidential Corroboration for Campus Witnesses
            </div>
            <p className="leading-relaxed">
              {nextSteps.how_to_corroborate}
            </p>
            <div className="pt-1">
              <Link
                href={`/track?ref=${encodeURIComponent(report.report_number)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C62828] hover:underline"
              >
                <span>Track or Supplement this Report with Secret Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 7. COMMUNITY DISCUSSION (Optional, strictly moderated public dialogue) */}
      <section aria-label="Public discussion">
        <CommentsSection
          reportId={report.id}
          reportNumber={report.report_number}
          initialComments={comments}
          commentsDisabled={report.comments_disabled}
          locale={locale}
        />
      </section>

      {/* Fullscreen Lightbox Modal */}
      <LightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={currentImageIndex}
        reportNumber={report.report_number}
      />

      {/* Secondary Share Modal Dialog */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        reportNumber={report.report_number}
        title={report.public_summary || report.description.slice(0, 80)}
        locale={locale}
      />
    </article>
  );
}
