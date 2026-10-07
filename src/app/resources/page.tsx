'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Phone, ExternalLink, Shield, AlertTriangle, LifeBuoy } from 'lucide-react';
import { EMERGENCY_HOTLINES } from '@/config/constants';

export default function ResourcesPage() {
  const { locale, t } = useI18n();

  const legalAidAndNGOs = [
    {
      name: 'Ain o Salish Kendra (ASK)',
      name_bn: 'আইন ও সালিশ কেন্দ্র (আসক)',
      category: 'Legal Aid & Human Rights',
      hotline: '01729294222',
      website: 'https://www.askbd.org',
      desc: 'Free legal counseling and human rights violation litigation assistance.',
    },
    {
      name: 'Bangladesh Legal Aid and Services Trust (BLAST)',
      name_bn: 'বাংলাদেশ লিগ্যাল এইড অ্যান্ড সার্ভিসেস ট্রাস্ট (ব্লাস্ট)',
      category: 'Legal Aid',
      hotline: '01715220220',
      website: 'https://www.blast.org.bd',
      desc: 'Legal support for victims of discrimination, arbitrary arrest, and labor disputes.',
    },
    {
      name: 'National Human Rights Commission (NHRC) Bangladesh',
      name_bn: 'জাতীয় মানবাধিকার কমিশন বাংলাদেশ',
      category: 'Human Rights',
      hotline: '16108',
      website: 'http://www.nhrc.org.bd',
      desc: 'Statutory independent body for addressing human rights violations and law enforcement overreach.',
    },
    {
      name: 'Bangladesh Mahila Parishad',
      name_bn: 'বাংলাদেশ মহিলা পরিষদ',
      category: "Women's Support",
      hotline: '02-9582841',
      website: 'https://mahilaparishad.org',
      desc: 'Legal advice, counseling, and shelter assistance for female victims of harassment and domestic abuse.',
    },
    {
      name: 'Kaan Pete Roi (Emotional Support & Suicide Prevention)',
      name_bn: 'কান পেতে রই',
      category: 'Psychological Support',
      hotline: '01779554391',
      website: 'https://shuni.org',
      desc: 'First emotional support and suicide prevention helpline in Bangladesh.',
    },
    {
      name: 'Department of Inspection for Factories and Establishments (DIFE)',
      name_bn: 'কলকারখানা ও প্রতিষ্ঠান পরিদর্শন অধিদপ্তর',
      category: 'Workplace & Labor',
      hotline: '16358',
      website: 'https://dife.gov.bd',
      desc: 'Government complaint mechanism for hazardous workplace conditions, unpaid wages, and labor rights violations.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <LifeBuoy className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locale === 'bn' ? 'জাতীয় সহায়তা ও জরুরি কেন্দ্র' : 'Support Directory & Verified Hotlines'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-civic-navy">
          {locale === 'bn' ? 'আইনি ও মানসিক সহায়তা ডিরেক্টরি' : 'Civic Assistance & Emergency Hotlines'}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 max-w-3xl leading-relaxed">
          {locale === 'bn'
            ? 'সরকারি ও বেসরকারি অনুমোদিত সহায়তা কেন্দ্র, লিগ্যাল এইড এবং জরুরি নম্বরের যাচাইকৃত তালিকা। তাৎক্ষণিক বিপদে হটলাইনে সরাসরি কল করুন।'
            : 'Verified, official hotlines and accredited legal aid organizations across Bangladesh. All contact numbers are cross-referenced with authorized state and civil society sources.'}
        </p>
      </div>

      {/* Immediate Danger Notice */}
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-sm text-rose-900">
            {locale === 'bn' ? 'আপনি কি তাৎক্ষণিক শারীরিক বিপদে আছেন?' : 'Are you in immediate physical danger?'}
          </h4>
          <p className="text-xs text-rose-800 leading-relaxed">
            {locale === 'bn'
              ? 'যদি আপনার জীবন বা নিরাপত্তা অবিলম্বে হুমকির মুখে থাকে, তবে এই প্ল্যাটফর্মে রিপোর্ট করার পূর্বে তাৎক্ষণিক জাতীয় জরুরি সেবা ৯৯৯ এ কল করুন।'
              : 'If you or someone else faces imminent violence or physical harm, call 999 (National Emergency) immediately rather than submitting an online report.'}
          </p>
        </div>
      </div>

      {/* 1. Official Emergency Hotlines */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-civic-navy">
          {locale === 'bn' ? 'সরকারি জরুরি টোল-ফ্রি হটলাইনসমূহ' : 'Official State Emergency Hotlines'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EMERGENCY_HOTLINES.map((hl) => (
            <Card key={hl.number} className="border-civic-slate-200 bg-white">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-civic-slate-500 uppercase tracking-wider">
                    Toll-Free Hotline
                  </span>
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-civic-slate-900">
                    {locale === 'bn' ? hl.name_bn : hl.name_en}
                  </h3>
                  <p className="text-xs text-civic-slate-600 mt-0.5">
                    {locale === 'bn' ? hl.purpose_bn : hl.purpose_en}
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-civic-slate-100">
                  <span className="font-mono text-xl font-extrabold text-civic-navy">
                    {hl.number}
                  </span>
                  <a
                    href={`tel:${hl.number}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded hover:bg-emerald-100 transition-colors"
                  >
                    <span>Call Now</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 2. Legal Aid, Human Rights & Counseling */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-civic-navy">
          {locale === 'bn' ? 'আইনি সহায়তা ও মানবাধিকার সংস্থা' : 'Accredited Legal Aid & Human Rights NGOs'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {legalAidAndNGOs.map((org) => (
            <Card key={org.name} className="border-civic-slate-200 bg-white flex flex-col justify-between">
              <CardContent className="p-5 space-y-3 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-civic-slate-500 bg-civic-slate-100 px-2 py-0.5 rounded">
                  {org.category}
                </span>
                <div>
                  <h3 className="font-semibold text-sm text-civic-slate-900">
                    {locale === 'bn' ? org.name_bn : org.name}
                  </h3>
                  <p className="text-xs text-civic-slate-600 mt-1 leading-relaxed">
                    {org.desc}
                  </p>
                </div>
              </CardContent>

              <div className="px-5 pb-5 pt-0 border-t border-civic-slate-100 flex items-center justify-between text-xs pt-3">
                <span className="font-mono font-bold text-civic-slate-800">
                  {org.hotline}
                </span>
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-civic-navy hover:underline font-medium"
                >
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
