'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, AlertTriangle, Phone, Lock, EyeOff, FileCheck } from 'lucide-react';

export default function SafetyCenterPage() {
  const { locale, t } = useI18n();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span>{locale === 'bn' ? 'ব্যক্তিগত নিরাপত্তা গাইড' : 'Personal Safety Center'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-civic-navy">
          {locale === 'bn' ? 'নাগরিক নিরাপত্তা ও প্রমাণ সংরক্ষণের নিয়ম' : 'Citizen Safety & Evidence Preservation Guide'}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 leading-relaxed max-w-2xl">
          Your personal physical and digital safety is our highest priority. Before documenting or submitting an incident, review these essential safety precautions.
        </p>
      </div>

      {/* Immediate Danger Banner */}
      <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Phone className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-rose-900">
              Immediate Danger Protocol
            </h3>
            <p className="text-xs text-rose-800 mt-0.5">
              If you are facing active physical threats or retaliation, call 999 or 109 immediately. Do NOT pause to file an online report.
            </p>
          </div>
        </div>
        <a href="tel:999" className="shrink-0">
          <Button variant="destructive" size="sm" className="text-xs font-bold">
            Call 999 Now
          </Button>
        </a>
      </div>

      {/* Core Safety Directives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-civic-slate-200">
          <CardContent className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-civic-navy text-white flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-base text-civic-slate-900">
              1. Never Confront Dangerous Perpetrators
            </h3>
            <p className="text-xs text-civic-slate-600 leading-relaxed">
              Do not escalate or attempt to capture footage if doing so puts you or bystanders in immediate physical jeopardy. Witness testimony can be documented later in a safe location.
            </p>
          </CardContent>
        </Card>

        <Card className="border-civic-slate-200">
          <CardContent className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-base text-civic-slate-900">
              2. Secure Original Digital Copies
            </h3>
            <p className="text-xs text-civic-slate-600 leading-relaxed">
              Always preserve unaltered original files (uncompressed photos, video files, audio recordings) on encrypted offline storage (e.g., password-protected USB or secure cloud drive).
            </p>
          </CardContent>
        </Card>

        <Card className="border-civic-slate-200">
          <CardContent className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-base text-civic-slate-900">
              3. Guard Your Tracking Passkey
            </h3>
            <p className="text-xs text-civic-slate-600 leading-relaxed">
              Your 16-character tracking passkey is the sole cryptographic credential to access your case messages and status. Do not share it via unencrypted SMS or public social channels.
            </p>
          </CardContent>
        </Card>

        <Card className="border-civic-slate-200">
          <CardContent className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-base text-civic-slate-900">
              4. Protect Private Witness Data
            </h3>
            <p className="text-xs text-civic-slate-600 leading-relaxed">
              Never share phone numbers, NID numbers, or residential addresses of other victims or third-party witnesses without their explicit informed consent.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="p-6 bg-civic-slate-100 rounded-xl border border-civic-slate-200 text-center space-y-3">
        <h3 className="font-bold text-base text-civic-slate-900">
          Seek Free Confidential Legal Advice
        </h3>
        <p className="text-xs text-civic-slate-600 max-w-lg mx-auto">
          Need advice from an accredited human rights attorney? Explore our directory of partner legal aid organizations.
        </p>
        <Link href="/resources">
          <Button variant="outline" size="sm" className="text-xs">
            View Legal Aid Directory
          </Button>
        </Link>
      </div>
    </div>
  );
}
