'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { EvidenceCard } from '@/components/ui/EvidenceCard';
import { getPublicReportByNumber } from '@/services/reports';
import { Report, EvidenceItem } from '@/types';
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
} from 'lucide-react';

export default function PublicReportDetailPage() {
  const { locale, t } = useI18n();
  const params = useParams();
  const reportNumber = params?.id as string;

  const [data, setData] = useState<{
    report: Report;
    evidence: EvidenceItem[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (reportNumber) {
      loadReport();
    }
  }, [reportNumber]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const res = await getPublicReportByNumber(reportNumber);
      setData(res);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-civic-slate-500">
        Loading case report...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-civic-slate-800">
          {locale === 'bn' ? 'প্রতিবেদনটি পাওয়া যায়নি' : 'Public Report Not Found'}
        </h2>
        <p className="text-xs text-civic-slate-500">
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

  const { report, evidence } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-civic-slate-600 hover:text-civic-navy"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{locale === 'bn' ? 'সকল প্রতিবেদনে ফিরে যান' : 'Back to Public Reports'}</span>
        </Link>
      </div>

      {/* Main Dossier Header */}
      <Card className="border-civic-slate-200 shadow-sm">
        <CardHeader className="border-b border-civic-slate-100 pb-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base sm:text-lg font-bold text-civic-navy bg-civic-slate-100 px-3 py-1 rounded">
                {report.report_number}
              </span>
              <Badge status={report.status} />
            </div>

            <div className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              {report.verified_status
                ? 'Verified Allegation'
                : 'Allegation Under Review'}
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-civic-slate-900 leading-snug">
            {report.public_summary ||
              `Report alleging incident regarding ${
                report.custom_organization_name || report.institution_type || 'unspecified entity'
              }`}
          </h1>

          {/* Metadata pill row */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-civic-slate-500 pt-1">
            <Link
              href={`/map?division=${encodeURIComponent(report.division)}`}
              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-[#C62828] hover:underline font-medium transition-colors"
              title="View on Bangladesh map"
            >
              <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
              <span>
                {report.division}, {report.district}{' '}
                {report.upazila_thana ? `(${report.upazila_thana})` : ''}
              </span>
            </Link>

            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-civic-slate-400" />
              <span>{formatDate(report.incident_date, locale)}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-civic-slate-400" />
              <span>
                {report.custom_organization_name || report.institution_type || 'Institution'}
              </span>
            </span>
          </div>

          {/* Review Status Progression Stepper */}
          <div className="pt-3 border-t border-civic-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Review Status Progression · পর্যালোচনা অগ্রগতি
            </div>
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-xs">
              {/* Step 1: Received */}
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold shrink-0">
                <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-800 flex items-center justify-center text-[10px]">
                  ✓
                </span>
                <span>Received</span>
              </div>
              <span className="h-[2px] w-6 sm:w-10 bg-emerald-300 shrink-0" />

              {/* Step 2: Under Review */}
              <div
                className={`flex items-center gap-1.5 shrink-0 ${
                  report.status === 'under_review'
                    ? 'text-amber-700 font-bold'
                    : ['verified', 'referred', 'resolved'].includes(report.status) || report.verified_status
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    report.status === 'under_review'
                      ? 'bg-amber-100 border border-amber-500 text-amber-800'
                      : ['verified', 'referred', 'resolved'].includes(report.status) || report.verified_status
                      ? 'bg-emerald-100 border border-emerald-500 text-emerald-800'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'
                  }`}
                >
                  {['verified', 'referred', 'resolved'].includes(report.status) || report.verified_status
                    ? '✓'
                    : '●'}
                </span>
                <span>Under Review</span>
              </div>
              <span
                className={`h-[2px] w-6 sm:w-10 shrink-0 ${
                  ['verified', 'referred', 'resolved'].includes(report.status) || report.verified_status
                    ? 'bg-emerald-300'
                    : 'bg-slate-200'
                }`}
              />

              {/* Step 3: Verified */}
              <div
                className={`flex items-center gap-1.5 shrink-0 ${
                  report.status === 'verified' || report.verified_status
                    ? 'text-emerald-700 font-bold'
                    : ['referred', 'resolved'].includes(report.status)
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    report.status === 'verified' || report.verified_status
                      ? 'bg-emerald-100 border border-emerald-500 text-emerald-800'
                      : ['referred', 'resolved'].includes(report.status)
                      ? 'bg-emerald-100 border border-emerald-500 text-emerald-800'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'
                  }`}
                >
                  {report.status === 'verified' || report.verified_status
                    ? '✓'
                    : ['referred', 'resolved'].includes(report.status)
                    ? '✓'
                    : '○'}
                </span>
                <span>Verified</span>
              </div>
              <span
                className={`h-[2px] w-6 sm:w-10 shrink-0 ${
                  ['referred', 'resolved'].includes(report.status) ? 'bg-purple-300' : 'bg-slate-200'
                }`}
              />

              {/* Step 4: Referred */}
              <div
                className={`flex items-center gap-1.5 shrink-0 ${
                  report.status === 'referred'
                    ? 'text-purple-700 font-bold'
                    : report.status === 'resolved'
                    ? 'text-emerald-700 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    report.status === 'referred'
                      ? 'bg-purple-100 border border-purple-500 text-purple-800'
                      : report.status === 'resolved'
                      ? 'bg-emerald-100 border border-emerald-500 text-emerald-800'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'
                  }`}
                >
                  {report.status === 'resolved' ? '✓' : report.status === 'referred' ? '●' : '○'}
                </span>
                <span>Referred</span>
              </div>
              <span
                className={`h-[2px] w-6 sm:w-10 shrink-0 ${
                  report.status === 'resolved' ? 'bg-blue-300' : 'bg-slate-200'
                }`}
              />

              {/* Step 5: Resolved */}
              <div
                className={`flex items-center gap-1.5 shrink-0 ${
                  report.status === 'resolved' ? 'text-blue-700 font-bold' : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    report.status === 'resolved'
                      ? 'bg-blue-100 border border-blue-500 text-blue-800'
                      : 'bg-slate-100 border border-slate-300 text-slate-400'
                  }`}
                >
                  {report.status === 'resolved' ? '✓' : '○'}
                </span>
                <span>Resolved</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Incident Narrative */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-civic-slate-500">
              {locale === 'bn' ? 'নথিভুক্ত বিবরণ' : 'Documented Incident Narrative'}
            </h3>
            <p className="text-sm text-civic-slate-800 leading-relaxed bg-civic-slate-50 p-4 rounded-lg border border-civic-slate-100 whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* Involved Official Role */}
          {report.involved_role_or_title && (
            <div className="p-3 bg-white rounded border border-civic-slate-200 text-xs text-civic-slate-700">
              <span className="font-semibold text-civic-slate-900">
                Involved Position / Role:
              </span>{' '}
              {report.involved_role_or_title}
            </div>
          )}

          {/* Public Evidence Gallery */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-civic-slate-500">
              {locale === 'bn' ? 'অনুমোদিত প্রমাণাদি' : 'Verified Public Evidence'} ({evidence.length})
            </h3>
            {evidence.length === 0 ? (
              <p className="text-xs text-civic-slate-500 italic">
                {locale === 'bn'
                  ? 'এই প্রতিবেদনের প্রমাণসমূহ গোপনীয় পর্যালোচনায় সংরক্ষিত রয়েছে।'
                  : 'Evidence submitted for this report is held confidentially in private review vault.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {evidence.map((item) => (
                  <EvidenceCard key={item.id} evidence={item} />
                ))}
              </div>
            )}
          </div>

          {/* Official Institution Right-of-Reply Section */}
          <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100 space-y-2">
            <h4 className="text-xs font-semibold text-civic-navy flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>
                {locale === 'bn'
                  ? 'সংশ্লিষ্ট প্রতিষ্ঠানের আনুষ্ঠানিক বক্তব্য'
                  : 'Official Entity Response'}
              </span>
            </h4>
            <p className="text-xs text-civic-slate-600 leading-relaxed italic">
              "This entity has received notice of the citizen submission and is reviewing the matter through internal procedures."
            </p>
          </div>

          {/* Geographic Ecosystem Loop: View Other Reports Near This Area */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
                <span>Geographic Discovery · আঞ্চলিক সংযোগ</span>
              </div>
              <p className="text-xs text-slate-500">
                Inspect other public-interest reports documented across {report.division}{report.district ? ` / ${report.district}` : ''}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/reports?division=${encodeURIComponent(report.division)}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#101828] hover:bg-black text-white text-xs font-semibold shrink-0 transition-colors shadow-sm"
              >
                <span>View {report.division} Reports</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/map?division=${encodeURIComponent(report.division)}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium shrink-0 transition-colors"
              >
                <span>Inspect on Map</span>
              </Link>
            </div>
          </div>

          {/* Methodology & Legal Notice Box */}
          <Alert variant="info">
            <AlertTitle className="text-xs">
              {locale === 'bn' ? 'প্ল্যাটফর্মের যাচাইকরণ নীতি' : 'Evidentiary Notice'}
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed">
              {locale === 'bn'
                ? 'এই প্রতিবেদনটি প্ল্যাটফর্মের যাচাইকরণ মানদণ্ড অনুযায়ী নিরীক্ষিত। এটি নাগরিক পর্যবেক্ষণ ও প্রাতিষ্ঠানিক তদন্তের সহায়ক হিসেবে সংরক্ষিত।'
                : 'This case is published following standardized civic verification protocols. It represents a documented allegation and does not substitute judicial prosecution.'}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
