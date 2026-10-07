'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { INITIAL_CATEGORIES, BANGLADESH_DIVISIONS } from '@/config/constants';
import { getPublicReports } from '@/services/reports';
import { Report } from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Building,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

export default function PublicReportsPage() {
  const { locale, t } = useI18n();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReports();
  }, [selectedCategory, selectedDivision, selectedStatus]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await getPublicReports({
        categoryCode: selectedCategory || undefined,
        division: selectedDivision || undefined,
        status: selectedStatus || undefined,
        searchQuery: searchQuery || undefined,
      });
      setReports(data);
    } catch {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDivision('');
    setSelectedStatus('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Heading & Legal Notice */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-civic-navy">
          {locale === 'bn' ? 'প্রকাশিত নাগরিক প্রতিবেদনসমূহ' : 'Public Incident Reports'}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 max-w-3xl leading-relaxed">
          {locale === 'bn'
            ? 'এই তালিকায় প্রদর্শিত সকল তথ্য নাগরিক অভিযোগ ও পর্যবেক্ষণ। এটি কোনো অপরাধ প্রমাণ করে না। পর্যালোচকদের দ্বারা অনুমোদিত প্রতিবেদনসমূহ জনস্বার্থে এখানে প্রকাশিত হয়েছে।'
            : 'All listings represent unverified citizen allegations until confirmed through our evidentiary standards. Published strictly for transparency and civic accountability.'}
        </p>

        {/* Civic Alert Banner */}
        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            {locale === 'bn'
              ? 'ব্যক্তিগত গোপনীয়তা রক্ষার্থে সকল ভিকটিম ও সাক্ষীর নাম এবং সুনির্দিষ্ট ঠিকানা গোপন রাখা হয়েছে।'
              : 'Witness and victim identities and sensitive exact locations are strictly redacted to protect personal safety.'}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-civic-slate-200 bg-white shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-civic-slate-400" />
                <Input
                  placeholder={
                    locale === 'bn'
                      ? 'কীওয়ার্ড, আইডি বা প্রতিষ্ঠানের নাম দিয়ে খুঁজুন...'
                      : 'Search by keyword, Report ID, or institution name...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
              <Button type="submit" variant="primary" size="md" className="gap-2 text-xs">
                <Search className="w-4 h-4" />
                <span>{locale === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 border-t border-civic-slate-100">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs"
              >
                <option value="">{locale === 'bn' ? 'সকল বিভাগ' : 'All Categories'}</option>
                {INITIAL_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.code}>
                    {locale === 'bn' ? cat.name_bn : cat.name_en}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="text-xs"
              >
                <option value="">{locale === 'bn' ? 'সকল বিভাগ (স্থান)' : 'All Divisions'}</option>
                {Object.keys(BANGLADESH_DIVISIONS).map((divName) => (
                  <option key={divName} value={divName}>
                    {divName}
                  </option>
                ))}
              </Select>

              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs"
              >
                <option value="">{locale === 'bn' ? 'সকল অবস্থা' : 'All Statuses'}</option>
                <option value="under_review">Under Review</option>
                <option value="verified">Verified Allegation</option>
                <option value="referred">Referred to Agency</option>
                <option value="resolved">Resolved</option>
              </Select>

              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleResetFilters}
                className="text-xs text-civic-slate-600 hover:text-civic-navy"
              >
                {locale === 'bn' ? 'ফিল্টার মুছুন' : 'Reset Filters'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Reports Listing */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-civic-slate-500">
            {locale === 'bn' ? 'প্রতিবেদন লোড হচ্ছে...' : 'Loading public reports...'}
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-lg border border-civic-slate-200 p-8">
            <ShieldAlert className="w-10 h-10 mx-auto text-civic-slate-400" />
            <h3 className="font-semibold text-base text-civic-slate-800">
              {locale === 'bn' ? 'কোনো প্রতিবেদন পাওয়া যায়নি' : 'No Public Reports Found'}
            </h3>
            <p className="text-xs text-civic-slate-500 max-w-sm mx-auto">
              {locale === 'bn'
                ? 'আপনার বাছাইকৃত ফিল্টারের সাথে মিলে এমন কোনো প্রতিবেদন এই মুহূর্তে নেই।'
                : 'No approved public reports match your selected criteria. Try adjusting your search query or filters.'}
            </p>
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
              {locale === 'bn' ? 'সকল ফিল্টার রিসেট করুন' : 'Clear All Filters'}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((rep) => (
              <Card
                key={rep.id}
                className="hover:border-civic-navy/40 transition-all flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-3 flex-1 flex flex-col">
                  {/* Top Bar: Case ID & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-civic-navy bg-civic-slate-100 px-2 py-0.5 rounded">
                      {rep.report_number}
                    </span>
                    <Badge status={rep.status} />
                  </div>

                  {/* Category Name */}
                  <div className="text-xs font-semibold text-civic-slate-600">
                    {locale === 'bn'
                      ? rep.category?.name_bn
                      : rep.category?.name_en || 'General Incident'}
                  </div>

                  {/* Neutral Allegation Title & Snippet */}
                  <div className="flex-1 space-y-1.5">
                    <h3 className="font-semibold text-sm text-civic-slate-900 line-clamp-2">
                      {rep.public_summary ||
                        `Report alleging misconduct regarding ${
                          rep.custom_organization_name || rep.institution_type || 'unspecified entity'
                        }`}
                    </h3>
                    <p className="text-xs text-civic-slate-600 line-clamp-3 leading-relaxed">
                      {rep.description}
                    </p>
                  </div>

                  {/* Metadata Row */}
                  <div className="pt-3 border-t border-civic-slate-100 flex flex-wrap items-center justify-between text-[11px] text-civic-slate-500 gap-2">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-civic-slate-400" />
                      {rep.division}, {rep.district}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-civic-slate-400" />
                      {formatDate(rep.incident_date, locale)}
                    </span>
                  </div>
                </CardContent>

                <div className="px-5 pb-4 pt-0">
                  <Link href={`/reports/${rep.report_number}`} className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs gap-1.5 hover:bg-civic-slate-50"
                    >
                      <span>
                        {locale === 'bn' ? 'বিস্তারিত তথ্য দেখুন' : 'View Case Dossier'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
