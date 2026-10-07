'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Building2, Search, Shield, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

export default function OrganizationsDirectoryPage() {
  const { locale, t } = useI18n();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const organizations = [
    {
      id: 'org-1',
      name_en: 'Dhaka Metropolitan Police (DMP)',
      name_bn: 'ঢাকা মেট্রোপলিটন পুলিশ (ডিএমপি)',
      type: 'Police',
      division: 'Dhaka',
      reportsReceived: 184,
      verifiedFindings: 42,
      officialResponsePresent: true,
    },
    {
      id: 'org-2',
      name_en: 'University of Chittagong',
      name_bn: 'চট্টগ্রাম বিশ্ববিদ্যালয়',
      type: 'University',
      division: 'Chattogram',
      reportsReceived: 76,
      verifiedFindings: 19,
      officialResponsePresent: true,
    },
    {
      id: 'org-3',
      name_en: 'Bangladesh Road Transport Authority (BRTA)',
      name_bn: 'বাংলাদেশ সড়ক পরিবহন কর্তৃপক্ষ (বিআরটিএ)',
      type: 'Government',
      division: 'Dhaka',
      reportsReceived: 142,
      verifiedFindings: 31,
      officialResponsePresent: false,
    },
    {
      id: 'org-4',
      name_en: 'Jahangirnagar University',
      name_bn: 'জাহাঙ্গীরনগর বিশ্ববিদ্যালয়',
      type: 'University',
      division: 'Dhaka',
      reportsReceived: 52,
      verifiedFindings: 14,
      officialResponsePresent: true,
    },
    {
      id: 'org-5',
      name_en: 'Department of Immigration & Passports (Agargaon)',
      name_bn: 'ইমিগ্রেশন ও পাসপোর্ট অধিদপ্তর (আগারগাঁও)',
      type: 'Government',
      division: 'Dhaka',
      reportsReceived: 98,
      verifiedFindings: 22,
      officialResponsePresent: false,
    },
    {
      id: 'org-6',
      name_en: 'Rajshahi Medical College Hospital',
      name_bn: 'রাজশাহী মেডিকেল কলেজ হাসপাতাল',
      type: 'Hospital',
      division: 'Rajshahi',
      reportsReceived: 44,
      verifiedFindings: 8,
      officialResponsePresent: true,
    },
  ];

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.name_bn.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || org.type.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-civic-slate-100 text-civic-slate-800">
          <Building2 className="w-3.5 h-3.5 text-civic-slate-600" />
          <span>{locale === 'bn' ? 'প্রাতিষ্ঠানিক জবাবদিহিতা ডিরেক্টরি' : 'Institutional Directory'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-civic-navy">
          {locale === 'bn' ? 'প্রতিষ্ঠান ও দপ্তরের প্রতিবেদন পরিসংখ্যান' : 'Organizations & Public Entities'}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 max-w-3xl leading-relaxed">
          {locale === 'bn'
            ? 'বিশ্ববিদ্যালয়, আইনশৃঙ্খলা বাহিনী, হাসপাতাল ও সরকারি সেবা দপ্তরভিত্তিক সামগ্রিক প্রতিবেদন চিত্র। প্রাপ্ত অভিযোগ মানেই প্রমাণিত অপরাধ নয়।'
            : 'Aggregated public accountability data for educational, governmental, and public institutions. Total allegations received are tracked distinctly from verified findings.'}
        </p>
      </div>

      {/* Distinction Alert */}
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Strict Neutrality Principle:</strong> The number of "Reports received" does NOT imply that all allegations are proven. Only "Verified findings" have met our evidentiary standards. Organizations are provided an official right of reply.
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-civic-slate-400" />
          <Input
            placeholder={
              locale === 'bn'
                ? 'প্রতিষ্ঠানের নাম দিয়ে অনুসন্ধান করুন...'
                : 'Search institutions by name...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full sm:w-48 text-xs"
        >
          <option value="all">{locale === 'bn' ? 'সকল ধরন' : 'All Types'}</option>
          <option value="police">Police</option>
          <option value="university">University</option>
          <option value="government">Government Office</option>
          <option value="hospital">Hospital</option>
        </Select>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOrgs.map((org) => (
          <Card key={org.id} className="border-civic-slate-200 hover:border-civic-navy/40 transition-all flex flex-col justify-between">
            <CardContent className="p-5 space-y-4 flex-1">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-civic-slate-500 bg-civic-slate-100 px-2 py-0.5 rounded">
                  {org.type}
                </span>
                <span className="text-xs text-civic-slate-500">
                  {org.division}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-base text-civic-slate-900">
                  {locale === 'bn' ? org.name_bn : org.name_en}
                </h3>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 bg-civic-slate-50 p-3 rounded border border-civic-slate-100 text-center">
                <div>
                  <div className="text-lg font-bold text-civic-navy font-mono">
                    {org.reportsReceived}
                  </div>
                  <div className="text-[10px] text-civic-slate-500 font-medium">
                    Reports Received
                  </div>
                </div>

                <div>
                  <div className="text-lg font-bold text-emerald-700 font-mono">
                    {org.verifiedFindings}
                  </div>
                  <div className="text-[10px] text-emerald-800 font-medium">
                    Verified Findings
                  </div>
                </div>
              </div>

              {org.officialResponsePresent && (
                <div className="flex items-center gap-1.5 text-[11px] text-blue-700 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Official response on file</span>
                </div>
              )}
            </CardContent>

            <div className="px-5 pb-4 pt-0">
              <Link href={`/reports?searchQuery=${encodeURIComponent(org.name_en)}`} className="block">
                <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                  <span>View Related Allegations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
