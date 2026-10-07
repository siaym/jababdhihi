'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { getAllReportsAdmin } from '@/services/reports';
import { Report } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  ShieldAlert,
  Clock,
  Eye,
  CheckCircle,
  ArrowUpRight,
  Filter,
  Search,
  ArrowRight,
  Lock,
  UserCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { locale, t } = useI18n();

  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [safeModeActive, setSafeModeActive] = useState<boolean>(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await getAllReportsAdmin();
      setReports(data);
    } catch {
      // Error handling
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (selectedStatusFilter === 'all') return true;
    return r.status === selectedStatusFilter;
  });

  const countByStatus = (st: string) => reports.filter((r) => r.status === st).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-civic-slate-200 text-civic-slate-800 mb-2">
            <Lock className="w-3.5 h-3.5 text-civic-slate-600" />
            <span>Authorized Reviewer Workspace (গোপনীয় কর্মক্ষেত্র)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-civic-navy">
            Moderation & Reviewer Queue
          </h1>
          <p className="text-xs sm:text-sm text-civic-slate-600">
            Audit case allegations, inspect direct uploads & external evidence, and approve public disclosures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs py-1">
            Role: Senior Reviewer (MFA Enforced)
          </Badge>
        </div>
      </div>

      {/* Defensive System Status & Emergency Safe Mode Bar */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
          safeModeActive ? 'bg-amber-50 border-amber-300' : 'bg-white border-civic-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-3.5 h-3.5 rounded-full ${
              safeModeActive ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-civic-navy">
                Platform Defense State:
              </span>
              <span
                className={`text-xs font-bold ${
                  safeModeActive ? 'text-amber-800' : 'text-emerald-700'
                }`}
              >
                {safeModeActive ? '⚠️ EMERGENCY SAFE MODE ACTIVE' : '● Normal Operations'}
              </span>
            </div>
            <p className="text-[11px] text-civic-slate-500 mt-0.5">
              {safeModeActive
                ? 'Defensive posture engaged: anonymous submissions paused; direct uploads restricted; rate limits elevated 4x.'
                : 'All reporting queues, upload tickets, and verification channels operating normally.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSafeModeActive(!safeModeActive)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
            safeModeActive
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-[#C62828] hover:bg-[#B71C1C] text-white'
          }`}
        >
          {safeModeActive ? 'Restore Normal Mode' : 'Enable Safe Mode'}
        </button>
      </div>

      {/* Triage Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div
          onClick={() => setSelectedStatusFilter('submitted')}
          className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
            selectedStatusFilter === 'submitted'
              ? 'border-civic-navy bg-civic-slate-100 font-bold'
              : 'border-civic-slate-200 bg-white hover:bg-civic-slate-50'
          }`}
        >
          <div className="text-xl font-bold text-civic-navy">{countByStatus('submitted')}</div>
          <div className="text-[11px] text-civic-slate-600 mt-0.5">Submitted</div>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('under_review')}
          className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
            selectedStatusFilter === 'under_review'
              ? 'border-amber-500 bg-amber-50 font-bold'
              : 'border-civic-slate-200 bg-white hover:bg-civic-slate-50'
          }`}
        >
          <div className="text-xl font-bold text-amber-700">{countByStatus('under_review')}</div>
          <div className="text-[11px] text-amber-800 mt-0.5">Under Review</div>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('more_info_required')}
          className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
            selectedStatusFilter === 'more_info_required'
              ? 'border-orange-500 bg-orange-50 font-bold'
              : 'border-civic-slate-200 bg-white hover:bg-civic-slate-50'
          }`}
        >
          <div className="text-xl font-bold text-orange-700">{countByStatus('more_info_required')}</div>
          <div className="text-[11px] text-orange-800 mt-0.5">Needs Info</div>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('evidence_review')}
          className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
            selectedStatusFilter === 'evidence_review'
              ? 'border-purple-500 bg-purple-50 font-bold'
              : 'border-civic-slate-200 bg-white hover:bg-civic-slate-50'
          }`}
        >
          <div className="text-xl font-bold text-purple-700">{countByStatus('evidence_review')}</div>
          <div className="text-[11px] text-purple-800 mt-0.5">Evidence Review</div>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('referred')}
          className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
            selectedStatusFilter === 'referred'
              ? 'border-indigo-500 bg-indigo-50 font-bold'
              : 'border-civic-slate-200 bg-white hover:bg-civic-slate-50'
          }`}
        >
          <div className="text-xl font-bold text-indigo-700">{countByStatus('referred')}</div>
          <div className="text-[11px] text-indigo-800 mt-0.5">Referred</div>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('verified')}
          className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
            selectedStatusFilter === 'verified'
              ? 'border-emerald-500 bg-emerald-50 font-bold'
              : 'border-civic-slate-200 bg-white hover:bg-civic-slate-50'
          }`}
        >
          <div className="text-xl font-bold text-emerald-700">{countByStatus('verified')}</div>
          <div className="text-[11px] text-emerald-800 mt-0.5">Verified</div>
        </div>

        <div
          onClick={() => setSelectedStatusFilter('resolved')}
          className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
            selectedStatusFilter === 'resolved'
              ? 'border-civic-slate-600 bg-civic-slate-100 font-bold'
              : 'border-civic-slate-200 bg-white hover:bg-civic-slate-50'
          }`}
        >
          <div className="text-xl font-bold text-civic-slate-800">{countByStatus('resolved')}</div>
          <div className="text-[11px] text-civic-slate-600 mt-0.5">Resolved</div>
        </div>
      </div>

      {/* Case Management Table */}
      <Card className="border-civic-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Incoming Allegations Queue</CardTitle>
            <CardDescription className="text-xs">
              Showing {filteredReports.length} cases matching active status filter
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedStatusFilter('all')}
            className="text-xs"
          >
            Show All Cases
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-civic-slate-200 bg-civic-slate-50/75 text-civic-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Privacy</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-civic-slate-100">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-civic-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-civic-navy">
                      {r.report_number}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-civic-slate-900">
                      {r.category?.name_en || 'General'}
                    </td>
                    <td className="py-3.5 px-4 text-civic-slate-600">
                      {r.division}, {r.district}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize text-[11px] font-medium text-civic-slate-600 bg-civic-slate-100 px-2 py-0.5 rounded">
                        {r.privacy_mode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-civic-slate-600">
                      {r.evidence_count || 0} items
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={r.status} />
                    </td>
                    <td className="py-3.5 px-4 text-civic-slate-500 whitespace-nowrap">
                      {formatDate(r.created_at, 'en')}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/admin/reports/${r.id}`}>
                        <Button variant="outline" size="sm" className="text-xs gap-1">
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
