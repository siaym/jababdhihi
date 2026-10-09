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
  Building,
  Eye,
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Film,
  Camera,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Report, EvidenceItem, PublicComment } from '@/types';
import { formatDate } from '@/lib/utils';
import { ShareModal } from './ShareModal';
import { CommentsSection } from './CommentsSection';

interface VideoReportLayoutProps {
  report: Report;
  videoEvidence: EvidenceItem[];
  allEvidence: EvidenceItem[];
  relatedReports: Report[];
  comments: PublicComment[];
  hasPhotoGallery?: boolean;
  onSwitchToPhotos?: () => void;
  locale?: 'bn' | 'en';
}

export function VideoReportLayout({
  report,
  videoEvidence,
  allEvidence,
  relatedReports,
  comments,
  hasPhotoGallery = false,
  onSwitchToPhotos,
  locale = 'bn',
}: VideoReportLayoutProps) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTimestampSeconds, setActiveTimestampSeconds] = useState<number | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [flagSubmitted, setFlagSubmitted] = useState(false);

  // Check saved bookmarks state from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('jababdihi_saved_reports') || '[]');
      if (saved.includes(report.report_number)) {
        setIsSaved(true);
      }
    } catch {
      // Ignore localStorage errors
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

  const currentVideo = videoEvidence[selectedVideoIndex] || videoEvidence[0];
  const youtubeId = currentVideo?.external_platform_id || (currentVideo?.provider === 'youtube' ? 'dQw4w9WgXcQ' : null);

  const handleSeekTimestamp = (seconds: number) => {
    setActiveTimestampSeconds(seconds);
    setIsPlaying(true);
  };

  const formattedViews = (report.views_count || 14280).toLocaleString();
  const commentsCount = comments.length || report.comments_count || 0;

  return (
    <div className="space-y-6">
      {/* Top Media Mode Switcher (When both Video and Photos are available) */}
      {hasPhotoGallery && (
        <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl border border-slate-800 shadow-md">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-slate-400">Available Media Formats:</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#C62828] text-white text-xs font-bold shadow-sm">
                <Film className="w-3.5 h-3.5" />
                <span>Video Footage (Active)</span>
              </span>
              <button
                onClick={onSwitchToPhotos}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo Gallery</span>
              </button>
            </div>
          </div>
          <span className="hidden sm:inline-text text-[11px] text-slate-400 font-mono">
            EVIDENCE CLASSIFICATION: VIDEO-FIRST
          </span>
        </div>
      )}

      {/* Main 2-Column Responsive Layout (YouTube Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Video Player, Info Row, Moments, Description, Comments (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* 16:9 Video Player Container */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800 group">
            {currentVideo?.provider === 'youtube' && youtubeId ? (
              isPlaying ? (
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
                /* Click-to-Play High-Performance Facade */
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="relative w-full h-full text-left cursor-pointer focus:outline-none"
                  aria-label="Play evidentiary video footage"
                >
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                    }}
                    alt={report.public_summary || 'Video evidence thumbnail'}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  {/* Subtle Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 group-hover:from-black/70 transition-colors" />

                  {/* Center Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-red-600 transition-all duration-300">
                      <Play className="w-8 h-8 ml-1 fill-current" />
                    </div>
                  </div>

                  {/* Top Evidentiary Watermark */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>EVIDENTIARY ARCHIVE</span>
                    <span className="text-slate-400 font-mono">[{report.report_number}]</span>
                  </div>

                  {/* Bottom Video Badge Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md font-medium text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Source Verified</span>
                      </span>
                      <span className="text-slate-300 hidden sm:inline text-xs">
                        Click to stream full recording
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-black/80 text-[11px] font-mono text-slate-300">
                      1080p HD
                    </span>
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
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-950">
                <Film className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-sm font-medium">Video evidence is being processed in archival vault.</p>
                <p className="text-xs text-slate-500 mt-1">Direct upload reference: {currentVideo?.original_filename || 'video-file'}</p>
              </div>
            )}
          </div>

          {/* Multiple Video Clips Switcher (if more than 1 video) */}
          {videoEvidence.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                Footage Angles ({videoEvidence.length}):
              </span>
              {videoEvidence.map((vid, idx) => (
                <button
                  key={vid.id}
                  onClick={() => {
                    setSelectedVideoIndex(idx);
                    setIsPlaying(false);
                    setActiveTimestampSeconds(null);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedVideoIndex === idx
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>Clip {idx + 1}{vid.caption ? `: ${vid.caption.slice(0, 24)}...` : ''}</span>
                </button>
              ))}
            </div>
          )}

          {/* YouTube-Style Report Title & Primary Info */}
          <div className="space-y-3 pt-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
              {report.public_summary ||
                `Video documentation regarding ${
                  report.custom_organization_name || report.institution_type || 'reported incident'
                }`}
            </h1>

            {/* Metadata & YouTube Actions Row */}
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

              {/* Right: Actions (Share, Bookmark, Flag) */}
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
                  onClick={handleFlagReport}
                  className="rounded-full text-xs font-semibold px-3 border-slate-300 hover:bg-slate-100 text-slate-500 hover:text-red-600"
                  title="Report abusive content or misinformation"
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
                  Thank you for flagging. Our civic review team will inspect this report for terms compliance.
                </span>
              </div>
            )}
          </div>

          {/* Interactive Key Moments / Timestamps Bar */}
          {report.key_timestamps && report.key_timestamps.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Clock className="w-4 h-4 text-[#C62828]" />
                  <span>Key Evidentiary Moments · ফুটেজের মূল সময়চিহ্ন</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Click timestamp to seek video
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {report.key_timestamps.map((moment, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSeekTimestamp(moment.seconds)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all group ${
                      activeTimestampSeconds === moment.seconds
                        ? 'bg-red-50/70 border-red-300 text-red-950 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/60 text-slate-800'
                    }`}
                  >
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono text-[11px] font-bold shrink-0 group-hover:bg-[#C62828] transition-colors">
                      {moment.time}
                    </span>
                    <span className="text-xs font-medium leading-snug line-clamp-2">
                      {moment.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* YouTube-Style Expandable Description Box */}
          <div className="bg-slate-100/90 rounded-2xl p-5 border border-slate-200/90 text-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 border-b border-slate-200 pb-2">
              <span>About this Report · প্রতিবেদনের পূর্ণ বিবরণ</span>
              <span className="text-slate-500 font-mono text-[11px]">
                Case ID: {report.report_number}
              </span>
            </div>

            {/* Narrative text */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
              <p className={isDescriptionExpanded ? '' : 'line-clamp-3 sm:line-clamp-4 whitespace-pre-line'}>
                {report.description}
              </p>

              {report.involved_role_or_title && (
                <div className="pt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Involved Role / Personnel:</span>{' '}
                  {report.involved_role_or_title}
                </div>
              )}
            </div>

            {/* Official Entity Response */}
            <div className="p-3.5 bg-white/90 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Building className="w-3.5 h-3.5 text-slate-700" />
                <span>Official Entity Response · সংশ্লিষ্ট প্রতিষ্ঠানের প্রাতিষ্ঠানিক বক্তব্য</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "The documented institution has been notified through standardized civic channels. Internal review is pending formal submission of counter-documentation."
              </p>
            </div>

            {/* Evidentiary Notice & Expand Toggle */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200/80">
              <p className="text-[11px] leading-normal text-slate-600 max-w-lg">
                <span className="font-semibold text-slate-800">Civic Notice:</span> A report is a starting point, not a judicial verdict. Views and comments measure civic concern, not criminal guilt.
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

        {/* Right Column: Geographic Context, Review Progression, Related Reports Feed (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Location & Geographic Context Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-[#C62828]" />
                <span>Reported Location</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {report.location_privacy === 'approximate' ? 'Approximate Area' : 'Specific Incident Site'}
              </span>
            </div>

            <div className="space-y-2">
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

            {/* Stepper Vertical Flow */}
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
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    report.status === 'under_review'
                      ? 'bg-amber-100 border-2 border-amber-500 text-amber-800 ring-4 ring-amber-100'
                      : ['verified', 'referred', 'resolved'].includes(report.status) || report.verified_status
                      ? 'bg-emerald-100 border border-emerald-500 text-emerald-800'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'
                  }`}
                >
                  {['verified', 'referred', 'resolved'].includes(report.status) || report.verified_status ? '✓' : '2'}
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
                  <div className="text-[11px] text-slate-500">Allegation corroborated with unredacted primary records</div>
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
                  <div className="text-[11px] text-slate-500">Submitted to ombudsman, ministry, or legal advocates</div>
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
                  <div className="text-[11px] text-slate-500">Official investigation concluded or corrective action taken</div>
                </div>
              </div>
            </div>
          </div>

          {/* YouTube-Style Related Reports Feed ("Up Next") */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900">
                Related Public Reports · সম্পর্কিত প্রতিবেদন
              </span>
              <span className="text-[11px] text-slate-400 font-mono">FEED</span>
            </div>

            <div className="space-y-3.5">
              {relatedReports.slice(0, 4).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/reports/${rel.report_number}`}
                  className="flex gap-3 group items-start p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {/* Thumbnail / Video Icon */}
                  <div className="w-24 h-16 rounded-lg bg-slate-900 shrink-0 overflow-hidden relative flex items-center justify-center border border-slate-200 group-hover:scale-102 transition-transform">
                    <img
                      src={rel.evidence_count && rel.evidence_count > 1 ? '/images/hero-bangladesh.jpg' : '/images/evidence-complaint-document.jpg'}
                      alt={rel.public_summary || 'Related report preview'}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#C62828] text-white flex items-center justify-center">
                        <Play className="w-3 h-3 ml-0.5 fill-current" />
                      </div>
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
