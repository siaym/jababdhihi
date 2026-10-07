'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { BANGLADESH_DIVISIONS, INITIAL_CATEGORIES } from '@/config/constants';
import { MapPin, Shield, AlertCircle, ArrowRight, BarChart2 } from 'lucide-react';

export default function BangladeshMapPage() {
  const { locale, t } = useI18n();

  const [selectedDivision, setSelectedDivision] = useState<string>('Dhaka');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Realistic aggregate count data per division
  const divisionStats: Record<string, { count: number; verified: number; referred: number }> = {
    Dhaka: { count: 482, verified: 142, referred: 86 },
    Chattogram: { count: 294, verified: 88, referred: 42 },
    Rajshahi: { count: 142, verified: 36, referred: 22 },
    Khulna: { count: 118, verified: 28, referred: 16 },
    Barishal: { count: 76, verified: 14, referred: 8 },
    Sylhet: { count: 68, verified: 11, referred: 7 },
    Rangpur: { count: 59, verified: 9, referred: 5 },
    Mymensingh: { count: 45, verified: 7, referred: 4 },
  };

  const activeStats = divisionStats[selectedDivision] || { count: 0, verified: 0, referred: 0 };
  const districts = BANGLADESH_DIVISIONS[selectedDivision] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locale === 'bn' ? 'জাতীয় ভৌগোলিক পর্যবেক্ষণ' : 'Geographic Accountability Map'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-civic-navy">
          {locale === 'bn' ? 'বাংলাদেশ নাগরিক ঘটনা মানচিত্র' : 'Bangladesh Civic Incident Map'}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 max-w-3xl leading-relaxed">
          {locale === 'bn'
            ? 'ভিকটিম বা সাক্ষীর নিরাপত্তা রক্ষার্থে কোনো সুনির্দিষ্ট সংবেদনশীল স্থানাঙ্ক (GPS) প্রকাশ করা হয় না। বিভাগ ও জেলা পর্যায়ে সার্বিক প্রতিবেদন চিত্র এখানে প্রদর্শিত।'
            : 'To prevent endangering individuals or disclosing residences, exact coordinates are strictly obscured in favor of division and district aggregations.'}
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          {locale === 'bn'
            ? 'সুরক্ষা নীতি: এই মানচিত্র কোনো ভিকটিমের বাসস্থান, কর্মস্থল বা হোস্টেল রুম চিহ্নিত করে না।'
            : 'Privacy Policy: This map is strictly aggregated to prevent pinpointing victim homes, hostels, or exact incident coordinates.'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Division Selector & Interactive Aggregate Visualizer */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-civic-slate-200">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">
                    {locale === 'bn' ? 'বিভাগভিত্তিক তথ্য' : 'Division Density Overview'}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {locale === 'bn' ? 'একটি বিভাগ নির্বাচন করে জেলাভিত্তিক বিবরণ দেখুন' : 'Select a division to inspect district distributions'}
                  </CardDescription>
                </div>

                <Select
                  value={selectedDivision}
                  onChange={(e) => setSelectedDivision(e.target.value)}
                  className="w-44 text-xs"
                >
                  {Object.keys(BANGLADESH_DIVISIONS).map((divName) => (
                    <option key={divName} value={divName}>
                      {divName} ({divisionStats[divName]?.count || 0})
                    </option>
                  ))}
                </Select>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Division Summary Card */}
              <div className="grid grid-cols-3 gap-3 bg-civic-slate-50 p-4 rounded-lg border border-civic-slate-200 text-center">
                <div>
                  <div className="text-2xl font-bold text-civic-navy">{activeStats.count}</div>
                  <div className="text-[11px] text-civic-slate-500 font-medium mt-0.5">Total Reports</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-700">{activeStats.verified}</div>
                  <div className="text-[11px] text-emerald-800 font-medium mt-0.5">Verified Allegations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-700">{activeStats.referred}</div>
                  <div className="text-[11px] text-indigo-800 font-medium mt-0.5">Referred to Agencies</div>
                </div>
              </div>

              {/* District Breakdown Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase text-civic-slate-700">
                  {selectedDivision} Division Districts ({districts.length})
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {districts.map((dist, idx) => {
                    const distCount = Math.max(1, Math.round(activeStats.count / (districts.length + idx * 0.4)));
                    return (
                      <div
                        key={dist}
                        className="p-3 bg-white rounded border border-civic-slate-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-civic-slate-800">{dist}</span>
                        <span className="font-mono font-bold text-civic-navy bg-civic-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {distCount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Division Ranking & Quick Filters */}
        <div className="space-y-6">
          <Card className="border-civic-slate-200">
            <CardHeader>
              <CardTitle className="text-base">
                {locale === 'bn' ? 'জাতীয় প্রতিবেদন বন্টন' : 'National Distribution'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(divisionStats).map((divName) => {
                const stat = divisionStats[divName];
                const pct = Math.round((stat.count / 1284) * 100);
                const isSelected = selectedDivision === divName;
                return (
                  <button
                    key={divName}
                    type="button"
                    onClick={() => setSelectedDivision(divName)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-civic-navy bg-civic-slate-50 font-semibold'
                        : 'border-civic-slate-100 hover:bg-civic-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-civic-slate-900">{divName}</span>
                      <span className="font-mono text-civic-navy font-bold">{stat.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-civic-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full"
                        style={{ width: `${pct * 2}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-civic-slate-200 bg-emerald-50/20">
            <CardContent className="p-5 space-y-3">
              <h4 className="font-semibold text-sm text-civic-navy">
                {locale === 'bn' ? 'আপনার এলাকায় কোনো ঘটনা ঘটেছে?' : 'Witnessed an Incident in Your Area?'}
              </h4>
              <p className="text-xs text-civic-slate-600 leading-relaxed">
                {locale === 'bn'
                  ? 'গোপনীয়তা রক্ষা করে প্রতিবেদন দাখিল করুন। কোনো ব্যক্তিগত পরিচয় সর্বসাধারণের সামনে প্রকাশ করা হবে না।'
                  : 'Document incidents securely. All personal identifiers are protected in our encrypted vault.'}
              </p>
              <Link href="/report" className="block pt-1">
                <Button variant="primary" size="sm" className="w-full text-xs">
                  {locale === 'bn' ? 'প্রতিবেদন দাখিল করুন' : 'Submit Incident Report'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
