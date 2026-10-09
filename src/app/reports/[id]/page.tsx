'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { EvidenceCard } from '@/components/ui/EvidenceCard';
import { getPublicReportByNumber, incrementReportViews } from '@/services/reports';
import { Report, EvidenceItem, PublicComment } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Shield,
  MapPin,
  Calendar,
  Building,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  ExternalLink,
  Film,
  Camera,
  FileText,
} from 'lucide-react';
import { VideoReportLayout } from '@/components/reports/VideoReportLayout';
import { ImageReportLayout } from '@/components/reports/ImageReportLayout';
import { CommentsSection } from '@/components/reports/CommentsSection';

export default function PublicReportDetailPage() {
  const { locale, t } = useI18n();
  const params = useParams();
  const reportNumber = params?.id as string;

  const [data, setData] = useState<{
    report: Report;
    evidence: EvidenceItem[];
    relatedReports: Report[];
    comments: PublicComment[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeMediaMode, setActiveMediaMode] = useState<'video' | 'image' | 'document'>('video');

  useEffect(() => {
    if (reportNumber) {
      loadReport();
    }
  }, [reportNumber]);

  // View count increment with session deduplication
  useEffect(() => {
    if (data?.report?.id && reportNumber) {
      const storageKey = `jababdihi_viewed_${reportNumber}`;
      if (typeof window !== 'undefined' && !sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, 'true');
        incrementReportViews(data.report.id).then((newCount) => {
          if (newCount > 0) {
            setData((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                report: { ...prev.report, views_count: newCount },
              };
            });
          }
        });
      }
    }
  }, [data?.report?.id, reportNumber]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const res = await getPublicReportByNumber(reportNumber);
      if (res) {
        setData(res);

        // Determine initial media layout based on available evidence
        const hasVideo = res.evidence.some(
          (e) =>
            e.evidence_type === 'video' ||
            (e.evidence_type === 'external_link' && ['youtube', 'facebook'].includes(e.provider))
        );
        const hasImage = res.evidence.some((e) => e.evidence_type === 'image');

        if (hasVideo) {
          setActiveMediaMode('video');
        } else if (hasImage) {
          setActiveMediaMode('image');
        } else {
          setActiveMediaMode('document');
        }
      }
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading evidentiary report dossier...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          {locale === 'bn' ? 'প্রতিবেদনটি পাওয়া যায়নি' : 'Public Report Not Found'}
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          The requested report reference code does not exist or has not been approved for public disclosure.
        </p>
        <Link href="/reports">
          <Button variant="outline" size="sm" className="text-xs">
            Return to Reports
          </Button>
        </Link>
      </div>
    );
  }

  const { report, evidence, relatedReports, comments } = data;

  // Separate evidence categories
  const videoEvidence = evidence.filter(
    (e) =>
      e.evidence_type === 'video' ||
      (e.evidence_type === 'external_link' && ['youtube', 'facebook'].includes(e.provider))
  );

  const imageEvidence = evidence.filter((e) => e.evidence_type === 'image');

  const hasVideo = videoEvidence.length > 0;
  const hasPhotos = imageEvidence.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{locale === 'bn' ? 'সকল প্রতিবেদনে ফিরে যান' : 'Back to Public Reports'}</span>
        </Link>

        {/* Case Reference & Media Pills */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            {report.report_number}
          </span>
          {hasVideo && hasPhotos && (
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveMediaMode('video')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                  activeMediaMode === 'video'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Film className="w-3 h-3 text-[#C62828]" />
                <span>Video</span>
              </button>
              <button
                onClick={() => setActiveMediaMode('image')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                  activeMediaMode === 'image'
                    ? 'bg-white text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3 h-3 text-blue-600" />
                <span>Photos ({imageEvidence.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render Dynamic Media-First Layout */}
      {activeMediaMode === 'video' && hasVideo ? (
        <VideoReportLayout
          report={report}
          videoEvidence={videoEvidence}
          allEvidence={evidence}
          relatedReports={relatedReports}
          comments={comments}
          hasPhotoGallery={hasPhotos}
          onSwitchToPhotos={() => setActiveMediaMode('image')}
          locale={locale}
        />
      ) : activeMediaMode === 'image' && hasPhotos ? (
        <ImageReportLayout
          report={report}
          images={imageEvidence}
          allEvidence={evidence}
          relatedReports={relatedReports}
          comments={comments}
          hasVideo={hasVideo}
          onSwitchToVideo={() => setActiveMediaMode('video')}
          locale={locale}
        />
      ) : (
        /* Fallback for Document / General Case Reports */
        <>
          <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 pb-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base sm:text-lg font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded">
                  {report.report_number}
                </span>
                <Badge status={report.status} />
              </div>

              <div className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {report.verified_status ? 'Verified Allegation' : 'Allegation Under Review'}
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {report.public_summary ||
                `Report alleging incident regarding ${
                  report.custom_organization_name || report.institution_type || 'unspecified entity'
                }`}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <Link
                href={`/map?division=${encodeURIComponent(report.division)}`}
                className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#C62828] hover:underline font-medium transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
                <span>
                  {report.division}, {report.district}{' '}
                  {report.upazila_thana ? `(${report.upazila_thana})` : ''}
                </span>
              </Link>

              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{formatDate(report.incident_date, locale)}</span>
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {report.custom_organization_name || report.institution_type || 'Institution'}
                </span>
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === 'bn' ? 'নথিভুক্ত বিবরণ' : 'Documented Incident Narrative'}
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-line">
                {report.description}
              </p>
            </div>

            {/* Evidence items */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {locale === 'bn' ? 'অনুমোদিত প্রমাণাদি' : 'Verified Public Evidence'} ({evidence.length})
              </h3>
              {evidence.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  Evidence submitted for this report is held confidentially in private review vault.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {evidence.map((item) => (
                    <EvidenceCard key={item.id} evidence={item} />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Public Discussion */}
        <CommentsSection
          reportId={report.id}
          reportNumber={report.report_number}
          initialComments={comments}
          commentsDisabled={report.comments_disabled}
          locale={locale}
        />
      </>
      )}
    </div>
  );
}
