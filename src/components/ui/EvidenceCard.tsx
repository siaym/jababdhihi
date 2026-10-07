'use client';

import React, { useState } from 'react';
import { EvidenceItem } from '@/types';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { useI18n } from '@/lib/i18n';
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Play,
} from 'lucide-react';

interface EvidenceCardProps {
  evidence: EvidenceItem;
  showReviewState?: boolean;
}

export function EvidenceCard({
  evidence,
  showReviewState = false,
}: EvidenceCardProps) {
  const { locale } = useI18n();
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);

  const isExternal = evidence.evidence_type === 'external_link';

  return (
    <Card className="overflow-hidden border-civic-slate-200">
      <CardContent className="p-4 space-y-3">
        {/* Header: Provider badge and review state */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-civic-slate-700 uppercase tracking-wider">
            {isExternal ? (
              <>
                <ExternalLink className="w-3.5 h-3.5 text-accent-teal" />
                <span>{evidence.provider.replace('_', ' ')}</span>
              </>
            ) : (
              <>
                {evidence.evidence_type === 'image' && (
                  <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                )}
                {evidence.evidence_type === 'document' && (
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                )}
                {evidence.evidence_type === 'video' && (
                  <Film className="w-3.5 h-3.5 text-purple-600" />
                )}
                {evidence.evidence_type === 'audio' && (
                  <Music className="w-3.5 h-3.5 text-pink-600" />
                )}
                <span>Direct Upload</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {showReviewState && (
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                  evidence.review_state === 'accepted'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : evidence.review_state === 'reviewed'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : evidence.review_state === 'rejected'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {evidence.review_state.toUpperCase()}
              </span>
            )}
            {evidence.visibility === 'private' && (
              <span className="flex items-center text-[10px] text-civic-slate-500 gap-0.5">
                <Lock className="w-3 h-3" /> Private
              </span>
            )}
          </div>
        </div>

        {/* Content Preview */}
        {isExternal ? (
          <div>
            {evidence.provider === 'youtube' && evidence.external_platform_id && evidence.is_embeddable ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-md overflow-hidden bg-black">
                  {isVideoActive ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${evidence.external_platform_id}?autoplay=1`}
                      title="YouTube Evidence Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  ) : (
                    /* High-performance Click-to-Play Facade for Mobile / Slow Networks */
                    <button
                      type="button"
                      onClick={() => setIsVideoActive(true)}
                      className="relative w-full h-full text-left group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                      aria-label="Play video evidence"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${evidence.external_platform_id}/hqdefault.jpg`}
                        alt={evidence.caption || 'Video evidence thumbnail'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/25 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-[#C62828] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 ml-0.5 fill-current" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-medium text-white flex items-center gap-1">
                        <span>Click to load video ({locale === 'bn' ? 'ভিডিও দেখুন' : 'Stream video'})</span>
                      </div>
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-civic-slate-500">
                  <span>Source: YouTube</span>
                  <a
                    href={evidence.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-civic-navy hover:underline font-medium"
                  >
                    Open Original <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : evidence.provider === 'google_drive' && evidence.external_platform_id && evidence.is_embeddable ? (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-md overflow-hidden bg-civic-slate-100 border">
                  <iframe
                    src={`https://drive.google.com/file/d/${evidence.external_platform_id}/preview`}
                    title="Google Drive Document Preview"
                    sandbox="allow-scripts allow-same-origin"
                    className="absolute inset-0 w-full h-full border-0"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-civic-slate-500">
                  <span>Source: Google Drive</span>
                  <a
                    href={evidence.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-civic-navy hover:underline font-medium"
                  >
                    Open Drive Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              /* Fallback Safe Link Preview for Non-Embeddable Resources (Facebook, Dropbox, generic) */
              <div className="p-3 bg-civic-slate-50 rounded border border-civic-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-civic-slate-800 capitalize">
                    {evidence.provider.replace('_', ' ')} Evidence Link
                  </span>
                  <a
                    href={evidence.external_url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-xs text-accent-teal hover:underline font-semibold"
                  >
                    External Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-xs text-civic-slate-500 break-all truncate">
                  {evidence.external_url}
                </p>
                {evidence.warning_notice && (
                  <div className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{evidence.warning_notice}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Direct Uploaded Evidence Preview */
          <div className="space-y-2">
            {evidence.evidence_type === 'image' ? (
              <div className="relative aspect-video w-full rounded-md overflow-hidden bg-civic-slate-100 border flex items-center justify-center">
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-civic-slate-400 mx-auto mb-1" />
                  <span className="text-xs text-civic-slate-500 block font-medium">
                    {evidence.original_filename || 'Direct Uploaded Image'}
                  </span>
                  <span className="text-[10px] text-civic-slate-400">
                    Private Vault • End-to-End Encrypted
                  </span>
                </div>
              </div>
            ) : evidence.evidence_type === 'video' ? (
              <div className="p-3 bg-civic-slate-50 rounded border border-civic-slate-200 flex items-center gap-3">
                <Film className="w-6 h-6 text-purple-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-civic-slate-800 block truncate">
                    {evidence.original_filename || 'Video Evidence Recording'}
                  </span>
                  <span className="text-[10px] text-civic-slate-500">
                    Private Supabase Vault • Stored Securely
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-civic-slate-50 rounded border border-civic-slate-200 flex items-center gap-3">
                <FileText className="w-6 h-6 text-amber-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-civic-slate-800 block truncate">
                    {evidence.original_filename || 'Uploaded Document'}
                  </span>
                  <span className="text-[10px] text-civic-slate-500">
                    Private Supabase Vault • Stored Securely
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Caption */}
        {evidence.caption && (
          <p className="text-xs text-civic-slate-600 italic border-l-2 border-civic-slate-300 pl-2">
            "{evidence.caption}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}
