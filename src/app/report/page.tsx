'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert';
import { INITIAL_CATEGORIES, BANGLADESH_DIVISIONS } from '@/config/constants';
import { analyzeExternalUrl } from '@/services/evidence';
import { submitReport } from '@/services/reports';
import { EvidenceItem } from '@/types';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Link as LinkIcon,
  Plus,
  Trash2,
  Lock,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Video,
  Save,
  WifiOff,
  RotateCcw,
} from 'lucide-react';

export default function ReportWizardPage() {
  const { locale, t } = useI18n();
  const router = useRouter();

  // Wizard Step (1 to 5, and 6 for Confirmation)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [categoryId, setCategoryId] = useState<string>('');
  const [incidentDate, setIncidentDate] = useState<string>('');
  const [approximateTime, setApproximateTime] = useState<string>('');
  const [division, setDivision] = useState<string>('Dhaka');
  const [district, setDistrict] = useState<string>('Dhaka');
  const [upazilaThana, setUpazilaThana] = useState<string>('');
  const [areaLandmark, setAreaLandmark] = useState<string>('');
  const [locationPrivacy, setLocationPrivacy] = useState<'exact' | 'approximate' | 'confidential'>('approximate');
  const [description, setDescription] = useState<string>('');

  // Involved Entities
  const [institutionType, setInstitutionType] = useState<string>('police');
  const [customOrgName, setCustomOrgName] = useState<string>('');
  const [involvedRole, setInvolvedRole] = useState<string>('');

  // Evidence Items
  const [externalUrlInput, setExternalUrlInput] = useState<string>('');
  const [evidenceCaption, setEvidenceCaption] = useState<string>('');
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [externalUrlError, setExternalUrlError] = useState<string>('');

  // Privacy Mode
  const [privacyMode, setPrivacyMode] = useState<'anonymous' | 'confidential' | 'identified'>('anonymous');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterEmail, setReporterEmail] = useState<string>('');
  const [reporterPhone, setReporterPhone] = useState<string>('');
  const [consentAgreed, setConsentAgreed] = useState<boolean>(false);

  // Submission State & Result
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submissionResult, setSubmissionResult] = useState<{
    reportNumber: string;
    trackingSecret: string;
    reportId: string;
  } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);

  // Offline & Temporary Safe Draft Handling
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [draftFound, setDraftFound] = useState<boolean>(false);
  const [draftSavedNotice, setDraftSavedNotice] = useState<string>('');
  const DRAFT_KEY = 'jababdihi_report_draft_v1';

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for existing draft on device
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.description || parsed.categoryId || parsed.customOrgName)) {
          setDraftFound(true);
        }
      }
    } catch {}

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaveDraft = () => {
    try {
      const draft = {
        categoryId,
        incidentDate,
        approximateTime,
        division,
        district,
        upazilaThana,
        areaLandmark,
        locationPrivacy,
        institutionType,
        customOrgName,
        involvedRole,
        description,
        privacyMode,
        currentStep,
        savedAt: new Date().toLocaleTimeString(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setDraftSavedNotice(
        locale === 'bn'
          ? `খসড়াটি এই ডিভাইসে সংরক্ষিত হয়েছে (${draft.savedAt})`
          : `Draft saved locally on this device at ${draft.savedAt}.`
      );
      setTimeout(() => setDraftSavedNotice(''), 4000);
    } catch {}
  };

  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.categoryId) setCategoryId(draft.categoryId);
        if (draft.incidentDate) setIncidentDate(draft.incidentDate);
        if (draft.approximateTime) setApproximateTime(draft.approximateTime);
        if (draft.division) setDivision(draft.division);
        if (draft.district) setDistrict(draft.district);
        if (draft.upazilaThana) setUpazilaThana(draft.upazilaThana);
        if (draft.areaLandmark) setAreaLandmark(draft.areaLandmark);
        if (draft.locationPrivacy) setLocationPrivacy(draft.locationPrivacy);
        if (draft.institutionType) setInstitutionType(draft.institutionType);
        if (draft.customOrgName) setCustomOrgName(draft.customOrgName);
        if (draft.involvedRole) setInvolvedRole(draft.involvedRole);
        if (draft.description) setDescription(draft.description);
        if (draft.privacyMode) setPrivacyMode(draft.privacyMode);
        if (draft.currentStep) setCurrentStep(draft.currentStep);
        setDraftFound(false);
      }
    } catch {}
  };

  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setDraftFound(false);
    } catch {}
  };

  // District options based on chosen Division
  const availableDistricts = BANGLADESH_DIVISIONS[division] || [];

  // Handle Division change
  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const districts = BANGLADESH_DIVISIONS[newDiv];
    if (districts && districts.length > 0) {
      setDistrict(districts[0]);
    }
  };

  // Add External Evidence Link
  const handleAddExternalLink = () => {
    setExternalUrlError('');
    if (!externalUrlInput.trim()) return;

    const analysis = analyzeExternalUrl(externalUrlInput);
    if (!analysis.isValid) {
      setExternalUrlError(analysis.error || 'Invalid or insecure URL provided.');
      return;
    }

    setEvidenceList((prev) => [
      ...prev,
      {
        type: 'external_link',
        provider: analysis.provider,
        url: externalUrlInput.trim(),
        caption: evidenceCaption.trim() || undefined,
        is_embeddable: analysis.isEmbeddable,
        platform_id: analysis.platformId,
        warning_notice: analysis.warningNotice,
      },
    ]);

    setExternalUrlInput('');
    setEvidenceCaption('');
  };

  // Simulate file upload (direct evidence)
  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    let evType: 'image' | 'video' | 'audio' | 'document' = 'document';
    if (file.type.startsWith('image/')) evType = 'image';
    else if (file.type.startsWith('video/')) evType = 'video';
    else if (file.type.startsWith('audio/')) evType = 'audio';

    setEvidenceList((prev) => [
      ...prev,
      {
        type: evType,
        provider: 'direct_upload',
        original_filename: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size_bytes: file.size,
        caption: file.name,
      },
    ]);
  };

  const removeEvidenceItem = (index: number) => {
    setEvidenceList((prev) => prev.filter((_, i) => i !== index));
  };

  // Submission handler
  const handleSubmit = async () => {
    if (!consentAgreed) {
      setErrorMsg('You must agree to the civic accuracy statement before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await submitReport({
        category_id: categoryId,
        incident_date: incidentDate || new Date().toISOString().split('T')[0],
        approximate_time: approximateTime || undefined,
        division,
        district,
        upazila_thana: upazilaThana || undefined,
        area_landmark: areaLandmark || undefined,
        location_privacy: locationPrivacy,
        institution_type: institutionType,
        custom_organization_name: customOrgName || undefined,
        involved_role_or_title: involvedRole || undefined,
        description,
        privacy_mode: privacyMode,
        reporter_name: privacyMode !== 'anonymous' ? reporterName : undefined,
        reporter_email: privacyMode !== 'anonymous' ? reporterEmail : undefined,
        reporter_phone: privacyMode !== 'anonymous' ? reporterPhone : undefined,
        consent: true,
        evidence_items: evidenceList,
      });

      setSubmissionResult(res);
      try {
        localStorage.removeItem(DRAFT_KEY);
        setDraftFound(false);
      } catch {}
      setCurrentStep(6); // Step 6 = Confirmation
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please check required fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Context */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locale === 'bn' ? 'সুরক্ষিত নাগরিক প্রতিবেদন পোর্টাল' : 'Secure Incident Documentation'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-civic-navy">
          {locale === 'bn' ? 'ঘটনা নথিভুক্ত করুন' : 'Submit an Incident Report'}
        </h1>
        <p className="text-xs sm:text-sm text-civic-slate-600 max-w-xl mx-auto">
          {locale === 'bn'
            ? 'আপনার নিরাপত্তা নিশ্চিত করতে প্রতিটি তথ্য এনক্রিপ্ট করা হয়। সঠিক তথ্য দিয়ে ন্যায়বিচার নিশ্চিত করতে সহায়তা করুন।'
            : 'All submissions are encrypted and handled as confidential citizen allegations. Zero account registration required.'}
        </p>
      </div>

      {/* Progress Stepper Bar (Hidden on Confirmation) */}
      {currentStep < 6 && (
        <div className="border-b border-civic-slate-200 pb-4">
          <div className="flex items-center justify-between text-xs font-medium text-civic-slate-500">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-1.5 ${
                  currentStep === step
                    ? 'text-civic-navy font-bold'
                    : currentStep > step
                    ? 'text-emerald-700 font-semibold'
                    : ''
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    currentStep === step
                      ? 'bg-civic-navy text-white'
                      : currentStep > step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-civic-slate-200 text-civic-slate-600'
                  }`}
                >
                  {currentStep > step ? '✓' : step}
                </div>
                <span className="hidden sm:inline">
                  {step === 1 && t('wizard.step1')}
                  {step === 2 && t('wizard.step2')}
                  {step === 3 && t('wizard.step3')}
                  {step === 4 && t('wizard.step4')}
                  {step === 5 && t('wizard.step5')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg flex items-start gap-3 text-amber-900 text-xs">
          <WifiOff className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block">
              {locale === 'bn' ? 'ইন্টারনেট সংযোগ বিচ্ছিন্ন' : 'Internet Connection Interrupted'}
            </span>
            <span>
              {locale === 'bn'
                ? 'আপনার লিখিত তথ্য এই ডিভাইসে সুরক্ষিত আছে। পুনরায় সংযোগ এলে জমা দিতে পারবেন।'
                : 'Your entered information is safely preserved on this device. You can continue writing and submit once reconnected.'}
            </span>
          </div>
        </div>
      )}

      {/* Draft Recovery Banner */}
      {draftFound && currentStep < 6 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              {locale === 'bn'
                ? 'এই ডিভাইসে পূর্বের একটি অসম্পূর্ণ প্রতিবেদন খসড়া পাওয়া গেছে।'
                : 'An unsaved report draft was found on this device.'}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-2.5 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
            >
              {locale === 'bn' ? 'পুনরুদ্ধার করুন' : 'Restore'}
            </button>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="px-2 py-1 text-slate-500 hover:text-slate-700 transition-colors"
            >
              {locale === 'bn' ? 'মুছে ফেলুন' : 'Discard'}
            </button>
          </div>
        </div>
      )}

      {/* Draft Save Control */}
      {currentStep < 6 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span className="italic">
            {draftSavedNotice || (locale === 'bn' ? 'তথ্য এই ব্রাউজারে সুরক্ষিত' : 'Progress saved on this device')}
          </span>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>{locale === 'bn' ? 'খসড়া সংরক্ষণ' : 'Save Draft'}</span>
          </button>
        </div>
      )}

      {/* STEP 1: CATEGORY SELECTION */}
      {currentStep === 1 && (
        <Card className="border-civic-slate-200">
          <CardHeader>
            <CardTitle>{t('wizard.step1')}</CardTitle>
            <CardDescription>
              {locale === 'bn'
                ? 'আপনার ঘটনার সাথে সবচেয়ে প্রাসঙ্গিক বিভাগটি নির্বাচন করুন।'
                : 'Select the primary classification that matches the incident you wish to report.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {INITIAL_CATEGORIES.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`text-left p-4 rounded-lg border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-civic-navy bg-civic-slate-50 ring-2 ring-civic-navy/20 shadow-sm'
                        : 'border-civic-slate-200 hover:border-civic-slate-300 hover:bg-civic-slate-50/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-civic-navy text-white'
                          : 'bg-civic-slate-100 text-civic-slate-600'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-civic-slate-900">
                        {locale === 'bn' ? cat.name_bn : cat.name_en}
                      </div>
                      <div className="text-xs text-civic-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {locale === 'bn' ? cat.description_bn : cat.description_en}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              variant="primary"
              disabled={!categoryId}
              onClick={() => setCurrentStep(2)}
              className="gap-2 text-xs sm:text-sm"
            >
              <span>{t('wizard.next')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: INCIDENT DETAILS & LOCATION */}
      {currentStep === 2 && (
        <Card className="border-civic-slate-200">
          <CardHeader>
            <CardTitle>{t('wizard.step2')}</CardTitle>
            <CardDescription>
              {locale === 'bn'
                ? 'ঘটনাটি কবে, কোথায় এবং কীভাবে ঘটেছিল তা উল্লেখ করুন।'
                : 'Provide chronological and geographic details. You control how precisely your location is displayed.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('wizard.dateLabel')}
                type="date"
                required
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
              />
              <Input
                label={t('wizard.timeLabel')}
                placeholder="e.g. 20:30 (রাত ৮:৩০)"
                value={approximateTime}
                onChange={(e) => setApproximateTime(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label={t('wizard.divisionLabel')}
                value={division}
                onChange={(e) => handleDivisionChange(e.target.value)}
              >
                {Object.keys(BANGLADESH_DIVISIONS).map((divName) => (
                  <option key={divName} value={divName}>
                    {divName}
                  </option>
                ))}
              </Select>

              <Select
                label={t('wizard.districtLabel')}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                {availableDistricts.map((distName) => (
                  <option key={distName} value={distName}>
                    {distName}
                  </option>
                ))}
              </Select>

              <Input
                label={t('wizard.thanaLabel')}
                placeholder="e.g. Mirpur, Hathazari"
                value={upazilaThana}
                onChange={(e) => setUpazilaThana(e.target.value)}
              />
            </div>

            <Input
              label={t('wizard.areaLabel')}
              placeholder="e.g. Mirpur 10 circle, Faculty Building entrance"
              value={areaLandmark}
              onChange={(e) => setAreaLandmark(e.target.value)}
            />

            {/* Location Privacy Radios */}
            <div className="p-3.5 bg-civic-slate-50 rounded-lg border border-civic-slate-200 space-y-2">
              <label className="text-xs font-semibold text-civic-slate-700 block">
                {t('wizard.locationPrivacyLabel')}
              </label>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locPrivacy"
                    checked={locationPrivacy === 'approximate'}
                    onChange={() => setLocationPrivacy('approximate')}
                    className="text-civic-navy focus:ring-civic-navy"
                  />
                  <span>{t('wizard.locationApprox')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locPrivacy"
                    checked={locationPrivacy === 'exact'}
                    onChange={() => setLocationPrivacy('exact')}
                    className="text-civic-navy focus:ring-civic-navy"
                  />
                  <span>{t('wizard.locationExact')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="locPrivacy"
                    checked={locationPrivacy === 'confidential'}
                    onChange={() => setLocationPrivacy('confidential')}
                    className="text-civic-navy focus:ring-civic-navy"
                  />
                  <span>{t('wizard.locationPrivate')}</span>
                </label>
              </div>
            </div>

            <Textarea
              label={t('wizard.descLabel')}
              required
              rows={5}
              placeholder={t('wizard.descPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              helperText={`${description.length} characters (minimum 20)`}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('wizard.back')}</span>
            </Button>
            <Button
              variant="primary"
              disabled={description.length < 20}
              onClick={() => setCurrentStep(3)}
              className="gap-2 text-xs"
            >
              <span>{t('wizard.next')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: INVOLVED ENTITIES */}
      {currentStep === 3 && (
        <Card className="border-civic-slate-200">
          <CardHeader>
            <CardTitle>{t('wizard.step3')}</CardTitle>
            <CardDescription>
              {locale === 'bn'
                ? 'সংশ্লিষ্ট প্রতিষ্ঠান বা কর্মকর্তার ভূমিকা উল্লেখ করুন।'
                : 'Identify the institution or official roles involved in the incident.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="warning">
              <AlertTitle>{locale === 'bn' ? 'সতর্কতা' : 'Safety Notice'}</AlertTitle>
              <AlertDescription>{t('wizard.entityNotice')}</AlertDescription>
            </Alert>

            <Select
              label={t('wizard.entityOrgType')}
              value={institutionType}
              onChange={(e) => setInstitutionType(e.target.value)}
            >
              <option value="police">Police / Law Enforcement</option>
              <option value="university">University / Higher Education</option>
              <option value="school">School / College</option>
              <option value="government">Government Office / Public Administration</option>
              <option value="hospital">Hospital / Healthcare</option>
              <option value="company">Private Company / Employer</option>
              <option value="public_space">Public Transport / Street</option>
              <option value="other">Other Entity</option>
            </Select>

            <Input
              label={t('wizard.entityOrgName')}
              placeholder="e.g. Mirpur Model Thana, University of Chittagong"
              value={customOrgName}
              onChange={(e) => setCustomOrgName(e.target.value)}
            />

            <Input
              label={t('wizard.entityRole')}
              placeholder="e.g. Duty Officer, Hostel Assistant, Head Clerk"
              value={involvedRole}
              onChange={(e) => setInvolvedRole(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('wizard.back')}</span>
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(4)} className="gap-2 text-xs">
              <span>{t('wizard.next')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: EVIDENCE & EXTERNAL LINKS */}
      {currentStep === 4 && (
        <Card className="border-civic-slate-200">
          <CardHeader>
            <CardTitle>{t('wizard.step4')}</CardTitle>
            <CardDescription>
              {locale === 'bn'
                ? 'ছবি, নথি বা বাহ্যিক ভিডিও লিঙ্ক যোগ করে প্রতিবেদনকে নির্ভরযোগ্য করুন।'
                : 'Corroborate your report with direct documents or external links (YouTube, Facebook, Google Drive).'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* External Evidence Link Section */}
            <div className="p-4 bg-civic-slate-50 rounded-lg border border-civic-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-civic-navy">
                <LinkIcon className="w-4 h-4 text-accent-teal" />
                <span>{t('wizard.externalLinksTitle')}</span>
              </div>
              <p className="text-xs text-civic-slate-600">
                {t('wizard.externalLinksDesc')} (YouTube, Facebook, Google Drive, Google Photos, Dropbox)
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder={t('wizard.externalUrlPlaceholder')}
                  value={externalUrlInput}
                  onChange={(e) => setExternalUrlInput(e.target.value)}
                  error={externalUrlError}
                  className="flex-1 text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddExternalLink}
                  className="gap-1.5 text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('wizard.externalAddBtn')}</span>
                </Button>
              </div>

              <Input
                placeholder="Optional caption / note for this link (ঐচ্ছিক বিবরণ)"
                value={evidenceCaption}
                onChange={(e) => setEvidenceCaption(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Direct File Upload */}
            <div className="p-4 bg-white rounded-lg border border-dashed border-civic-slate-300 text-center space-y-2">
              <Upload className="w-6 h-6 mx-auto text-civic-slate-400" />
              <div className="text-xs font-medium text-civic-slate-700">
                {t('wizard.evidenceUploadTitle')}
              </div>
              <p className="text-[11px] text-civic-slate-500">
                {t('wizard.evidenceUploadDesc')}
              </p>
              <label className="inline-flex">
                <input
                  type="file"
                  multiple
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                />
                <span className="cursor-pointer inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-civic-navy bg-civic-slate-100 hover:bg-civic-slate-200 rounded border border-civic-slate-300 transition-colors">
                  Choose File (ছবি বা নথি নির্বাচন করুন)
                </span>
              </label>
            </div>

            {/* Evidence List Preview */}
            {evidenceList.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-civic-slate-700">
                  Attached Evidence ({evidenceList.length})
                </h4>
                <div className="space-y-2">
                  {evidenceList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded border border-civic-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {item.type === 'external_link' ? (
                          <ExternalLink className="w-4 h-4 text-accent-teal shrink-0" />
                        ) : (
                          <FileText className="w-4 h-4 text-civic-slate-500 shrink-0" />
                        )}
                        <span className="font-medium text-civic-slate-800 truncate">
                          {item.url || item.original_filename}
                        </span>
                        {item.warning_notice && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                            External source
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeEvidenceItem(idx)}
                        className="text-civic-slate-400 hover:text-alert p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(3)} className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('wizard.back')}</span>
            </Button>
            <Button variant="primary" onClick={() => setCurrentStep(5)} className="gap-2 text-xs">
              <span>{t('wizard.next')}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 5: PRIVACY & SUBMIT */}
      {currentStep === 5 && (
        <Card className="border-civic-slate-200">
          <CardHeader>
            <CardTitle>{t('wizard.step5')}</CardTitle>
            <CardDescription>
              {locale === 'bn'
                ? 'আপনার গোপনীয়তার স্তর নির্বাচন করুন এবং নিশ্চিতকরণ সম্পন্ন করুন।'
                : 'Choose your desired privacy level and submit for review.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMsg && (
              <Alert variant="destructive">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            {/* Privacy Mode Selector */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-civic-slate-700">
                {t('wizard.privacyModeTitle')}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Anonymous */}
                <button
                  type="button"
                  onClick={() => setPrivacyMode('anonymous')}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    privacyMode === 'anonymous'
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-civic-slate-200 hover:bg-civic-slate-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-civic-slate-900 flex items-center justify-between">
                    <span>{t('wizard.modeAnonymous')}</span>
                    <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-civic-slate-600 mt-1 leading-relaxed">
                    {t('wizard.modeAnonymousDesc')}
                  </p>
                </button>

                {/* 2. Confidential */}
                <button
                  type="button"
                  onClick={() => setPrivacyMode('confidential')}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    privacyMode === 'confidential'
                      ? 'border-civic-navy bg-civic-slate-50 ring-2 ring-civic-navy/20'
                      : 'border-civic-slate-200 hover:bg-civic-slate-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-civic-slate-900 flex items-center justify-between">
                    <span>{t('wizard.modeConfidential')}</span>
                    <Eye className="w-3.5 h-3.5 text-civic-navy" />
                  </div>
                  <p className="text-xs text-civic-slate-600 mt-1 leading-relaxed">
                    {t('wizard.modeConfidentialDesc')}
                  </p>
                </button>

                {/* 3. Identified */}
                <button
                  type="button"
                  onClick={() => setPrivacyMode('identified')}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    privacyMode === 'identified'
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                      : 'border-civic-slate-200 hover:bg-civic-slate-50'
                  }`}
                >
                  <div className="font-semibold text-sm text-civic-slate-900 flex items-center justify-between">
                    <span>{t('wizard.modeIdentified')}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <p className="text-xs text-civic-slate-600 mt-1 leading-relaxed">
                    {t('wizard.modeIdentifiedDesc')}
                  </p>
                </button>
              </div>
            </div>

            {/* Contact details for Confidential / Identified */}
            {privacyMode !== 'anonymous' && (
              <div className="p-4 bg-civic-slate-50 rounded-lg border border-civic-slate-200 space-y-3">
                <div className="text-xs font-semibold text-civic-slate-800">
                  {locale === 'bn' ? 'যোগাযোগের তথ্য (গোপন রাখা হবে)' : 'Contact Details (Encrypted at Rest)'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Full Name"
                    placeholder="Your name"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="email@example.com"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="017xxxxxxxx"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Consent Agreement */}
            <div className="p-4 bg-civic-slate-50 rounded-lg border border-civic-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentAgreed}
                  onChange={(e) => setConsentAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-civic-navy focus:ring-civic-navy h-4 w-4"
                />
                <span className="text-xs text-civic-slate-700 leading-relaxed">
                  {t('wizard.consentCheckbox')}
                </span>
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(4)} className="gap-2 text-xs">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('wizard.back')}</span>
            </Button>
            <Button
              variant="success"
              isLoading={isSubmitting}
              disabled={!consentAgreed || isSubmitting}
              onClick={handleSubmit}
              className="gap-2 text-xs sm:text-sm font-semibold"
            >
              <span>{isSubmitting ? t('wizard.submitting') : t('wizard.submit')}</span>
              <CheckCircle className="w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 6: CONFIRMATION & SECRET CREDENTIALS DISPLAY */}
      {currentStep === 6 && submissionResult && (
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl sm:text-2xl text-civic-navy">
              {t('confirmation.title')}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-civic-slate-600">
              {t('confirmation.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Report Reference Code Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-civic-slate-200 text-center">
                <div className="text-xs font-semibold text-civic-slate-500 uppercase">
                  {t('confirmation.reportNumber')}
                </div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-civic-navy mt-1">
                  {submissionResult.reportNumber}
                </div>
              </div>

              {/* Secret Tracking Key Box */}
              <div className="p-4 bg-white rounded-lg border border-amber-300 text-center relative group">
                <div className="text-xs font-semibold text-amber-800 uppercase">
                  {t('confirmation.trackingSecret')}
                </div>
                <div className="text-xl sm:text-2xl font-mono font-bold text-amber-700 mt-1 select-all">
                  {submissionResult.trackingSecret}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(submissionResult.trackingSecret)}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-civic-navy font-semibold hover:underline"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>
                    {copiedSecret ? t('confirmation.copied') : t('confirmation.copySecret')}
                  </span>
                </button>
              </div>
            </div>

            {/* Warning Callout */}
            <Alert variant="warning">
              <AlertDescription className="font-medium text-xs">
                ⚠️ {t('confirmation.warning')}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <Link
              href={`/track?number=${encodeURIComponent(submissionResult.reportNumber)}&secret=${encodeURIComponent(submissionResult.trackingSecret)}`}
            >
              <Button variant="primary" className="w-full sm:w-auto text-xs gap-2">
                <span>{t('confirmation.trackNow')}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full sm:w-auto text-xs">
                {locale === 'bn' ? 'হোমপেজে ফিরে যান' : 'Return to Home'}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
