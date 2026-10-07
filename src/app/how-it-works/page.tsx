'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, CheckCircle, ArrowRight, Lock, Eye, FileText, Send, Share2 } from 'lucide-react';

export default function HowItWorksPage() {
  const { locale, t } = useI18n();

  const steps = [
    {
      num: '01',
      title: 'Submit a Report (প্রতিবেদন দাখিল)',
      desc: 'Citizen submits incident details through our secure multi-step wizard. You choose between Anonymous, Confidential, or Identified privacy modes.',
      icon: FileText,
    },
    {
      num: '02',
      title: 'Attach Direct or External Evidence (প্রমাণাদি সংযোজন)',
      desc: 'Upload documents, receipts, or images, or paste external video/document links (YouTube, Facebook, Google Drive) without needing heavy file uploads.',
      icon: Share2,
    },
    {
      num: '03',
      title: 'Receive Cryptographic Tracking Secret (গোপন ট্র্যাকিং কি)',
      desc: 'The platform generates your reference code (BD-2026-XXXXXX) and a 16-character tracking secret. Only you possess the secret key to monitor your case.',
      icon: Lock,
    },
    {
      num: '04',
      title: 'Independent Reviewer Examination (নিরপেক্ষ পর্যালোচনা)',
      desc: 'Trained civic moderators evaluate the submission, inspect attached evidence, and redact all personal risks to safeguard reporters and witnesses.',
      icon: Eye,
    },
    {
      num: '05',
      title: 'Two-Way Encrypted Communication (সুরক্ষিত যোগাযোগ)',
      desc: 'Reviewers can request clarifications or additional context via the tracking portal without discovering your real identity.',
      icon: Send,
    },
    {
      num: '06',
      title: 'Institutional Referral & Verification (যাচাই ও রেফারেল)',
      desc: 'Cases satisfying evidentiary thresholds are referred to human rights bodies, legal aid organizations, or official ombudsmen.',
      icon: CheckCircle,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-civic-slate-100 text-civic-slate-800">
          <Shield className="w-3.5 h-3.5 text-civic-slate-600" />
          <span>{locale === 'bn' ? 'কার্যপ্রণালী গাইড' : 'Civic Process Guide'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-civic-navy">
          {locale === 'bn' ? 'প্ল্যাটফর্মটি কীভাবে কাজ করে' : 'How the Reporting System Works'}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 max-w-2xl mx-auto leading-relaxed">
          The Bangladesh Civic Reporting Platform operates on a transparent, six-step protocol designed to maximize citizen safety and enforce rigorous evidentiary accountability.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <Card key={st.num} className="border-civic-slate-200">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-civic-navy text-white flex items-center justify-center shrink-0 font-mono font-bold text-base shadow-sm">
                  {st.num}
                </div>
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-bold text-base text-civic-slate-900">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-civic-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-3">
        <h3 className="font-bold text-base text-civic-navy">
          Ready to Document an Incident?
        </h3>
        <p className="text-xs text-civic-slate-600 max-w-md mx-auto">
          Take the first step toward institutional accountability with complete privacy.
        </p>
        <Link href="/report">
          <Button variant="primary" size="md" className="gap-2 text-xs">
            <span>Report an Incident Now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
