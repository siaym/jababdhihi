'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
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
  Minimize2,
  Columns2,
  RectangleHorizontal,
  Film,
  Camera,
  Phone,
  PhoneCall,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Info,
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

  // Large Window / Theater mode & Fullscreen state
  const [isLargeWindow, setIsLargeWindow] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Video state
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const videoTotalDuration = 165; // 2m 45s simulated demo duration
  const [activeTimestampSeconds, setActiveTimestampSeconds] = useState<number | null>(null);
  const [showOptionalTimestamps, setShowOptionalTimestamps] = useState(false);

  // Photo state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Utilities & Sections state
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [flagSubmitted, setFlagSubmitted] = useState(false);
  const [showPreviousUpdates, setShowPreviousUpdates] = useState(false);

  // Simulated video playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVideoPlaying) {
      timer = setInterval(() => {
        setVideoCurrentTime((prev) => {
          if (prev >= videoTotalDuration) {
            setIsVideoPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVideoPlaying]);

  // Load user preference for large window mode
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('jababdihi_large_window_mode');
      if (savedMode === 'true') {
        setIsLargeWindow(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleLargeWindow = () => {
    setIsLargeWindow((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('jababdihi_large_window_mode', String(next));
      } catch {}
      return next;
    });
  };

  // Track fullscreen changes across browsers
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    const container = videoContainerRef.current;
    if (!document.fullscreenElement) {
      if (container?.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if ((container as any)?.webkitRequestFullscreen) {
        (container as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any)?.webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Keyboard shortcuts: 'T' for Large window / Theater, 'F' for Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.closest('input, textarea, [contenteditable="true"]'))
      ) {
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        toggleLargeWindow();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Saved reports in localStorage
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
  const videoPosterSrc =
    currentVideo?.storage_path ||
    report.thumbnail_url ||
    '/images/mirpur-traffic-checkpoint-demo.jpg';

  const handleSeekTimestamp = (seconds: number) => {
    setActiveTimestampSeconds(seconds);
    setVideoCurrentTime(seconds);
    setIsVideoPlaying(true);
  };

  const formatVideoTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
  const latestUpdate = timeline[0] || null;
  const previousUpdates = timeline.slice(1);

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

  // 1. TOOLBAR: MEDIA SELECTION & WINDOW VIEW MODES
  const renderMediaToolbar = () => (
    <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5">
      {/* Media Mode Switcher (Video vs Photos) */}
      {hasVideo && hasPhotos ? (
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#E5DFD5]">
          <button
            onClick={() => setActiveMediaMode('video')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeMediaMode === 'video'
                ? 'bg-[#17263C] text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-red-400" />
            <span>{locale === 'bn' ? 'ভিডিও' : 'Watch video'}</span>
          </button>
          <button
            onClick={() => setActiveMediaMode('image')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeMediaMode === 'image'
                ? 'bg-[#17263C] text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span>{locale === 'bn' ? 'ছবিগুলো' : 'Browse photos'}</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
          {hasVideo ? (
            <span className="flex items-center gap-1.5 text-[#17263C]">
              <Film className="w-3.5 h-3.5 text-[#C62828]" />
              <span>{locale === 'bn' ? 'ভিডিও পর্যবেক্ষণ' : 'Video evidence'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#17263C]">
              <Camera className="w-3.5 h-3.5 text-[#C62828]" />
              <span>{locale === 'bn' ? 'আলোকচিত্র প্রমাণ' : 'Photo evidence'}</span>
            </span>
          )}
        </div>
      )}

      {/* View Mode Controls: Standard vs Large Window + Fullscreen */}
      <div className="flex items-center gap-2">
        {/* Toggle between Side-by-side (Standard) and Large Window (Theater) on Desktop */}
        <div className="hidden sm:flex items-center p-0.5 bg-white rounded-lg border border-[#E5DFD5] shadow-2xs">
          <button
            onClick={() => setIsLargeWindow(false)}
            title="Side-by-side companion mode [T]"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              !isLargeWindow
                ? 'bg-[#17263C] text-white shadow-xs font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'দুই কলাম' : 'Side-by-side'}</span>
          </button>
          <button
            onClick={() => setIsLargeWindow(true)}
            title="Large window / Theater mode [T]"
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              isLargeWindow
                ? 'bg-[#17263C] text-white shadow-xs font-semibold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <RectangleHorizontal className="w-3.5 h-3.5" />
            <span>{locale === 'bn' ? 'বড় উইন্ডো' : 'Large window'}</span>
          </button>
        </div>

        {/* Fullscreen Button */}
        {activeMediaMode === 'video' && (
          <button
            onClick={toggleFullscreen}
            title="Fullscreen [F]"
            className="px-2.5 py-1 bg-white hover:bg-slate-100 rounded-lg border border-[#E5DFD5] text-xs font-medium text-[#17263C] flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isFullscreen
                ? locale === 'bn'
                  ? 'ছোট পর্দা'
                  : 'Exit fullscreen'
                : locale === 'bn'
                ? 'ফুলস্ক্রিন'
                : 'Fullscreen'}
            </span>
          </button>
        )}
      </div>
    </div>
  );

  // 2. MEDIA PLAYER (AUTHENTIC DOCUMENTARY PLAYER · ZERO FABRICATED CONTENT)
  const renderMediaPlayer = () => {
    if (activeMediaMode === 'video' && hasVideo) {
      return (
        <div
          ref={videoContainerRef}
          className={`relative w-full rounded-2xl overflow-hidden bg-black shadow-md border border-[#D5CFC5] group transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-0 z-50 rounded-none w-screen h-screen flex items-center justify-center'
              : isLargeWindow
              ? 'aspect-video max-h-[72vh] shadow-xl border-[#17263C]/40'
              : 'aspect-video'
          }`}
        >
          {/* Corner Controls Overlay */}
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 pointer-events-auto">
            {/* Large Window / Theater toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleLargeWindow();
              }}
              title={isLargeWindow ? 'Restore side-by-side [T]' : 'Large window / Theater mode [T]'}
              className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-[#C62828] text-white text-xs backdrop-blur-md border border-white/15 transition-colors flex items-center gap-1.5 shadow-md"
            >
              {isLargeWindow ? <Columns2 className="w-3.5 h-3.5" /> : <RectangleHorizontal className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px] font-medium">
                {isLargeWindow ? (locale === 'bn' ? 'দুই কলাম' : 'Standard') : (locale === 'bn' ? 'বড় উইন্ডো' : 'Theater')}
              </span>
              <kbd className="hidden md:inline px-1 py-0.2 bg-white/20 rounded text-[9px] font-mono leading-none">T</kbd>
            </button>

            {/* Native Fullscreen toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              title={isFullscreen ? 'Exit fullscreen [F]' : 'Fullscreen [F]'}
              className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-black/75 hover:bg-[#C62828] text-white text-xs backdrop-blur-md border border-white/15 transition-colors flex items-center gap-1 shadow-md"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <kbd className="hidden md:inline px-1 py-0.2 bg-white/20 rounded text-[9px] font-mono leading-none">F</kbd>
            </button>
          </div>

          {/* Authentic Documentary Video Stage */}
          <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
            <img
              src={videoPosterSrc}
              alt="Checkpoint video frame"
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isVideoPlaying ? 'scale-102 filter brightness-95' : 'filter brightness-80'
              }`}
            />

            {/* Ambient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Demonstration Watermark Tag */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-[11px] font-mono font-bold text-amber-300 border border-amber-300/30">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>DEMO FOOTAGE · MIRPUR 10</span>
            </div>

            {/* Center Play Button Overlay if Paused */}
            {!isVideoPlaying ? (
              <button
                type="button"
                onClick={() => setIsVideoPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group/center cursor-pointer focus:outline-none"
                aria-label="Play recording"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-2xl group-hover/center:scale-108 transition-transform duration-200">
                  <Play className="w-8 h-8 ml-1 fill-current" />
                </div>
              </button>
            ) : null}

            {/* Interactive Player Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col gap-2 z-20">
              {/* Seeking Scrubber Bar */}
              <div
                className="relative w-full h-1.5 bg-white/25 rounded-full cursor-pointer overflow-hidden group/bar"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  setVideoCurrentTime(Math.floor(pos * videoTotalDuration));
                }}
              >
                <div
                  className="h-full bg-[#C62828] rounded-full transition-all duration-100"
                  style={{ width: `${(videoCurrentTime / videoTotalDuration) * 100}%` }}
                />
              </div>

              {/* Controls & Time display */}
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className="p-1 hover:text-red-400 transition-colors"
                  >
                    {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 hover:text-red-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-[11px] text-slate-300">
                    {formatVideoTime(videoCurrentTime)} / {formatVideoTime(videoTotalDuration)}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  Continuous Bystander Recording · 1080p
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (hasPhotos) {
      return (
        <div className="space-y-3">
          <div
            className={`relative w-full bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border border-[#D5CFC5] shadow-md group select-none transition-all duration-300 ${
              isLargeWindow
                ? 'min-h-[460px] sm:min-h-[560px] max-h-[700px]'
                : 'min-h-[360px] sm:min-h-[440px] max-h-[540px]'
            }`}
          >
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
      );
    }

    return null;
  };

  // 3. HEADLINE & METADATA
  const renderHeadlineAndMetadata = () => (
    <div className="space-y-3 pt-2">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#17263C] leading-tight tracking-tight">
        {report.public_summary ||
          `Public Report: Allegation regarding ${
            report.custom_organization_name || report.institution_type || 'public body'
          }`}
      </h1>

      {/* Byline with Darker, High-Contrast Secondary Text */}
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-700">
        <span className="font-semibold text-[#17263C] flex items-center gap-1">
          <Eye className="w-4 h-4 text-slate-500" />
          <span>{formattedViews} views</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1 text-[#263238] font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
          <span>{report.division}{report.district ? `, ${report.district}` : ''}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1 text-slate-700 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>{formatDate(report.incident_date, locale)}</span>
        </span>
        <span>•</span>
        <Badge status={report.status} />
      </div>
    </div>
  );

  // 4. SIMPLIFIED EDITORIAL "WHAT HAPPENED?" SECTION (4-Part Layout)
  const renderWhatHappenedSection = () => {
    const summaryText =
      report.description.split('\n\n')[0] ||
      report.public_summary ||
      'A commuter was stopped at a vehicle checkpoint and reported a demand for unrecorded cash payment.';
    const mediaShowsText =
      report.what_media_shows ||
      'The video shows the conversation between the rider and the duty officer, the presentation of registration documents, and the refusal to issue an official receipt.';
    const remainsUnclearText =
      report.what_remains_unclear ||
      'Officer identity was not clearly visible in low evening lighting. Independent confirmation of whether station logs recorded the stop remains pending.';

    return (
      <section
        id="narrative"
        aria-label="What happened"
        className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-6 shadow-xs scroll-mt-24"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-[#17263C] tracking-tight">
          {locale === 'bn' ? 'কী ঘটেছিল?' : 'What happened?'}
        </h2>

        {/* 1. Short Summary (2-3 sentences) */}
        <div className="space-y-1.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {locale === 'bn' ? 'সংক্ষিপ্ত বিবরণ' : 'Summary'}
          </div>
          <p className="text-[16px] sm:text-[17px] text-[#263238] leading-relaxed">
            {summaryText}
          </p>
        </div>

        {/* 2. What the media shows */}
        <div className="space-y-1.5 pt-3 border-t border-[#EAE5DC]">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
            {locale === 'bn' ? 'ভিডিও ও ছবিতে যা দৃশ্যমান' : 'What the media shows'}
          </div>
          <p className="text-[15px] sm:text-[16px] text-[#263238] leading-relaxed">
            {mediaShowsText}
          </p>
        </div>

        {/* 3. What remains unclear (concise paragraph when relevant) */}
        {remainsUnclearText && (
          <div className="space-y-1.5 pt-3 border-t border-[#EAE5DC]">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {locale === 'bn' ? 'যা এখনো নিশ্চিত হওয়া যায়নি' : 'What remains unclear'}
            </div>
            <p className="text-[15px] sm:text-[16px] text-slate-700 leading-relaxed">
              {remainsUnclearText}
            </p>
          </div>
        )}

        {/* 4. Current Status (compact plain-language explanation) */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FBF9F5] border border-[#EAE4D9] flex items-start gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#C62828] mt-1.5 shrink-0" />
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-[#17263C] flex items-center gap-2">
              <span>{locale === 'bn' ? 'বর্তমান অবস্থা' : 'Current status'}</span>
              <Badge status={report.status} />
            </div>
            <p className="text-sm sm:text-[15px] text-[#263238] font-medium leading-relaxed">
              {getPlainStatusText()}
            </p>
          </div>
        </div>

        {/* Optional Timestamps */}
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
                        ? 'bg-red-50 border-red-300 text-red-950 font-semibold'
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
            <div className="text-xs text-slate-700 font-semibold mb-1">
              {locale === 'bn' ? 'ছবির বিবরণ:' : 'Photo caption:'}
            </div>
            <p className="text-xs sm:text-sm text-[#263238] bg-[#FBF9F5] p-3 rounded-lg border border-[#EAE4D9]">
              {currentImage.caption}
            </p>
          </div>
        )}
      </section>
    );
  };

  // 5. SIMPLIFIED "WHAT CHANGED?" SECTION (Latest Update First + Expandable History)
  const renderWhatChangedSection = () => {
    if (!latestUpdate && !officialResp) return null;

    return (
      <section
        id="updates"
        aria-label="What changed"
        className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-5 shadow-xs scroll-mt-24"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-[#17263C] tracking-tight">
            {locale === 'bn' ? 'কী পরিবর্তন হলো?' : 'What changed?'}
          </h2>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {locale === 'bn' ? 'সাম্প্রতিক অগ্রগতি' : 'Latest development'}
          </span>
        </div>

        {/* Primary Latest Update Block */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#FBF9F5] border-l-4 border-l-[#C62828] border-y border-r border-[#EAE4D9] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[#17263C] text-sm">
              {latestUpdate?.title || (officialResp ? `${officialResp.entity_name} response` : 'Update')}
            </span>
            <span className="text-slate-600 font-mono text-xs font-semibold">
              {latestUpdate?.date || officialResp?.response_date}
            </span>
          </div>

          <p className="text-sm sm:text-base text-[#263238] leading-relaxed">
            {officialResp ? `"${officialResp.statement}"` : latestUpdate?.details}
          </p>

          {officialResp?.action_taken && (
            <div className="text-xs text-slate-700 pt-1 border-t border-[#EAE4D9]/80 font-medium">
              <strong className="text-[#17263C]">Official action noted:</strong> {officialResp.action_taken}
            </div>
          )}
        </div>

        {/* Expandable History for Previous Updates */}
        {previousUpdates.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowPreviousUpdates(!showPreviousUpdates)}
              className="text-xs font-bold text-[#17263C] hover:text-[#C62828] inline-flex items-center gap-1.5 transition-colors"
            >
              <span>
                {showPreviousUpdates
                  ? locale === 'bn'
                    ? 'আগের আপডেটগুলো লুকান'
                    : 'Hide previous updates'
                  : locale === 'bn'
                  ? `পূর্ববর্তী আপডেট দেখুন (${previousUpdates.length}টি)`
                  : `View previous updates (${previousUpdates.length})`}
              </span>
              {showPreviousUpdates ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showPreviousUpdates && (
              <div className="mt-3 space-y-2.5 pl-3 border-l-2 border-[#E5DFD5] animate-in fade-in">
                {previousUpdates.map((item, idx) => (
                  <div key={idx} className="text-xs sm:text-sm text-[#263238] space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-600 font-bold text-xs">{item.date}:</span>
                      <strong className="text-[#17263C]">{item.title}</strong>
                    </div>
                    <p className="text-slate-700 text-xs pl-0.5">{item.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  // 6. IMPROVED RELATED REPORTS SECTION (Thumbnails + Clear Connection Badges)
  const renderRelatedReportsSection = () => (
    <section
      id="related"
      aria-label="Nearby reports and resources"
      className="bg-white rounded-2xl border border-[#E5DFD5] p-6 sm:p-8 space-y-6 shadow-xs scroll-mt-24"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-[#17263C]">
            {locale === 'bn' ? 'প্রাসঙ্গিক অন্যান্য প্রতিবেদন' : `Related public interest reports`}
          </h2>
          <Link
            href={`/map?division=${encodeURIComponent(report.division)}`}
            className="text-xs font-bold text-[#C62828] hover:underline inline-flex items-center gap-1"
          >
            <span>Explore interactive map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {relatedReports.slice(0, 3).map((rel) => (
            <Link
              key={rel.id}
              href={`/reports/${rel.report_number}`}
              className="p-3.5 rounded-xl border border-[#E5DFD5] bg-[#FBF9F5] hover:border-slate-400 hover:shadow-xs transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                {/* Thumbnail + Connection Tag */}
                <div className="flex items-start gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-200 border border-slate-300">
                    <img
                      src={rel.thumbnail_url || '/images/hero-bangladesh.jpg'}
                      alt={rel.public_summary || 'Report'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1 min-w-0">
                    {/* Explicit Connection Reason */}
                    <span className="inline-block text-[10px] font-bold text-[#C62828] bg-red-50 px-1.5 py-0.5 rounded border border-red-200/60 truncate max-w-full">
                      {rel.relationship_reason || `${rel.category?.name_en || 'Public Interest'}`}
                    </span>
                    <h3 className="text-xs font-bold text-[#17263C] group-hover:text-[#C62828] transition-colors line-clamp-2 leading-tight">
                      {rel.public_summary || rel.report_number}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700 pt-2 border-t border-[#EAE5DC] mt-2">
                <span className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                  <MapPin className="w-3 h-3 text-[#C62828]" />
                  <span>{rel.district || rel.division}</span>
                </span>
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
            <span>{locale === 'bn' ? 'প্রাসঙ্গিক জরুরি হটলাইন ও যোগাযোগ' : 'Relevant emergency helplines'}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {nextSteps.helplines.map((helpline, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#E5DFD5] space-y-0.5">
                <div className="text-xs font-bold text-[#17263C]">{helpline.title}</div>
                <div className="text-xs sm:text-sm font-bold text-[#C62828] font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{helpline.number}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">{helpline.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidential follow up / track link */}
      <div className="text-center pt-1">
        <Link
          href={`/track?ref=${encodeURIComponent(report.report_number)}`}
          className="text-xs text-slate-600 hover:text-[#17263C] underline transition-colors"
        >
          Have a tracking code or wish to submit additional private evidence for this report?
        </Link>
      </div>
    </section>
  );

  return (
    <article className="space-y-6 text-[#263238]">
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

        {/* Utility buttons */}
        <div className="flex items-center gap-2 text-slate-700">
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
            className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-white text-slate-500 hover:text-[#C62828] transition-colors"
            title="Flag inaccurate info"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* DEMONSTRATION / TEST DATA BANNER (Clean, Honest, Reassuring) */}
      {report.is_demo && (
        <div className="flex items-start gap-2.5 p-3 sm:p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-xs text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#17263C]">
              {locale === 'bn' ? 'নমুনা প্রতিবেদন (টেস্ট ডেটা)' : 'Demonstration Record (Illustrative Data)'}
            </span>
            <p className="text-amber-900/90 leading-relaxed text-[11px] sm:text-xs">
              {locale === 'bn'
                ? 'এই প্ল্যাটফর্মের কার্যকারিতা প্রদর্শনের জন্য এই প্রতিবেদনে ব্যবহৃত আলোকচিত্র, ভিডিও ও মন্তব্যসমূহ নমুনা হিসেবে অন্তর্ভুক্ত করা হয়েছে। এটি কোনো নির্দিষ্ট ব্যক্তি বা বাস্তব অনুসন্ধানের চূড়ান্ত রায় নয়।'
                : 'The media, incident summary, and community discussion on this record are illustrative sample data for platform demonstration. They do not constitute judicial findings or claims regarding actual individuals.'}
            </p>
          </div>
        </div>
      )}

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

      {/* 2. DYNAMIC LAYOUT: BALANCED PROPORTIONS (Video 60-65%, Comments 35-40%) */}
      {!isLargeWindow ? (
        /* STANDARD VIEW: TWO-COLUMN ON DESKTOP, PERFECTLY ALIGNED TOP EDGES */
        <div className="space-y-8">
          <section
            aria-label="Media and community discussion"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* LEFT COLUMN: Media Player + Headline (7 cols = ~58-62%) */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-4">
              {renderMediaToolbar()}
              {renderMediaPlayer()}
              {renderHeadlineAndMetadata()}
            </div>

            {/* RIGHT COLUMN: Dedicated Comments Companion Panel (5 cols = ~38-42%) */}
            <div className="lg:col-span-5 xl:col-span-5 lg:pt-[33px]">
              {/* pt-[33px] matches the height of renderMediaToolbar on left for seamless top alignment */}
              <CommentsSection
                reportId={report.id}
                reportNumber={report.report_number}
                initialComments={comments}
                commentsDisabled={report.comments_disabled}
                locale={locale}
              />
            </div>
          </section>

          {/* LOWER SECTIONS */}
          <div className="space-y-8">
            {renderWhatHappenedSection()}
            {renderWhatChangedSection()}
            {renderRelatedReportsSection()}
          </div>
        </div>
      ) : (
        /* LARGE WINDOW VIEW: EXPANDED 12-COL MEDIA ON TOP, STORY & COMMENTS BELOW */
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* FULL-WIDTH CINEMATIC HERO */}
          <section aria-label="Large theater media view" className="space-y-4">
            {renderMediaToolbar()}
            {renderMediaPlayer()}
            {renderHeadlineAndMetadata()}
          </section>

          {/* TWO-COLUMN BELOW LARGE VIDEO: STORY ON LEFT, COMMENTS ON RIGHT */}
          <section
            aria-label="Report story and discussion"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* LEFT COLUMN: Story, Updates, Related (7 cols) */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-8">
              {renderWhatHappenedSection()}
              {renderWhatChangedSection()}
              {renderRelatedReportsSection()}
            </div>

            {/* RIGHT COLUMN: Sticky Comments Companion Panel (5 cols) */}
            <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24">
              <CommentsSection
                reportId={report.id}
                reportNumber={report.report_number}
                initialComments={comments}
                commentsDisabled={report.comments_disabled}
                locale={locale}
              />
            </div>
          </section>
        </div>
      )}

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
