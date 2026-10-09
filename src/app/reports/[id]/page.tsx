'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { getPublicReportByNumber, incrementReportViews } from '@/services/reports';
import { Report, EvidenceItem, PublicComment } from '@/types';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { ReportStoryLayout } from '@/components/reports/ReportStoryLayout';

export default function PublicReportDetailPage() {
  const { locale } = useI18n();
  const params = useParams();
  const reportNumber = params?.id as string;

  const [data, setData] = useState<{
    report: Report;
    evidence: EvidenceItem[];
    relatedReports: Report[];
    comments: PublicComment[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
      }
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading report...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          {locale === 'bn' ? 'প্রতিবেদনটি পাওয়া যায়নি' : 'Report Not Found'}
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ReportStoryLayout
          report={report}
          videoEvidence={videoEvidence}
          imageEvidence={imageEvidence}
          allEvidence={evidence}
          relatedReports={relatedReports}
          comments={comments}
          initialMode={hasVideo ? 'video' : 'image'}
          locale={locale as 'bn' | 'en'}
        />
      </div>
    </div>
  );
}
