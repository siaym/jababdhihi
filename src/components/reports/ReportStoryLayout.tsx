'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  Share2,
  Bookmark,
  BookmarkCheck,
  Flag,
  MapPin,
  Calendar,
  Eye,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Film,
  Camera,
  Phone,
  PhoneCall,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Report, EvidenceItem, PublicComment } from '@/types';
import { formatDate } from '@/lib/utils';
import { ShareModal } from './ShareModal';
import { LightboxModal } from './LightboxModal';
import { CommentsSection } from './CommentsSection';

interface ReportStoryLayoutProps {
  report: Report;
  videoEvidence: EvidenceItem[];
  imageEvidence: EvidenceItem[];
  allEvidence: EvidenceItem[];
  relatedReports: Report[];
  comments: PublicComment[];
  initialMode?: 'video' | 'image';
  locale?: 'bn' | 'en';
}

export function ReportStoryLayout({
  report,
  videoEvidence,
  imageEvidence,
  allEvidence,
  relatedReports,
  comments,
  initialMode = 'video',
  locale = 'bn',
}: ReportStoryLayoutProps) {
  const hasVideo = videoEvidence.length > 0;
  const hasPhotos = imageEvidence.length > 0;

  const [activeMediaMode, setActiveMediaMode] = useState<'video' | 'image'>(
    initialMode === 'video' && hasVideo ? 'video' : hasPhotos ? 'image' : 'video'
  );

  // Video state
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeTimestampSeconds, setActiveTimestampSeconds] = useState<number | null>(null);
  const [showOptionalTimestamps, setShowOptionalTimestamps] = useState(false);

  // Photo state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Utilities state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
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

  // Video specifics
  const currentVideo = videoEvidence[selectedVideoIndex] || videoEvidence[0];
  const youtubeId = currentVideo?.external_platform_id || (currentVideo?.provider === 'youtube' ? 'dQw4w9WgXcQ' : null);

  const handleSeekTimestamp = (seconds: number) => {
    setActiveTimestampSeconds(seconds);
    setIsVideoPlaying(true);
  };

  // Photo specifics
  const currentImage = imageEvidence[currentImageIndex] || imageEvidence[0];
  const imageSrc =
    currentImage?.storage_path ||
    currentImage?.external_url ||
    '/images/evidence-campus-corridor.jpg';

  const handleNextPhoto = () => {
    setZoomLevel(1);
    setCurrentImageIndex((prev) => (prev + 1) % imageEvidence.length);
  };

  const handlePrevPhoto = () => {
    setZoomLevel(1);
    setCurrentImageIndex((prev) => (prev - 1 + imageEvidence.length) % imageEvidence.length);
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 2.2));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.8));
  const resetZoom = () => setZoomLevel(1);

  // Content helpers
  const officialResp = report.official_response;
  const nextSteps = report.next_steps;
  const timeline = report.timeline_updates || [];

  // Plain-language status explanations
  const getPlainStatusText = () => {
    if (report.status === 'verified' || report.verified_status) {
      return locale === 'bn'
        ? 'যাচাইকৃত তথ্য: প্রাতিষ্ঠানিক রেকর্ড ও প্রত্যক্ষ সাক্ষ্যের মাধ্যমে প্রতিবেদনের মূল বিষয়গুলো নিশ্চিত করা হয়েছে।'
        : 'Verified finding: Key details and documentation have been corroborated with official records.';
    }
    if (report.status === 'referred') {
      return locale === 'bn'
        ? 'তদন্তাধীন ও প্রেরণকৃত: অভিযোগটি খতিয়ে দেখতে সংশ্লিষ্ট কর্তৃপক্ষের কাছে আনুষ্ঠানিক অনুসন্ধানের জন্য পাঠানো হয়েছে।'
        : 'Referred: The documentation has been forwarded to official oversight bodies for administrative inquiry.';
    }
    if (report.status === 'resolved') {
      return locale === 'bn'
        ? 'মীমাংসিত: ঘটনাটির বিষয়ে প্রাতিষ্ঠানিক পদক্ষেপ বা প্রতিকারমূলক ব্যবস্থা রেকর্ড করা হয়েছে।'
        : 'Resolved: Official corrective action or administrative conclusion has been documented.';
    }
    return locale === 'bn'
      ? 'প্রতিবেদনটি বর্তমানে পর্যালোচনাধীন রয়েছে। দাখিলকৃত অভিযোগগুলো এখনো চূড়ান্ত সত্য হিসেবে প্রমাণিত হয়নি।'
      : 'The report is being reviewed. The claims have not yet been established as facts.';
  };

  const formattedViews = (report.views_count || 14280).toLocaleString();

  return (
    <article className="space-y-8 text-[#263238]">
      {/* 1. TOP BREADCRUMB & UTILITY BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pb-3 border-b border-[#E5DFD5]">
        <div className="flex items-center gap-2">
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 font-bold text-[#17263C] hover:text-[#C62828] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'সকল প্রতিবেদনে ফিরে যান' : 'Back to reports'}</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E5DFD5] text-[#17263C] font-semibold">
            {report.category?.name_en || report.institution_type || 'Public Interest'}
          </span>
        </div>

        {/* Quiet utility buttons */}
        <div className="flex items-center gap-2 text-slate-600">
          <button
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-white hover:shadow-xs transition-all text-[#17263C]"
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{locale === 'bn' ? 'শেয়ার' : 'Share'}</span>
          </button>

          <button
            onClick={toggleSave}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-white hover:shadow-xs transition-all ${
              isSaved ? 'text-emerald-800 font-bold' : 'text-[#17263C]'
            }`}
            title="Save"
          >
            {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Bookmark className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isSaved ? (locale === 'bn' ? 'সংরক্ষিত' : 'Saved') : (locale === 'bn' ? 'সংরক্ষণ' : 'Save')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded hover:bg-white hover:shadow-xs transition-all text-[#17263C] hidden sm:inline-flex"
            title="Print"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>{locale === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>

          <button
            onClick={() => setFlagSubmitted(true)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white text-slate-400 hover:text-[#C62828] transition-colors"
            title="Flag inaccurate info"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {flagSubmitted && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <span>
            {locale === 'bn'
              ? 'আপনার পর্যালোচনার অনুরোধ গৃহীত হয়েছে। আমাদের টিম বিষয়টি খতিয়ে দেখবে।'
              : 'Your inquiry has been received. Our review desk will re-verify the material.'}
          </span>
          <button onClick={() => setFlagSubmitted(false)} className="text-amber-800 hover:underline text-[11px] font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. TWO-COLUMN HERO ON DESKTOP: MEDIA ON LEFT, COMMUNITY DISCUSSION ON RIGHT */}
      <section aria-label="Media and community discussion" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Media Player / Gallery, Headline & Metadata (7 cols on lg, 8 on xl) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          {/* Format toggle (if both video & photos available) */}
          {hasVideo && hasPhotos && (
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="text-slate-500 font-medium">
                {locale === 'bn' ? 'মিডিয়া নির্বাচন:' : 'Choose media view:'}
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#E5DFD5]">
                <button
                  onClick={() => setActiveMediaMode('video')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    activeMediaMode === 'video'
                      ? 'bg-[#17263C] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Film className="w-3 h-3 text-red-400" />
                  <span>{locale === 'bn' ? 'ভিডিও' : 'Watch video'}</span>
                </button>
                <button
                  onClick={() => setActiveMediaMode('image')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    activeMediaMode === 'image'
                      ? 'bg-[#17263C] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Camera className="w-3 h-3 text-blue-400" />
                  <span>{locale === 'bn' ? 'ছবিগুলো' : 'Browse photos'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Media Player Frame */}
          {activeMediaMode === 'video' && hasVideo ? (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-[#D5CFC5]">
              {currentVideo?.provider === 'youtube' && youtubeId ? (
                isVideoPlaying ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1${
                      activeTimestampSeconds !== null ? `&start=${activeTimestampSeconds}` : ''
                    }`}
                    title={report.public_summary || 'Evidentiary Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    className="absolute inset-0 w-full h-full border-0"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsVideoPlaying(true)}
                    className="relative w-full h-full text-left cursor-pointer focus:outline-none group"
                    aria-label="Play video"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                      }}
                      alt={report.public_summary || 'Video frame'}
                      className="w-full h-full object-cover group-hover:scale-101 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-200">
                        <Play className="w-8 h-8 ml-1 fill-current" />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 px-3 py-1 rounded bg-black/80 text-xs text-white backdrop-blur-sm">
                      {locale === 'bn' ? 'ভিডিও দেখতে ক্লিক করুন' : 'Click to stream recording'}
                    </div>
                  </button>
                )
              ) : currentVideo?.storage_path ? (
                <video
                  src={currentVideo.storage_path}
                  controls
                  className="w-full h-full object-contain bg-black"
                  poster="/images/hero-bangladesh.jpg"
                />
              ) : null}
            </div>
          ) : hasPhotos ? (
            /* Photo Gallery */
            <div className="space-y-3">
              <div className="relative w-full min-h-[360px] sm:min-h-[440px] max-h-[540px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-[#D5CFC5] shadow-md group select-none">
                <div
                  className="absolute inset-0 bg-center bg-cover blur-3xl opacity-20 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${imageSrc})` }}
                />

                <div className="relative z-10 max-w-full max-h-full flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={imageSrc}
                    alt={currentImage?.caption || `Evidence photo ${currentImageIndex + 1}`}
                    className="max-h-[500px] w-auto max-w-full object-contain rounded-lg transition-transform duration-200 cursor-zoom-in"
                    style={{ transform: `scale(${zoomLevel})` }}
                    onClick={() => setIsLightboxOpen(true)}
                  />
                </div>

                <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-sm text-xs font-mono font-bold text-white border border-white/10">
                    {currentImageIndex + 1} / {imageEvidence.length}
                  </span>
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-2 rounded-full bg-black/75 hover:bg-[#C62828] text-white backdrop-blur-sm border border-white/10 transition-colors"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/75 backdrop-blur-sm p-1.5 rounded-xl border border-white/10">
                  <button onClick={zoomOut} className="p-1 rounded text-white hover:bg-white/20 transition-colors">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={resetZoom} className="px-1.5 text-[11px] font-mono text-white hover:bg-white/20 rounded">
                    {Math.round(zoomLevel * 100)}%
                  </button>
                  <button onClick={zoomIn} className="p-1 rounded text-white hover:bg-white/20 transition-colors">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {imageEvidence.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[#C62828] text-white flex items-center justify-center backdrop-blur-sm transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-[#C62828] text-white flex items-center justify-center backdrop-blur-sm transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {imageEvidence.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {imageEvidence.map((img, idx) => {
                    const thumbSrc = img.storage_path || img.external_url || '/images/evidence-campus-corridor.jpg';
                    const isSelected = currentImageIndex === idx;
                    return (
                      <button
                        key={img.id}
                        onClick={() => {
                          setZoomLevel(1);
                          setCurrentImageIndex(idx);
                        }}
                        className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          isSelected
                            ? 'border-[#C62828] ring-2 ring-red-500/20 scale-102'
                            : 'border-slate-300 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={thumbSrc} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}

          {/* Headline & Metadata */}
          <div className="space-y-3 pt-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#17263C] leading-tight tracking-tight">
              {report.public_summary ||
                `Public Report: Allegation regarding ${
                  report.custom_organization_name || report.institution_type || 'public body'
                }`}
            </h1>

            {/* Byline */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
              <span className="font-semibold text-[#17263C] flex items-center gap-1">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>{formattedViews} views</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#263238] font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
                <span>{report.division}{report.district ? `, ${report.district}` : ''}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(report.incident_date, locale)}</span>
              </span>
              <span>•</span>
              <Badge status={report.status} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Dedicated Community Discussion Companion Panel (5 cols on lg, 5 on xl) */}
        <div className="lg:col-span-5 xl:col-span-5">
          <CommentsSection
            reportId={report.id}
            reportNumber={report.report_number}
            initialComments={comments}
            commentsDisabled={report.comments_disabled}
            locale={locale}
          />
        </div>
      </section>

      {/* 3. STORY NARRATIVE & CONTEXT (Full Reading Width Below Media Hero) */}
      <section aria-label="Report context" className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-6 shadow-xs">
        {/* "What happened?" */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#17263C]">
            {locale === 'bn' ? 'কী ঘটেছিল?' : 'What happened?'}
          </h2>
          <div className="text-[15px] sm:text-base text-[#263238] leading-relaxed space-y-4">
            {report.description.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>

        {/* "Where things stand" */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FBF9F5] border border-[#EAE4D9] space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-[#17263C]">
            {locale === 'bn' ? 'বর্তমান অবস্থা' : 'Where things stand'}
          </div>
          <p className="text-sm sm:text-base text-[#263238] font-medium leading-relaxed">
            {getPlainStatusText()}
          </p>
        </div>

        {/* Optional Timestamps (Only shown if useful timestamps exist in long video, NOT mandatory) */}
        {hasVideo && report.key_timestamps && report.key_timestamps.length > 0 && (
          <div className="pt-2 border-t border-[#EAE5DC]">
            <button
              onClick={() => setShowOptionalTimestamps(!showOptionalTimestamps)}
              className="text-xs font-bold text-[#17263C] hover:text-[#C62828] inline-flex items-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-[#C62828]" />
              <span>{locale === 'bn' ? 'ভিডিওর গুরুত্বপূর্ণ সময়চিহ্ন দেখুন' : 'Optional: View key timestamps in this video'}</span>
              {showOptionalTimestamps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showOptionalTimestamps && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 animate-in fade-in">
                {report.key_timestamps.map((moment, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSeekTimestamp(moment.seconds)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-colors ${
                      activeTimestampSeconds === moment.seconds
                        ? 'bg-red-50 border-red-300 text-red-950'
                        : 'bg-white border-[#E5DFD5] hover:border-slate-400 text-[#263238]'
                    }`}
                  >
                    <span className="px-2 py-0.5 rounded bg-[#17263C] text-white font-mono text-[11px] font-bold shrink-0">
                      {moment.time}
                    </span>
                    <span className="font-medium leading-tight">{moment.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Photo captions (if in image mode) */}
        {activeMediaMode === 'image' && currentImage?.caption && (
          <div className="pt-2 border-t border-[#EAE5DC]">
            <div className="text-xs text-slate-500 font-semibold mb-1">
              {locale === 'bn' ? 'ছবির বিবরণ:' : 'Photo caption:'}
            </div>
            <p className="text-xs sm:text-sm text-[#263238] bg-[#FBF9F5] p-3 rounded-lg border border-[#EAE4D9]">
              {currentImage.caption}
            </p>
          </div>
        )}
      </section>

      {/* 4. WHAT CHANGED? (Meaningful, Documented Developments Only) */}
      {(officialResp || timeline.length > 0) && (
        <section aria-label="What changed" className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-xl sm:text-2xl font-bold text-[#17263C]">
            {locale === 'bn' ? 'কী পরিবর্তন হলো?' : 'What changed?'}
          </h2>

          {/* Official entity response statement in plain quote */}
          {officialResp && (
            <div className="p-4 sm:p-5 rounded-xl bg-[#FBF9F5] border border-[#EAE4D9] space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-[#17263C]">
                  {officialResp.entity_name} responded:
                </span>
                <span className="text-slate-500 font-mono text-[11px]">{officialResp.response_date}</span>
              </div>
              <blockquote className="text-sm sm:text-base text-[#263238] italic leading-relaxed border-l-3 border-[#C62828] pl-3 py-0.5">
                "{officialResp.statement}"
              </blockquote>
              {officialResp.action_taken && (
                <div className="text-xs text-slate-600 pt-0.5">
                  <span className="font-semibold text-[#17263C]">Action taken:</span> {officialResp.action_taken}
                </div>
              )}
            </div>
          )}

          {/* Meaningful developments timeline */}
          {timeline.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {locale === 'bn' ? 'সাম্প্রতিক ঘটনাপঞ্জি' : 'Latest developments'}
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-[#263238]">
                {timeline.map((update, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono text-slate-400 font-bold text-xs shrink-0 mt-0.5">{update.date}:</span>
                    <span>
                      <strong className="text-[#17263C]">{update.title}</strong> — {update.details}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 5. NEARBY REPORTS & USEFUL RESOURCES */}
      <section aria-label="Nearby reports and resources" className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-[#17263C]">
              {locale === 'bn' ? 'আশপাশের অন্যান্য প্রতিবেদন' : `Nearby reports in ${report.division}`}
            </h2>
            <Link
              href={`/map?division=${encodeURIComponent(report.division)}`}
              className="text-xs font-bold text-[#C62828] hover:underline inline-flex items-center gap-1"
            >
              <span>Explore interactive map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedReports.slice(0, 4).map((rel) => (
              <Link
                key={rel.id}
                href={`/reports/${rel.report_number}`}
                className="p-3.5 rounded-xl border border-[#E5DFD5] bg-[#FBF9F5] hover:border-slate-400 transition-colors space-y-1.5 group"
              >
                <div className="text-xs sm:text-sm font-bold text-[#17263C] group-hover:text-[#C62828] transition-colors line-clamp-1">
                  {rel.public_summary || rel.report_number}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{rel.district}, {rel.division}</span>
                  <Badge status={rel.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Helplines and resources */}
        {nextSteps?.helplines && nextSteps.helplines.length > 0 && (
          <div className="p-4 sm:p-5 rounded-xl bg-[#FBF9F5] border border-[#EAE4D9] space-y-2.5">
            <div className="text-xs font-bold text-[#17263C] flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
              <span>{locale === 'bn' ? 'প্রাসঙ্গিক জরুরি হটলাইন ও যোগাযোগ' : 'Relevant helplines and contacts'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {nextSteps.helplines.map((helpline, idx) => (
                <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#E5DFD5] space-y-0.5">
                  <div className="text-xs font-bold text-[#17263C]">{helpline.title}</div>
                  <div className="text-xs sm:text-sm font-bold text-[#C62828] font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{helpline.number}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{helpline.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidential follow up / track link */}
        <div className="text-center pt-1">
          <Link
            href={`/track?ref=${encodeURIComponent(report.report_number)}`}
            className="text-xs text-slate-500 hover:text-[#17263C] underline transition-colors"
          >
            Have a tracking code or wish to submit additional private evidence for this report?
          </Link>
        </div>
      </section>

      {/* Lightbox Modal for Photos */}
      <LightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={imageEvidence}
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
    </article>
  );
}
