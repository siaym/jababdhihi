'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { EvidenceCard } from '@/components/ui/EvidenceCard';
import { updateReportStatus, sendCaseMessage } from '@/services/reports';
import { Report, ReportStatus, EvidenceItem } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  Shield,
  Eye,
  CheckCircle,
  AlertTriangle,
  Send,
  Lock,
  FileCheck,
  Building,
  UserCheck,
  Share2,
} from 'lucide-react';

export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('under_review');
  const [publicNote, setPublicNote] = useState<string>('');
  const [internalRationale, setInternalRationale] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<string>('');

  // Sample internal notes for moderation audit
  const [internalNotes, setInternalNotes] = useState<
    { id: string; author: string; note: string; date: string }[]
  >([
    {
      id: 'nt-1',
      author: 'Senior Reviewer S. Ahmed',
      note: 'Verified checkpoint location. Reached out to local civic monitor to confirm if other extortion reports occurred at this intersection.',
      date: '2026-09-14 11:30',
    },
  ]);
  const [newInternalNote, setNewInternalNote] = useState<string>('');

  // Evidence state
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([
    {
      id: 'ev-admin-1',
      report_id: reportId,
      evidence_type: 'external_link',
      provider: 'youtube',
      external_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      external_platform_id: 'dQw4w9WgXcQ',
      is_embeddable: true,
      visibility: 'public',
      review_state: 'accepted',
      caption: 'Cell phone footage of officer demanding unreceipted payment',
      created_at: '2026-09-13T09:16:00Z',
    },
    {
      id: 'ev-admin-2',
      report_id: reportId,
      evidence_type: 'document',
      provider: 'direct_upload',
      original_filename: 'license_registration_copy.pdf',
      mime_type: 'application/pdf',
      file_size_bytes: 1204000,
      is_embeddable: false,
      visibility: 'reviewer_only',
      review_state: 'reviewed',
      caption: 'Valid motorcycle registration and tax token',
      created_at: '2026-09-13T09:16:00Z',
    },
  ]);

  useEffect(() => {
    // Initial dummy case matching the ID
    setReport({
      id: reportId,
      report_number: 'BD-2026-001001',
      category_id: 'cat-4',
      category: {
        id: 'cat-4',
        code: 'police',
        name_en: 'Police & Law Enforcement Misconduct',
        name_bn: 'আইনশৃঙ্খলা বাহিনীর অনিয়ম',
        description_en: '',
        description_bn: '',
        display_order: 4,
      },
      privacy_mode: 'anonymous',
      incident_date: '2026-09-12',
      approximate_time: '20:30',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila_thana: 'Mirpur',
      location_privacy: 'approximate',
      institution_type: 'police',
      custom_organization_name: 'Mirpur Model Thana',
      involved_role_or_title: 'Duty Sub-Inspector',
      description:
        'Citizen was allegedly detained at a routine motorcycle checkpoint without grounds. The officer allegedly demanded BDT 5,000 to return vehicle documents despite all registrations being valid. Formal receipt was denied.',
      public_summary:
        'Report alleging arbitrary extortion during vehicle documentation checkpoint near Mirpur.',
      status: 'under_review',
      priority: 2,
      is_public: true,
      verified_status: false,
      created_at: '2026-09-13T09:15:00Z',
      updated_at: '2026-09-14T11:20:00Z',
    });
  }, [reportId]);

  const handleStatusChangeSubmit = async () => {
    if (!report) return;
    setIsUpdating(true);
    setUpdateSuccess('');

    try {
      await updateReportStatus(report.id, selectedStatus, publicNote, internalRationale);
      setReport((prev) => (prev ? { ...prev, status: selectedStatus } : null));
      setUpdateSuccess(`Case status updated to "${selectedStatus}" successfully.`);
      setPublicNote('');
      setInternalRationale('');
    } catch {
      // Error handling
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddInternalNote = () => {
    if (!newInternalNote.trim()) return;
    setInternalNotes((prev) => [
      ...prev,
      {
        id: `nt-${Date.now()}`,
        author: 'Current Reviewer',
        note: newInternalNote.trim(),
        date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      },
    ]);
    setNewInternalNote('');
  };

  if (!report) {
    return <div className="p-10 text-center text-xs">Loading case...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-civic-slate-600 hover:text-civic-navy"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reviewer Queue</span>
        </Link>

        <div className="flex items-center gap-3">
          <Badge status={report.status} />
          <span className="text-xs font-mono font-bold text-civic-navy bg-civic-slate-100 px-2.5 py-1 rounded">
            {report.report_number}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Complete Incident Dossier & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-civic-slate-200">
            <CardHeader className="border-b border-civic-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Incident Dossier</CardTitle>
                  <CardDescription className="text-xs">
                    Submitted on {formatDate(report.created_at, 'en')} • Mode: {report.privacy_mode.toUpperCase()}
                  </CardDescription>
                </div>
                <Badge variant={report.privacy_mode === 'anonymous' ? 'verified' : 'default'}>
                  {report.privacy_mode === 'anonymous' ? 'Zero-IP Shield' : 'Confidential Contact'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-civic-slate-50 p-4 rounded-lg border border-civic-slate-100">
                <div>
                  <span className="text-civic-slate-500 font-medium block">Category</span>
                  <span className="font-semibold text-civic-slate-900">{report.category?.name_en}</span>
                </div>
                <div>
                  <span className="text-civic-slate-500 font-medium block">Incident Date</span>
                  <span className="font-semibold text-civic-slate-900">{report.incident_date} ({report.approximate_time || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-civic-slate-500 font-medium block">Location</span>
                  <span className="font-semibold text-civic-slate-900">{report.division}, {report.district} ({report.upazila_thana})</span>
                </div>
                <div>
                  <span className="text-civic-slate-500 font-medium block">Entity / Thana</span>
                  <span className="font-semibold text-civic-slate-900">{report.custom_organization_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-civic-slate-500 font-medium block">Involved Role</span>
                  <span className="font-semibold text-civic-slate-900">{report.involved_role_or_title || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-civic-slate-500 font-medium block">Location Privacy</span>
                  <span className="font-semibold text-civic-slate-900 capitalize">{report.location_privacy}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase text-civic-slate-500 mb-1.5">
                  Citizen Narrative Description
                </h4>
                <p className="text-xs sm:text-sm text-civic-slate-800 leading-relaxed bg-white p-4 rounded border border-civic-slate-200">
                  {report.description}
                </p>
              </div>

              {/* Evidence Review Gallery */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase text-civic-slate-500">
                    Attached Evidence ({evidenceItems.length})
                  </h4>
                  <span className="text-[11px] text-civic-slate-500">
                    Review state inspection active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {evidenceItems.map((ev) => (
                    <EvidenceCard
                      key={ev.id}
                      evidence={ev}
                      showReviewState={true}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Moderation Actions & Secret Internal Notes */}
        <div className="space-y-6">
          {/* Moderation Controls Card */}
          <Card className="border-civic-slate-200 shadow-sm">
            <CardHeader className="bg-civic-slate-50/50 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-civic-navy">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Workflow & Status Transition</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {updateSuccess && (
                <Alert variant="success">
                  <AlertDescription className="text-xs">{updateSuccess}</AlertDescription>
                </Alert>
              )}

              <Select
                label="Transition Status To"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ReportStatus)}
                className="text-xs font-medium"
              >
                <option value="under_review">Under Review (পর্যালোচনাধীন)</option>
                <option value="more_info_required">More Info Required (অতিরিক্ত তথ্য)</option>
                <option value="evidence_review">Evidence Review (প্রমাণ পরীক্ষা)</option>
                <option value="reviewed">Review Completed (পর্যালোচনা শেষ)</option>
                <option value="referred">Referred to Agency (সংস্থায় প্রেরণ)</option>
                <option value="verified">Verified Allegation (যাচাইকৃত)</option>
                <option value="unsubstantiated">Unsubstantiated (অপর্যাপ্ত প্রমাণ)</option>
                <option value="resolved">Resolved (নিষ্পত্তি)</option>
                <option value="closed">Closed (সমাপ্ত)</option>
              </Select>

              <Textarea
                label="Public Note (Visible on Citizen Track Page)"
                placeholder="e.g. Case assigned to senior reviewer. Evidentiary check in progress."
                value={publicNote}
                onChange={(e) => setPublicNote(e.target.value)}
                rows={2}
                className="text-xs"
              />

              <Textarea
                label="Internal Audit Rationale (Secret Staff Only)"
                placeholder="e.g. GD filing verified with local thana duty register."
                value={internalRationale}
                onChange={(e) => setInternalRationale(e.target.value)}
                rows={2}
                className="text-xs"
              />

              <Button
                variant="primary"
                size="sm"
                isLoading={isUpdating}
                onClick={handleStatusChangeSubmit}
                className="w-full text-xs font-semibold"
              >
                Commit Workflow Transition
              </Button>
            </CardContent>
          </Card>

          {/* Secret Internal Reviewer Notes (NEVER PUBLIC) */}
          <Card className="border-amber-200 bg-amber-50/20">
            <CardHeader className="pb-3 border-b border-amber-200/50">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center justify-between">
                <span>Internal Staff Notes</span>
                <Lock className="w-3.5 h-3.5 text-amber-700" />
              </CardTitle>
              <CardDescription className="text-[11px] text-amber-800">
                Strictly confidential. Never visible to reporter or public.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {internalNotes.map((nt) => (
                  <div
                    key={nt.id}
                    className="p-2.5 bg-white rounded border border-amber-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-amber-900 font-semibold">
                      <span>{nt.author}</span>
                      <span>{nt.date}</span>
                    </div>
                    <p className="text-civic-slate-700 text-xs leading-relaxed">
                      {nt.note}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-amber-200/60 space-y-2">
                <Textarea
                  placeholder="Append confidential deliberation note..."
                  rows={2}
                  value={newInternalNote}
                  onChange={(e) => setNewInternalNote(e.target.value)}
                  className="text-xs bg-white"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!newInternalNote.trim()}
                  onClick={handleAddInternalNote}
                  className="w-full text-xs"
                >
                  Append Note to Case Audit
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
