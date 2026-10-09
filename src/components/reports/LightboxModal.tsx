'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, ShieldCheck } from 'lucide-react';
import { EvidenceItem } from '@/types';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: EvidenceItem[];
  initialIndex?: number;
  reportNumber: string;
}

export function LightboxModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  reportNumber,
}: LightboxModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const imageSrc = currentImage?.storage_path || currentImage?.external_url || '/images/hero-bangladesh.jpg';

  const handleNext = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setZoomLevel(1);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const resetZoom = () => setZoomLevel(1);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white animate-in fade-in duration-200 select-none">
      {/* Top bar controls */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent z-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-white/10 text-white/90">
            {reportNumber}
          </span>
          <span className="text-xs text-white/70">
            Photograph {currentIndex + 1} of {images.length}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified Public Evidence</span>
          </span>
        </div>

        {/* Zoom and Close Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10 mr-2">
            <button
              onClick={zoomOut}
              className="p-1.5 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-white/70">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1.5 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1.5 hover:bg-white/20 rounded text-white/80 hover:text-white transition-colors border-l border-white/10 ml-0.5"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/90 hover:text-white transition-colors"
            title="Close Lightbox (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative flex-1 flex items-center justify-center p-4 overflow-hidden">
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-transform hover:scale-110"
            aria-label="Previous photograph"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Central Zoomable Image */}
        <div className="w-full h-full flex items-center justify-center overflow-auto cursor-grab active:cursor-grabbing">
          <img
            src={imageSrc}
            alt={currentImage?.caption || `Evidence photograph ${currentIndex + 1}`}
            style={{
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.15s ease-out',
            }}
            className="max-h-[82vh] max-w-[90vw] object-contain rounded shadow-2xl"
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-6 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-transform hover:scale-110"
            aria-label="Next photograph"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Caption Strip */}
      <div className="px-6 py-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-10 max-w-3xl mx-auto w-full text-center space-y-1">
        <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed">
          {currentImage?.caption || 'Photographic evidentiary record document'}
        </p>
        <p className="text-[11px] text-white/60">
          Source file: {currentImage?.original_filename || 'Direct witness upload'} · Metadata scrubbed for citizen protection
        </p>
      </div>
    </div>
  );
}
