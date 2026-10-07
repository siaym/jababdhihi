'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusTimeline } from '@/components/ui/StatusTimeline';
import { EvidenceCard } from '@/components/ui/EvidenceCard';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { trackReport, sendCaseMessage } from '@/services/reports';
import { Report, ReportStatusHistoryItem, EvidenceItem, CaseMessage } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Lock,
  Search,
  MessageSquare,
  Send,
  Shield,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  User,
} from 'lucide-react';

function TrackReportContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();

  const [reportNumber, setReportNumber] = useState<string>(
    searchParams.get('number') || ''
  );
  const [trackingSecret, setTrackingSecret] = useState<string>(
    searchParams.get('secret') || ''
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const [caseData, setCaseData] = useState<{
    report: Report;
    timeline: ReportStatusHistoryItem[];
    evidence: EvidenceItem[];
    messages: CaseMessage[];
  } | null>(null);

  // New message form state
  const [newMsgText, setNewMsgText] = useState<string>('');
  const [isSendingMsg, setIsSendingMsg] = useState<boolean>(false);

  // Auto-query if URL params are present
  useEffect(() => {
    if (searchParams.get('number') && searchParams.get('secret')) {
      handleLookup(searchParams.get('number')!, searchParams.get('secret')!);
    }
  }, [searchParams]);

  const handleLookup = async (num = reportNumber, sec = trackingSecret) => {
    if (!num.trim() || !sec.trim()) {
      setErrorMsg('Please enter both your Report ID and Secret Tracking Passkey.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await trackReport(num, sec);
      if (!data) {
        setErrorMsg('Invalid Report Reference ID or Tracking Secret. Please verify your credentials.');
        setCaseData(null);
      } else {
        setCaseData(data);
      }
    } catch (err: any) {
      setErrorMsg('Failed to look up report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!caseData || !newMsgText.trim()) return;

    setIsSendingMsg(true);
    try {
      const sent = await sendCaseMessage(caseData.report.id, 'reporter', newMsgText.trim());
      setCaseData((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, sent],
            }
          : null
      );
      setNewMsgText('');
    } catch {
      // Handle error
    } finally {
      setIsSendingMsg(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-civic-slate-100 text-civic-slate-800">
          <Lock className="w-3.5 h-3.5 text-civic-slate-600" />
          <span>{locale === 'bn' ? 'গোপন ট্র্যাকিং পোর্টাল' : 'Private Case Tracking'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-civic-navy">
          {t('track.title')}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 max-w-xl mx-auto">
          {t('track.subtitle')}
        </p>
      </div>

      {/* Query Lookup Form */}
      <Card className="border-civic-slate-200">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={locale === 'bn' ? 'প্রতিবেদন নম্বর' : 'Report ID'}
              placeholder={t('track.numberPlaceholder')}
              value={reportNumber}
              onChange={(e) => setReportNumber(e.target.value)}
            />
            <Input
              label={locale === 'bn' ? 'গোপন ট্র্যাকিং কি' : 'Secret Tracking Passkey'}
              placeholder={t('track.secretPlaceholder')}
              value={trackingSecret}
              type="text"
              onChange={(e) => setTrackingSecret(e.target.value)}
            />
          </div>

          {errorMsg && (
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end pt-1">
            <Button
              variant="primary"
              isLoading={isLoading}
              onClick={() => handleLookup()}
              className="gap-2 text-xs sm:text-sm"
            >
              <Search className="w-4 h-4" />
              <span>{t('track.queryBtn')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Case Details Panel */}
      {caseData && (
        <div className="space-y-6">
          {/* Dossier Header */}
          <Card className="border-civic-slate-200">
            <CardHeader className="border-b border-civic-slate-100 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-lg text-civic-navy">
                      {caseData.report.report_number}
                    </span>
                    <Badge status={caseData.report.status} />
                  </div>
                  <div className="text-xs text-civic-slate-500">
                    {locale === 'bn' ? 'দাখিলের তারিখ:' : 'Submitted:'}{' '}
                    {formatDate(caseData.report.created_at, locale)} •{' '}
                    {caseData.report.division}, {caseData.report.district}
                  </div>
                </div>

                <div className="text-xs font-medium text-civic-slate-600 bg-civic-slate-50 px-3 py-1.5 rounded border border-civic-slate-200 self-start sm:self-auto">
                  {caseData.report.category?.name_en || 'General Incident'}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase text-civic-slate-500 mb-1">
                  {locale === 'bn' ? 'ঘটনার বিবরণ' : 'Report Narrative'}
                </h4>
                <p className="text-xs sm:text-sm text-civic-slate-700 leading-relaxed bg-civic-slate-50 p-3.5 rounded border border-civic-slate-100">
                  {caseData.report.description}
                </p>
              </div>

              {caseData.report.custom_organization_name && (
                <div className="text-xs text-civic-slate-600">
                  <span className="font-semibold">Target Entity:</span>{' '}
                  {caseData.report.custom_organization_name} (
                  {caseData.report.involved_role_or_title || 'Unspecified Role'})
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline of Status Progression */}
          <Card className="border-civic-slate-200">
            <CardHeader>
              <CardTitle className="text-base">{t('track.timelineTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline
                history={caseData.timeline}
                currentStatus={caseData.report.status}
              />
            </CardContent>
          </Card>

          {/* Attached Evidence Reviews */}
          <Card className="border-civic-slate-200">
            <CardHeader>
              <CardTitle className="text-base">{t('track.evidenceTitle')}</CardTitle>
              <CardDescription>
                {locale === 'bn'
                  ? 'আপনার প্রতিবেদনের সাথে সংযুক্ত প্রমাণাদির যাচাইকরণ অবস্থা।'
                  : 'Review status of uploaded files and external links attached to this report.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {caseData.evidence.length === 0 ? (
                <div className="text-xs text-civic-slate-500 py-3">
                  No evidence files attached.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {caseData.evidence.map((item) => (
                    <EvidenceCard
                      key={item.id}
                      evidence={item}
                      showReviewState={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Two-Way Encrypted Messaging Channel */}
          <Card className="border-civic-slate-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-civic-navy" />
                <span>{t('track.messagesTitle')}</span>
              </CardTitle>
              <CardDescription>
                {locale === 'bn'
                  ? 'পর্যালোচকের সাথে সরাসরি ও সুরক্ষিত যোগাযোগ চ্যানেল। আপনার পরিচয় সম্পূর্ণ গোপন থাকে।'
                  : 'Communicate directly with the assigned case review team. Reviewer names and personal contacts are strictly protected.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message Feed */}
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {caseData.messages.length === 0 ? (
                  <div className="text-xs text-civic-slate-500 py-4 text-center">
                    {t('track.noMessages')}
                  </div>
                ) : (
                  caseData.messages.map((msg) => {
                    const isReporter = msg.sender_type === 'reporter';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isReporter ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className="text-[10px] text-civic-slate-500 mb-0.5">
                          {isReporter
                            ? locale === 'bn'
                              ? 'আপনি (নাগরিক)'
                              : 'You (Citizen)'
                            : locale === 'bn'
                            ? 'পর্যালোচক দল'
                            : 'Civic Reviewer Team'}
                        </div>
                        <div
                          className={`max-w-[85%] rounded-lg px-3.5 py-2 text-xs leading-relaxed ${
                            isReporter
                              ? 'bg-civic-navy text-white rounded-br-none'
                              : 'bg-civic-slate-100 text-civic-slate-900 border border-civic-slate-200 rounded-bl-none'
                          }`}
                        >
                          {msg.message_text}
                        </div>
                        <span className="text-[9px] text-civic-slate-400 mt-0.5">
                          {formatDate(msg.created_at, locale)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input Form */}
              <div className="pt-2 border-t border-civic-slate-100 space-y-2">
                <Textarea
                  placeholder={
                    locale === 'bn'
                      ? 'পর্যালোচককে অতিরিক্ত তথ্য বা উত্তর লিখুন...'
                      : 'Provide additional information or reply to reviewer queries...'
                  }
                  rows={3}
                  value={newMsgText}
                  onChange={(e) => setNewMsgText(e.target.value)}
                  className="text-xs"
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!newMsgText.trim() || isSendingMsg}
                    isLoading={isSendingMsg}
                    onClick={handleSendMessage}
                    className="gap-1.5 text-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{t('track.sendMsgBtn')}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function TrackReportPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto py-16 text-center text-xs text-civic-slate-500">Loading tracking portal...</div>}>
      <TrackReportContent />
    </Suspense>
  );
}
