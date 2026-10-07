'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BarChart3, TrendingUp, CheckCircle, Clock, ShieldCheck, ArrowUpRight, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { locale, t } = useI18n();

  // Metrics following the strict specification
  const metrics = [
    { label: 'Total Reports Received', value: '1,284', desc: 'All citizen allegations documented', color: 'text-civic-navy' },
    { label: 'Reports This Month', value: '142', desc: 'Active intake volume for October', color: 'text-blue-700' },
    { label: 'Under Active Review', value: '412', desc: 'Evidence being corroborated', color: 'text-amber-700' },
    { label: 'Verified Findings', value: '324', desc: 'Met 4-tier evidentiary standard', color: 'text-emerald-700' },
    { label: 'Referred to Agencies', value: '186', desc: 'Transmitted to NHRC, BLAST, etc.', color: 'text-indigo-700' },
    { label: 'Resolved Cases', value: '272', desc: 'Formal resolution recorded', color: 'text-civic-slate-700' },
  ];

  const categoryBreakdown = [
    { name: 'Police & Law Enforcement', count: 342, percentage: 27 },
    { name: 'Corruption & Extortion', count: 288, percentage: 22 },
    { name: 'Abuse & Harassment', count: 214, percentage: 17 },
    { name: 'Education & Campus (Ragging)', count: 182, percentage: 14 },
    { name: 'Government Office Misconduct', count: 124, percentage: 10 },
    { name: 'Workplace & Labor', count: 86, percentage: 7 },
    { name: 'Online & Cyber Crime', count: 48, percentage: 3 },
  ];

  const monthlyIntake = [
    { month: 'May', total: 112, verified: 28 },
    { month: 'Jun', total: 148, verified: 39 },
    { month: 'Jul', total: 284, verified: 82 },
    { month: 'Aug', total: 312, verified: 94 },
    { month: 'Sep', total: 286, verified: 71 },
    { month: 'Oct (Current)', total: 142, verified: 34 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
          <span>{locale === 'bn' ? 'স্বচ্ছ নাগরিক ডেটা ড্যাশবোর্ড' : 'Public Accountability Metrics'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-civic-navy">
          {locale === 'bn' ? 'নাগরিক প্রতিবেদন পর্যবেক্ষণ ড্যাশবোর্ড' : 'National Incident Analytics Dashboard'}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 max-w-3xl leading-relaxed">
          {locale === 'bn'
            ? 'প্ল্যাটফর্মে দাখিলকৃত প্রতিবেদন ও যাচাইকৃত তথ্যের সার্বিক স্বচ্ছ চিত্র। প্রাপ্ত প্রতিবেদন এবং যাচাইকৃত ফলাফল সুস্পষ্টভাবে আলাদা রাখা হয়েছে।'
            : 'Aggregated analytics distinguishing unverified citizen submissions from verified evidentiary findings.'}
        </p>
      </div>

      {/* Critical Distinction Notice */}
      <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Methodology Note:</strong> "Reports received" represents all unvetted citizen allegations. "Verified findings" denotes cases that have successfully satisfied our published 4-tier evidentiary verification standard.
        </span>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {metrics.map((m) => (
          <Card key={m.label} className="border-civic-slate-200">
            <CardContent className="p-4 text-center space-y-1">
              <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
              <div className="text-xs font-semibold text-civic-slate-800">{m.label}</div>
              <div className="text-[10px] text-civic-slate-500 leading-tight">{m.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports by Category */}
        <Card className="border-civic-slate-200">
          <CardHeader>
            <CardTitle className="text-base">
              {locale === 'bn' ? 'বিভাগভিত্তিক প্রতিবেদন বন্টন' : 'Reports by Incident Classification'}
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of allegations received across core civic domains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryBreakdown.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-civic-slate-800">{item.name}</span>
                  <span className="text-civic-slate-500 font-mono">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-civic-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-civic-navy h-full rounded-full transition-all"
                    style={{ width: `${item.percentage * 3.5}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Trend: Received vs Verified */}
        <Card className="border-civic-slate-200">
          <CardHeader>
            <CardTitle className="text-base">
              {locale === 'bn' ? 'মাসিক প্রবণতা (প্রাপ্ত বনাম যাচাইকৃত)' : 'Monthly Intake vs Verified Findings'}
            </CardTitle>
            <CardDescription className="text-xs">
              Comparing incoming citizen submissions against corroborated findings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {monthlyIntake.map((m) => (
              <div key={m.month} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-civic-slate-800">{m.month}</span>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="text-civic-slate-600">Total: {m.total}</span>
                    <span className="text-emerald-700 font-bold">Verified: {m.verified}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {/* Total Bar */}
                  <div className="w-full bg-civic-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-civic-slate-400 h-full rounded-full"
                      style={{ width: `${(m.total / 350) * 100}%` }}
                    />
                  </div>
                  {/* Verified Bar */}
                  <div className="w-full bg-emerald-100/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${(m.verified / 350) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex items-center justify-end gap-4 text-[11px] text-civic-slate-500 pt-2 border-t border-civic-slate-100">
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-civic-slate-400" />
                <span>Reports Received</span>
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-emerald-600" />
                <span>Verified Findings</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
