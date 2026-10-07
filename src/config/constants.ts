import { ReportCategory } from '@/types';

export const BANGLADESH_DIVISIONS: Record<string, string[]> = {
  'Dhaka': [
    'Dhaka', 'Gazipur', 'Kishoreganj', 'Manikganj', 'Munshiganj', 'Narayanganj',
    'Narsingdi', 'Tangail', 'Faridpur', 'Gopalganj', 'Madaripur', 'Rajbari', 'Shariatpur'
  ],
  'Chattogram': [
    'Chattogram', 'Cox\'s Bazar', 'Cumilla', 'Brahmanbaria', 'Chandpur', 'Feni',
    'Lakshmipur', 'Noakhali', 'Khagrachhari', 'Rangamati', 'Bandarban'
  ],
  'Rajshahi': [
    'Rajshahi', 'Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Nawabganj', 'Pabna', 'Sirajganj'
  ],
  'Khulna': [
    'Khulna', 'Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Kushtia',
    'Magura', 'Meherpur', 'Narail', 'Satkhira'
  ],
  'Barishal': [
    'Barishal', 'Barguna', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'
  ],
  'Sylhet': [
    'Sylhet', 'Habiganj', 'Moulvibazar', 'Sunamganj'
  ],
  'Rangpur': [
    'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon'
  ],
  'Mymensingh': [
    'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'
  ]
};

export const INITIAL_CATEGORIES: ReportCategory[] = [
  {
    id: 'cat-1',
    code: 'abuse_harassment',
    name_en: 'Abuse & Harassment',
    name_bn: 'নির্যাতন ও হয়রানি',
    description_en: 'Physical abuse, verbal harassment, sexual harassment, bullying, ragging, or stalking.',
    description_bn: 'শারীরিক নির্যাতন, মৌখিক হয়রানি, যৌন হয়রানি, বুলিং, র‍্যাগিং অথবা মানসিক নিপীড়ন।',
    icon: 'AlertTriangle',
    display_order: 1,
  },
  {
    id: 'cat-2',
    code: 'corruption',
    name_en: 'Corruption & Bribery',
    name_bn: 'দুর্নীতি ও ঘুস',
    description_en: 'Bribery demands, extortion (chanda), procurement fraud, or abuse of authority.',
    description_bn: 'ঘুস দাবি, চাঁদাবাজি, আর্থিক অনিয়ম বা প্রশাসনিক ক্ষমতার অপব্যবহার।',
    icon: 'DollarSign',
    display_order: 2,
  },
  {
    id: 'cat-3',
    code: 'violence',
    name_en: 'Violence & Threats',
    name_bn: 'সহিংসতা ও হুমকি',
    description_en: 'Physical violence, death threats, public or institutional violence.',
    description_bn: 'শারীরিক মারধর, প্রাণনাশের হুমকি, অস্ত্র প্রদর্শন বা সংগঠিত সহিংসতা।',
    icon: 'ShieldAlert',
    display_order: 3,
  },
  {
    id: 'cat-4',
    code: 'police',
    name_en: 'Police & Law Enforcement',
    name_bn: 'আইনশৃঙ্খলা বাহিনীর অনিয়ম',
    description_en: 'Excessive force, unlawful custody, extortion, or refusal to take FIR/GD.',
    description_bn: 'অন্যায় আটক, অতিরিক্ত বলপ্রয়োগ, অর্থ দাবি বা জিডি/মামলা নিতে অস্বীকৃতি।',
    icon: 'BadgeAlert',
    display_order: 4,
  },
  {
    id: 'cat-5',
    code: 'education',
    name_en: 'Education & Campus',
    name_bn: 'শিক্ষা প্রতিষ্ঠান ও ক্যাম্পাস',
    description_en: 'University misconduct, dormitory ragging, illegal fees, or teacher misconduct.',
    description_bn: 'বিশ্ববিদ্যালয়/কলেজে নিপীড়ন, হল র‍্যাগিং, অবৈধ ফি আদায় বা শিক্ষক অসদাচরণ।',
    icon: 'GraduationCap',
    display_order: 5,
  },
  {
    id: 'cat-6',
    code: 'workplace',
    name_en: 'Workplace & Labor',
    name_bn: 'কর্মক্ষেত্র ও শ্রম অধিকার',
    description_en: 'Workplace harassment, wage theft, employer abuse, or unsafe conditions.',
    description_bn: 'কর্মস্থলে হয়রানি, বেতন বকেয়া রাখা, অন্যায় ছাঁটাই বা ঝুঁকিপূর্ণ পরিবেশ।',
    icon: 'Briefcase',
    display_order: 6,
  },
  {
    id: 'cat-7',
    code: 'government',
    name_en: 'Government Office Misconduct',
    name_bn: 'সরকারি দপ্তর ও সেবা ভোগান্তি',
    description_en: 'Harassment or bribery at land, passport, BRTA, or administrative offices.',
    description_bn: 'ভূমি, পাসপোর্ট, বিআরটিএ বা অন্যান্য সরকারি অফিসে অনিয়ম ও ভোগান্তি।',
    icon: 'Building2',
    display_order: 7,
  },
  {
    id: 'cat-8',
    code: 'public_space',
    name_en: 'Public Space & Transport',
    name_bn: 'গণপরিসর ও পরিবহন',
    description_en: 'Street harassment, transport extortion, illegal occupation of public paths.',
    description_bn: 'গণপরিবহনে হয়রানি, সড়কে চাঁদাবাজি বা জনসাধারণের পথ অবৈধ দখল।',
    icon: 'Car',
    display_order: 8,
  },
  {
    id: 'cat-9',
    code: 'online',
    name_en: 'Online & Cyber Crime',
    name_bn: 'সাইবার ও অনলাইন অপরাধ',
    description_en: 'Cyber harassment, blackmail, non-consensual images, or digital fraud.',
    description_bn: 'অনলাইন হয়রানি, ব্ল্যাকমেইল, ব্যক্তিগত ছবি অপব্যবহার বা ডিজিটাল প্রতারণা।',
    icon: 'Globe',
    display_order: 9,
  },
  {
    id: 'cat-10',
    code: 'other',
    name_en: 'Other Public Interest Incident',
    name_bn: 'অন্যান্য জনস্বার্থ বিষয়ক',
    description_en: 'Controlled classification for incidents of strong public interest.',
    description_bn: 'জনস্বার্থে গুরুত্বপূর্ণ অন্যান্য যেকোনো অনিয়ম বা অন্যায্য ঘটনা।',
    icon: 'HelpCircle',
    display_order: 10,
  },
];

export const STATUS_CONFIG: Record<
  string,
  { label_en: string; label_bn: string; colorClass: string; stepNumber: number }
> = {
  submitted: {
    label_en: 'Submitted',
    label_bn: 'দাখিল করা হয়েছে',
    colorClass: 'bg-slate-100 text-slate-800 border-slate-300',
    stepNumber: 1,
  },
  received: {
    label_en: 'Received',
    label_bn: 'গৃহীত হয়েছে',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300',
    stepNumber: 2,
  },
  under_review: {
    label_en: 'Under Review',
    label_bn: 'পর্যালোচনাধীন',
    colorClass: 'bg-amber-100 text-amber-800 border-amber-300',
    stepNumber: 3,
  },
  more_info_required: {
    label_en: 'More Information Required',
    label_bn: 'অতিরিক্ত তথ্য প্রয়োজন',
    colorClass: 'bg-orange-100 text-orange-800 border-orange-300',
    stepNumber: 3,
  },
  evidence_review: {
    label_en: 'Evidence Review',
    label_bn: 'প্রমাণ পর্যালোচনাধীন',
    colorClass: 'bg-purple-100 text-purple-800 border-purple-300',
    stepNumber: 3,
  },
  reviewed: {
    label_en: 'Review Completed',
    label_bn: 'পর্যালোচনা সম্পন্ন',
    colorClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    stepNumber: 4,
  },
  referred: {
    label_en: 'Referred to Agency',
    label_bn: 'সংস্থায় প্রেরিত',
    colorClass: 'bg-teal-100 text-teal-800 border-teal-300',
    stepNumber: 5,
  },
  verified: {
    label_en: 'Verified Allegation',
    label_bn: 'যাচাইকৃত প্রতিবেদন',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    stepNumber: 5,
  },
  unsubstantiated: {
    label_en: 'Unsubstantiated',
    label_bn: 'অপর্যাপ্ত প্রমাণ',
    colorClass: 'bg-gray-100 text-gray-700 border-gray-300',
    stepNumber: 5,
  },
  resolved: {
    label_en: 'Resolved',
    label_bn: 'নিষ্পত্তি হয়েছে',
    colorClass: 'bg-emerald-200 text-emerald-900 border-emerald-400',
    stepNumber: 6,
  },
  closed: {
    label_en: 'Closed',
    label_bn: 'সমাপ্ত',
    colorClass: 'bg-slate-200 text-slate-800 border-slate-400',
    stepNumber: 6,
  },
};

export const EMERGENCY_HOTLINES = [
  {
    name_en: 'National Emergency Service',
    name_bn: 'জাতীয় জরুরি সেবা',
    number: '999',
    purpose_en: 'Police, Fire Service, Ambulance',
    purpose_bn: 'পুলিশ, ফায়ার সার্ভিস, অ্যাম্বুলেন্স',
  },
  {
    name_en: 'Violence Against Women & Children',
    name_bn: 'নারী ও শিশু নির্যাতন প্রতিরোধ হেল্পলাইন',
    number: '109',
    purpose_en: 'Toll-free 24/7 support & emergency intervention',
    purpose_bn: 'টোল-ফ্রি ২৪/৭ জরুরি সহায়তা ও আইনি পরামর্শ',
  },
  {
    name_en: 'Government Information & Services',
    name_bn: 'সরকারি তথ্য ও সেবা',
    number: '333',
    purpose_en: 'Social problems, child marriage prevention, citizen services',
    purpose_bn: 'সামাজিক সমস্যা, বাল্যবিয়ে প্রতিরোধ ও নাগরিক তথ্য',
  },
  {
    name_en: 'Anti-Corruption Commission (DUDOK)',
    name_bn: 'দুদক হটলাইন',
    number: '106',
    purpose_en: 'Report bribery and government corruption',
    purpose_bn: 'ঘুষ গ্রহণ ও দুর্নীতির অভিযোগ দাখিল',
  },
  {
    name_en: 'Cyber Crime Investigation Division',
    name_bn: 'সাইবার ক্রাইম ইনভেস্টিগেশন',
    number: '01320000888',
    purpose_en: 'DMP Cyber Crime Helpline for harassment & digital blackmail',
    purpose_bn: 'ডিএমপি সাইবার ক্রাইম ইউনিট (হয়রানি ও ব্ল্যাকমেইল প্রতিরোধ)',
  },
];
