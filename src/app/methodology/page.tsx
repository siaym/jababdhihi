'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/Card';
import { Shield, Scale, CheckCircle2, AlertTriangle, FileCheck } from 'lucide-react';

export default function MethodologyPage() {
  const { locale, t } = useI18n();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-civic-slate-100 text-civic-slate-800">
          <Scale className="w-3.5 h-3.5 text-civic-slate-600" />
          <span>{locale === 'bn' ? 'যাচাইকরণ মানদণ্ড ও নীতি' : 'Verification Standards'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-civic-navy">
          {locale === 'bn' ? 'প্ল্যাটফর্মের যাচাইকরণ পদ্ধতি ও নীতিমালা' : 'Evidentiary Methodology & Standards'}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 leading-relaxed max-w-2xl">
          To maintain trust with human rights bodies, legal entities, and citizens, the Bangladesh Civic Reporting Platform adheres strictly to verifiable evidentiary criteria.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1 */}
        <Card className="border-civic-slate-200">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-bold text-base text-civic-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>1. What Constitutes an "Allegation" vs "Fact"</span>
            </h3>
            <p className="text-xs sm:text-sm text-civic-slate-700 leading-relaxed">
              Every citizen submission enters our system strictly designated as an <strong>allegation / report</strong>. We do not declare individuals legally guilty of criminal misconduct. Public listings use neutral civic terminology to document that a report alleging a specific incident was submitted and corroborated according to our published standard.
            </p>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card className="border-civic-slate-200">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-bold text-base text-civic-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>2. The 4-Tier Evidentiary Standard</span>
            </h3>
            <div className="space-y-2 text-xs sm:text-sm text-civic-slate-700 leading-relaxed">
              <p>To transition to "Verified" status, a case must satisfy at least one tier:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-civic-slate-600">
                <li><strong>Tier 1 (Documentary Evidence):</strong> Official receipts, stamped GD/FIR copies, termination letters, medical injury reports.</li>
                <li><strong>Tier 2 (Corroborated Testimonies):</strong> Multiple independent eyewitness accounts without personal conflicting interests.</li>
                <li><strong>Tier 3 (Multi-Source Digital Verification):</strong> Time-stamped CCTV footage, verified video matched with known geographic landmarks.</li>
                <li><strong>Tier 4 (Institutional Confirmation):</strong> Target university proctor office, company HR, or police department acknowledging the incident.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card className="border-civic-slate-200">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-bold text-base text-civic-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>3. Prevention of Malicious Reports & Smear Campaigns</span>
            </h3>
            <p className="text-xs sm:text-sm text-civic-slate-700 leading-relaxed">
              Submissions lacking evidentiary foundation, containing fabricated files, or exhibiting traits of personal vendettas are flagged as <em>Unsubstantiated</em> or rejected. Reviewers perform reverse-image searches and metadata consistency checks on all submitted media.
            </p>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card className="border-civic-slate-200">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-bold text-base text-civic-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>4. Institutional Right of Reply</span>
            </h3>
            <p className="text-xs sm:text-sm text-civic-slate-700 leading-relaxed">
              Named institutions (universities, hospitals, police thanas) can submit formal statements through verified institutional communication channels. Approved responses are appended directly to the public case dossier to ensure balanced civic documentation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
