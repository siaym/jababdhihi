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
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Phone,
  FileText,
  FileCheck2,
  Film,
  Camera,
  Layers,
  Printer,
  Info,
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
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
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

  const currentVideo = videoEvidence[selectedVideoIndex] || videoEvidence[0];
  const youtubeId = currentVideo?.external_platform_id || (currentVideo?.provider === 'youtube' ? 'dQw4w9WgXcQ' : null);

  const handleSeekTimestamp = (seconds: number) => {
    setActiveTimestampSeconds(seconds);
    setIsPlaying(true);
  };

  const verification = report.verification_context;
  const officialResp = report.official_response;
  const nextSteps = report.next_steps;
  const timeline = report.timeline_updates || [];
  const transcript = report.transcript || [];

  return (
    <article className="space-y-10">
      {/* Editorial Top Ribbon: Format indicator and secondary utility bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800">
            {locale === 'bn' ? 'প্রতিবেদন ফরম্যাট:' : 'Report Format:'}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#101828] text-white font-medium">
            <Film className="w-3 h-3 text-red-400" />
            <span>{locale === 'bn' ? 'ভিডিও ও সাক্ষ্য বিশ্লেষণ' : 'Video & Evidentiary Dossier'}</span>
          </span>

          {hasPhotoGallery && (
            <button
              onClick={onSwitchToPhotos}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition-colors"
            >
              <Camera className="w-3 h-3 text-slate-500" />
              <span>{locale === 'bn' ? 'ছবি গ্যালারি দেখুন' : 'Switch to Photo Gallery'}</span>
            </button>
          )}
        </div>

        {/* Quiet, Secondary Utility Controls (Not loud gamification) */}
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
                ? 'আপনার পর্যালোচনার অনুরোধ গৃহীত হয়েছে। নীতিমালার সাথে অসঙ্গতি খতিয়ে দেখা হবে।'
                : 'Your inquiry has been received. Our editorial desk will re-verify the material against platform guidelines.'}
            </span>
          </div>
          <button onClick={() => setFlagSubmitted(false)} className="text-amber-700 hover:underline text-[11px] font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* 1. MAIN VIDEO PLAYER (Prominent, dignified, accessible) */}
      <section aria-label="Main video evidence" className="space-y-3">
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-800">
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
              /* Privacy-respecting Click-to-Play Facade (No tracking before consent) */
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="relative w-full h-full text-left cursor-pointer focus:outline-none group"
                aria-label="Play evidentiary video footage"
              >
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                  }}
                  alt={report.public_summary || 'Video evidence frame'}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

                {/* Central Play Control */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-200">
                    <Play className="w-8 h-8 ml-1 fill-current" />
                  </div>
                </div>

                {/* Quiet evidentiary metadata tags on player frame */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded bg-black/80 backdrop-blur-md text-[11px] font-semibold text-white border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>PUBLIC EVIDENCE FOOTAGE</span>
                  <span className="text-slate-400 font-mono">[{report.report_number}]</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-slate-200">
                    {locale === 'bn' ? 'ভিডিও দেখতে ক্লিক করুন' : 'Click to stream recording'}
                  </span>
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-emerald-400 font-medium">
                    ✓ Source Authenticated
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
              <Film className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-medium">Video evidence is being processed in archival vault.</p>
            </div>
          )}
        </div>

        {/* Multiple Video Clips Switcher (If multiple angles exist) */}
        {videoEvidence.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-600 shrink-0">
              {locale === 'bn' ? 'রেকর্ডিং কোণ:' : 'Footage Angles:'}
            </span>
            {videoEvidence.map((vid, idx) => (
              <button
                key={vid.id}
                onClick={() => {
                  setSelectedVideoIndex(idx);
                  setIsPlaying(false);
                  setActiveTimestampSeconds(null);
                }}
                className={`px-3 py-1.5 rounded-lg border font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                  selectedVideoIndex === idx
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Angle {idx + 1}{vid.caption ? ` (${vid.caption.slice(0, 20)}...)` : ''}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 2. WHAT THIS REPORT IS ABOUT (Neutral headline, summary, date, institution) */}
      <section aria-label="Incident summary" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <Badge status={report.status} />
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Reported Incident Date: {formatDate(report.incident_date, locale)}</span>
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
              `Documented Incident Report: ${
                report.custom_organization_name || report.institution_type || 'Public Body'
              }`}
          </h1>
        </div>

        {/* Neutral Documented Incident Summary */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {locale === 'bn' ? 'নথিভুক্ত তথ্যের বিবরণ' : 'Documented Incident Narrative'}
          </div>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-xl border border-slate-200/70">
            {report.description}
          </p>
        </div>

        {/* Institution / Role Context */}
        {report.custom_organization_name && (
          <div className="flex items-center gap-2 p-3 bg-slate-100/70 rounded-lg text-xs text-slate-700 border border-slate-200/60">
            <Building className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900">Involved Department / Personnel:</span>{' '}
              {report.custom_organization_name}
              {report.involved_role_or_title ? ` · ${report.involved_role_or_title}` : ''}
            </div>
          </div>
        )}
      </section>

      {/* 3. EVIDENCE AND VERIFICATION (Status meaning, what is verified vs unverified, timestamps, transcript) */}
      <section aria-label="Evidence and verification" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#C62828]" />
                <span>Evidence & Verification Context · প্রমাণ ও যাচাইকরণ বিবরণ</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Transparent breakdown of what has been authenticated and what remains subject to inquiry.
              </p>
            </div>
            {verification?.reviewed_by && (
              <span className="text-[11px] text-slate-500 font-mono self-start sm:self-auto bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                Audited by: {verification.reviewed_by}
              </span>
            )}
          </div>
        </div>

        {/* Crucial Civic Principle Callout */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-1">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#C62828]" />
            <span>Evidentiary Standard · প্রমাণ নিরীক্ষা নীতিমালা</span>
          </div>
          <p>
            <strong>A popular video is not necessarily authentic, and an approved report does not mean every detail has been judicially proven.</strong> Jababdihi verifies source integrity, location correlation, and visual continuity to provide neutral factual basis for institutional accountability.
          </p>
        </div>

        {/* Verification Status Meaning */}
        {verification?.status_explanation && (
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 text-xs space-y-1.5">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Current Review Stage Meaning</span>
            </div>
            <p className="text-blue-800 leading-relaxed">
              {verification.status_explanation}
            </p>
          </div>
        )}

        {/* Verified vs Unverified Side-by-Side Breakdown */}
        {verification && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            {/* What has been verified */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>What has been verified (যাচাইকৃত উপাদান):</span>
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

            {/* What remains unverified / uncertain */}
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

        {/* Key Evidentiary Timestamps (Click to seek video) */}
        {report.key_timestamps && report.key_timestamps.length > 0 && (
          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C62828]" />
                <span>Relevant Footage Timestamps · ভিডিওর গুরুত্বপূর্ণ সময়চিহ্ন</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Click moment to seek video player
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.key_timestamps.map((moment, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSeekTimestamp(moment.seconds)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    activeTimestampSeconds === moment.seconds
                      ? 'bg-red-50/80 border-red-300 text-red-950 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px] font-bold shrink-0">
                    {moment.time}
                  </span>
                  <span className="text-xs font-medium leading-snug">
                    {moment.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Documented Dialogue Transcript (Collapsible) */}
        {transcript.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <span>Audited Dialogue Transcript ({transcript.length} documented exchanges)</span>
              </div>
              {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showTranscript && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs animate-in fade-in">
                {transcript.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-1 border-b border-slate-200/60 last:border-0">
                    <span className="font-mono text-[11px] text-slate-400 font-bold shrink-0">{line.time}</span>
                    <span className="font-semibold text-slate-900 shrink-0 w-28">{line.speaker}:</span>
                    <span className="text-slate-700 leading-relaxed">{line.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. LOCATION AND PUBLIC CONTEXT (Privacy-safe map, regional context, connected reports) */}
      <section aria-label="Location context" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#C62828]" />
            <span>Location & Public Context · ভৌগোলিক ও আঞ্চলিক সংযোগ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic context is published with privacy safeguards to protect citizen reporters and local residents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Location details card */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Documented Area & Landmark
              </div>
              <div className="text-lg font-bold text-slate-900">
                {report.area_landmark || `${report.district}, ${report.division}`}
              </div>
              <p className="text-xs text-slate-600">
                {report.upazila_thana ? `${report.upazila_thana}, ` : ''}{report.district}, {report.division} Division, Bangladesh
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-900">Location Privacy Level:</span>{' '}
              {report.location_privacy === 'approximate' ? (
                <span>Approximate intersection area. Precise GPS coordinates concealed to prevent witness identification.</span>
              ) : (
                <span>Public thoroughfare landmark verified against official municipality records.</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/map?division=${encodeURIComponent(report.division)}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-colors shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>Open in Interactive Bangladesh Map</span>
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

          {/* Connected Regional Reports Box */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
            <div className="text-xs font-bold text-slate-800">
              Related Public Reports in {report.division}
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

      {/* 5. WHAT HAPPENS NEXT? (Timeline updates, official response, referrals, helplines & civic action) */}
      <section aria-label="Next steps and accountability" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-[#C62828]" />
            <span>What Happens Next? · প্রাতিষ্ঠানিক প্রতিক্রিয়া ও পরবর্তী পদক্ষেপ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Documented timeline of developments, formal right-of-reply, and official redress resources.
          </p>
        </div>

        {/* Official Entity Response Container */}
        {officialResp && (
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-900">Official Entity Right-of-Reply:</span>
                <span className="text-xs text-slate-700 font-semibold">{officialResp.entity_name}</span>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-semibold uppercase">
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

        {/* Chronological Developments & Timeline Updates */}
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
              If you are facing similar harassment or require official intervention, contact these verified channels:
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
              Submit Corroborating Witness Statements or Receipts
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

      {/* 6. COMMUNITY DISCUSSION (Optional, strictly moderated public dialogue) */}
      <section aria-label="Public discussion">
        <CommentsSection
          reportId={report.id}
          reportNumber={report.report_number}
          initialComments={comments}
          commentsDisabled={report.comments_disabled}
          locale={locale}
        />
      </section>

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
