import React from 'react';
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
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${evidence.external_platform_id}`}
                    title="YouTube Evidence Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    className="absolute inset-0 w-full h-full border-0"
                  />
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
                  <span>Source: Google Drive Preview</span>
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
            ) : (
              /* Non-embeddable or external link fallback */
              <div className="p-3.5 bg-civic-slate-50 rounded-md border border-civic-slate-200 space-y-2">
                <div className="flex items-start gap-2 text-xs text-civic-slate-600">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-civic-slate-800">
                      {locale === 'bn'
                        ? 'এই উৎসটি সরাসরি প্রদর্শনযোগ্য নয়।'
                        : 'This source cannot be embedded directly.'}
                    </p>
                    <p className="text-[11px] text-civic-slate-500 mt-0.5">
                      {locale === 'bn'
                        ? 'বাহ্যিক লিঙ্ক মুছে যেতে পারে বা গোপনীয় হতে পারে। মূল লিঙ্কে গিয়ে প্রমাণটি দেখুন।'
                        : 'External content can disappear or become private. Open the original source to view.'}
                    </p>
                  </div>
                </div>

                <div className="pt-1">
                  <a
                    href={evidence.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full px-3 py-1.5 text-xs font-medium text-civic-navy bg-white border border-civic-slate-300 rounded hover:bg-civic-slate-50 transition-colors gap-1.5"
                  >
                    <span>
                      {locale === 'bn'
                        ? 'মূল প্রমাণ লিঙ্ক খুলুন'
                        : 'Open Original Source'}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Direct upload preview */
          <div className="p-3 bg-civic-slate-50 rounded-md border border-civic-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded bg-civic-slate-200 flex items-center justify-center shrink-0 text-civic-slate-700">
                {evidence.evidence_type === 'image' && <ImageIcon className="w-4 h-4" />}
                {evidence.evidence_type === 'document' && <FileText className="w-4 h-4" />}
                {evidence.evidence_type === 'video' && <Film className="w-4 h-4" />}
                {evidence.evidence_type === 'audio' && <Music className="w-4 h-4" />}
              </div>
              <div className="truncate">
                <p className="text-xs font-medium text-civic-slate-800 truncate">
                  {evidence.original_filename || 'Uploaded file'}
                </p>
                {evidence.file_size_bytes && (
                  <p className="text-[11px] text-civic-slate-500">
                    {(evidence.file_size_bytes / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>

            <span className="text-[11px] font-medium text-civic-slate-500 shrink-0">
              {locale === 'bn' ? 'সুরক্ষিত ফাইল' : 'Vault File'}
            </span>
          </div>
        )}

        {/* Caption */}
        {evidence.caption && (
          <p className="text-xs text-civic-slate-600 italic">
            "{evidence.caption}"
          </p>
        )}
      </CardContent>
    </Card>
  );
}
