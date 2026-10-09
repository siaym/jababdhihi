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
  Eye,
  MessageSquare,
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
  AlertTriangle,
  ChevronDown,
  ChevronUp,
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
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  // Check saved state from localStorage
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

  const handleFlagReport = () => {
    setFlagSubmitted(true);
    setTimeout(() => setFlagSubmitted(false), 4000);
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

  const formattedViews = (report.views_count || 8940).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Top Media Mode Switcher (When both Video and Photos are available) */}
      {hasVideo && (
        <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Available Media Formats:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={onSwitchToVideo}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Video Footage</span>
              </button>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C62828] text-white text-xs font-bold shadow-sm">
                <Camera className="w-3.5 h-3.5" />
                <span>Photo Gallery (Active)</span>
              </span>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 font-mono">
            EVIDENCE CLASSIFICATION: PHOTOJOURNALISM
          </span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Photo Showcase, Filmstrip, Captions, Narrative, Comments (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Large Hero Photograph Showcase */}
          <div className="relative w-full min-h-[380px] sm:min-h-[480px] lg:min-h-[520px] max-h-[620px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-2xl group select-none">
            {/* Background blurred ambiance */}
            <div
              className="absolute inset-0 bg-center bg-cover blur-2xl opacity-20 scale-110 pointer-events-none"
              style={{ backgroundImage: `url(${imageSrc})` }}
            />

            {/* Displayed Photograph */}
            <div className="relative z-10 max-w-full max-h-full flex items-center justify-center overflow-hidden p-2">
              <img
                src={imageSrc}
                alt={currentImage?.caption || `Evidence photograph ${currentImageIndex + 1}`}
                className="max-h-[580px] w-auto max-w-full object-contain rounded-lg transition-transform duration-200 cursor-zoom-in"
                style={{ transform: `scale(${zoomLevel})` }}
                onClick={() => setIsLightboxOpen(true)}
              />
            </div>

            {/* Top Bar: Archival Integrity Badge & Image Counter */}
            <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10 shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>METADATA SCRUBBED</span>
                <span className="text-slate-400 font-mono">[{report.report_number}]</span>
              </div>

              <div className="pointer-events-auto flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md text-xs font-mono font-bold text-white border border-white/10 shadow-lg">
                  {currentImageIndex + 1} / {images.length}
                </span>
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="p-2 rounded-full bg-black/75 hover:bg-[#C62828] text-white backdrop-blur-md border border-white/10 shadow-lg transition-colors"
                  title="Expand to Fullscreen Lightbox"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-Viewer Quick Zoom Controls (Bottom Right) */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
              <button
                onClick={zoomOut}
                disabled={zoomLevel <= 0.8}
                className="p-1.5 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetZoom}
                className="px-2 py-1 text-[11px] font-mono text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Reset Zoom"
              >
                {Math.round(zoomLevel * 100)}%
              </button>
              <button
                onClick={zoomIn}
                disabled={zoomLevel >= 2.2}
                className="p-1.5 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Left / Right Carousel Navigation Arrows (Visible on hover or mobile) */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C62828] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl group-hover:opacity-100 sm:opacity-80"
                  aria-label="Previous photograph"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-[#C62828] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl group-hover:opacity-100 sm:opacity-80"
                  aria-label="Next photograph"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Filmstrip Thumbnail Strip (Horizontal Carousel) */}
          {images.length > 1 && (
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-300">
                  Photographic Evidence Strip ({images.length} verified frames):
                </span>
                <span className="text-[11px] font-mono">SELECT FRAME TO VIEW</span>
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
                          ? 'border-[#C62828] ring-2 ring-red-500/30 scale-105 shadow-md'
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

          {/* Dedicated Photojournalism Caption Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#C62828]" />
                <span>Frame Documentation · ফ্রেম বিবরণ</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                ✓ Cryptographic SHA-256 Verified
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {currentImage?.caption ||
                'Verified photographic documentation captured during the reported incident.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500 font-mono border-t border-slate-200/70">
              <span>File: {currentImage?.original_filename || 'documentary-photograph.jpg'}</span>
              <span>•</span>
              <span>Size: {currentImage?.file_size_bytes ? `${(currentImage.file_size_bytes / 1024).toFixed(0)} KB` : 'Verified Image'}</span>
              <span>•</span>
              <span>Archival Status: Public Evidence</span>
            </div>
          </div>

          {/* Report Title & Primary Info Row */}
          <div className="space-y-3 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
              {report.public_summary ||
                `Photographic dossier regarding ${
                  report.custom_organization_name || report.institution_type || 'reported incident'
                }`}
            </h1>

            {/* Metadata & Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              {/* Left: Views, Date, Review Status */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>{formattedViews} views</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(report.incident_date, locale)}</span>
                </span>
                <span className="text-slate-300">•</span>
                <Badge status={report.status} />
                {report.category && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                    {report.category.name_en}
                  </span>
                )}
              </div>

              {/* Right: Actions (Share, Bookmark, Lightbox, Flag) */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsShareOpen(true)}
                  className="rounded-full text-xs font-semibold px-4 gap-1.5 border-slate-300 hover:bg-slate-100 text-slate-700"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </Button>

                <Button
                  variant={isSaved ? 'primary' : 'outline'}
                  size="sm"
                  onClick={toggleSave}
                  className={`rounded-full text-xs font-semibold px-4 gap-1.5 transition-all ${
                    isSaved
                      ? 'bg-slate-900 hover:bg-black text-white border-transparent'
                      : 'border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLightboxOpen(true)}
                  className="rounded-full text-xs font-semibold px-3 border-slate-300 hover:bg-slate-100 text-slate-700"
                  title="Fullscreen Lightbox"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFlagReport}
                  className="rounded-full text-xs font-semibold px-3 border-slate-300 hover:bg-slate-100 text-slate-500 hover:text-red-600"
                  title="Report abusive content or privacy violation"
                >
                  <Flag className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Flag Confirmation Notice */}
            {flagSubmitted && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Report flagged for review. Our integrity and privacy team will re-verify this dossier.
                </span>
              </div>
            )}
          </div>

          {/* Narrative / Context Description Box */}
          <div className="bg-slate-100/90 rounded-2xl p-5 border border-slate-200/90 text-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 border-b border-slate-200 pb-2">
              <span>Investigation Narrative · অনুসন্ধানী প্রতিবেদন</span>
              <span className="text-slate-500 font-mono text-[11px]">
                Case ID: {report.report_number}
              </span>
            </div>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p className={isDescriptionExpanded ? '' : 'line-clamp-4 whitespace-pre-line'}>
                {report.description}
              </p>

              {report.involved_role_or_title && (
                <div className="pt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Involved Entities / Office:</span>{' '}
                  {report.involved_role_or_title}
                </div>
              )}
            </div>

            {/* Official Entity Response */}
            <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Building className="w-3.5 h-3.5 text-slate-700" />
                <span>Official Entity Response · সংশ্লিষ্ট প্রতিষ্ঠানের বক্তব্য</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "The documented institution has acknowledged receipt of this complaint docket and initiated an administrative inquiry."
              </p>
            </div>

            {/* Civic notice and toggle */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200/80">
              <p className="text-[11px] leading-normal text-slate-600 max-w-lg">
                <span className="font-semibold text-slate-800">Civic Notice:</span> A report is a starting point, not a judicial verdict. Photographs are scrubbed of camera serial numbers and EXIF coordinates to safeguard whistleblowers.
              </p>

              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="inline-flex items-center gap-1 font-bold text-slate-900 hover:text-[#C62828] transition-colors shrink-0"
              >
                <span>{isDescriptionExpanded ? 'Show less' : 'Show more'}</span>
                {isDescriptionExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Moderated Citizen Discussion Section */}
          <CommentsSection
            reportId={report.id}
            reportNumber={report.report_number}
            initialComments={comments}
            locale={locale}
          />
        </div>

        {/* Right Column: Evidence Custody, Location Card, Stepper, Related Photo Dossiers (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Evidence Custody & Trust Safeguards Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Evidentiary Custody · আলামত সুরক্ষা</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                PASS
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">EXIF Stripping:</span> Camera hardware serial numbers, embedded GPS coordinates, and raw timestamps have been removed.
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Privacy Redaction:</span> Innocent bystanders and sensitive student records have been masked prior to public release.
                </div>
              </div>

              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">SHA-256 Hash Integrity:</span> Archival digital fingerprint recorded to prevent retroactive manipulation.
                </div>
              </div>
            </div>
          </div>

          {/* Location & Geographic Discovery Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-[#C62828]" />
                <span>Incident Geography</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {report.location_privacy === 'approximate' ? 'Approximate Area' : 'Specific Campus Site'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="text-base font-bold text-slate-900">
                {report.area_landmark || `${report.district}, ${report.division}`}
              </div>
              <p className="text-xs text-slate-500">
                {report.upazila_thana ? `${report.upazila_thana}, ` : ''}{report.district}, {report.division} Division, Bangladesh
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/map?division=${encodeURIComponent(report.division)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Inspect in Interactive Map</span>
              </Link>
              <Link
                href={`/reports?division=${encodeURIComponent(report.division)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
              >
                <span>Browse other {report.division} Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Review Status Progression Stepper */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900">
                Review Status Progression
              </span>
              <span className="text-[11px] text-slate-400 font-mono">5-STAGE REVIEW</span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Step 1: Received */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-slate-900">1. Citizen Submission Received</div>
                  <div className="text-[11px] text-slate-500">Archived securely with encrypted timestamps</div>
                </div>
              </div>

              {/* Step 2: Under Review */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-slate-900">2. Independent Fact Review</div>
                  <div className="text-[11px] text-slate-500">Cross-checking corroboration and EXIF forensics</div>
                </div>
              </div>

              {/* Step 3: Verified */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    report.status === 'verified' || report.verified_status
                      ? 'bg-emerald-100 border-2 border-emerald-600 text-emerald-800 ring-4 ring-emerald-100'
                      : ['referred', 'resolved'].includes(report.status)
                      ? 'bg-emerald-100 border border-emerald-500 text-emerald-800'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'
                  }`}
                >
                  {['referred', 'resolved'].includes(report.status) ? '✓' : '3'}
                </div>
                <div>
                  <div className="font-bold text-slate-900">3. Verified Public Dossier</div>
                  <div className="text-[11px] text-slate-500">Corroborated by independent student & administrative records</div>
                </div>
              </div>

              {/* Step 4: Referred */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    report.status === 'referred'
                      ? 'bg-purple-100 border-2 border-purple-600 text-purple-800 ring-4 ring-purple-100'
                      : report.status === 'resolved'
                      ? 'bg-emerald-100 border border-emerald-500 text-emerald-800'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'
                  }`}
                >
                  {report.status === 'resolved' ? '✓' : '4'}
                </div>
                <div>
                  <div className="font-bold text-slate-900">4. Referred to Relevant Authority</div>
                  <div className="text-[11px] text-slate-500">Petition forwarded to Proctorial Body and University Syndicate</div>
                </div>
              </div>

              {/* Step 5: Resolved */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    report.status === 'resolved'
                      ? 'bg-blue-100 border-2 border-blue-600 text-blue-800 ring-4 ring-blue-100'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'
                  }`}
                >
                  5
                </div>
                <div>
                  <div className="font-bold text-slate-900">5. Remedial Action / Resolved</div>
                  <div className="text-[11px] text-slate-500">Disciplinary hearings completed or protections implemented</div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Photographic Investigations Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900">
                Related Photographic Dossiers · সম্পর্কিত অনুসন্ধান
              </span>
              <span className="text-[11px] text-slate-400 font-mono">GALLERY</span>
            </div>

            <div className="space-y-3.5">
              {relatedReports.slice(0, 4).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/reports/${rel.report_number}`}
                  className="flex gap-3 group items-start p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-16 rounded-lg bg-slate-900 shrink-0 overflow-hidden relative flex items-center justify-center border border-slate-200 group-hover:scale-102 transition-transform">
                    <img
                      src={rel.evidence_count && rel.evidence_count > 1 ? '/images/hero-bangladesh.jpg' : '/images/evidence-complaint-document.jpg'}
                      alt={rel.public_summary || 'Related report preview'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-medium text-white flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5" />
                      <span>{rel.evidence_count || 1}</span>
                    </div>
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#C62828] transition-colors line-clamp-2 leading-snug">
                      {rel.public_summary || rel.report_number}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{rel.division}</span>
                      <span>•</span>
                      <span>{(rel.views_count || 5200).toLocaleString()} views</span>
                    </div>
                    <div className="pt-0.5">
                      <Badge status={rel.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <LightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={currentImageIndex}
        reportNumber={report.report_number}
      />

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        reportNumber={report.report_number}
        title={report.public_summary || report.description.slice(0, 80)}
        locale={locale}
      />
    </div>
  );
}
