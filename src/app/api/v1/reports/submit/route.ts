import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ReportSubmissionSchema } from '@/lib/validation/report.schema';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitReport as submitInMemory } from '@/services/reports';
import { generateReportNumber, generateTrackingSecret } from '@/lib/utils';
import { analyzeExternalUrl } from '@/services/evidence';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { canAcceptSubmissions } from '@/lib/security/safe-mode';
import { validateSafeUrl } from '@/lib/security/ssrf';
import { INITIAL_CATEGORIES } from '@/config/constants';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Application-level Rate Limiting Check
    const rateCheck = checkRateLimit('report-submit', clientIp);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many submissions from this IP address. Please wait ${rateCheck.resetSeconds} seconds before submitting again.`,
            retryAfterSeconds: rateCheck.resetSeconds,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetSeconds),
          },
        }
      );
    }

    const body = await req.json();

    // 2. Schema Validation
    const parseResult = ReportSubmissionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid report submission payload',
            details: parseResult.error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        },
        { status: 400 }
      );
    }

    const input = parseResult.data;

    // 3. Emergency Defensive Safe Mode Check
    const safeModeCheck = canAcceptSubmissions(input.privacy_mode);
    if (!safeModeCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SAFE_MODE_ACTIVE',
            message: safeModeCheck.message,
          },
        },
        { status: 503 }
      );
    }

    // 4. SSRF & Protocol Safety Check on External Links
    if (input.evidence_items) {
      for (const ev of input.evidence_items) {
        if (ev.type === 'external_link') {
          const urlSafety = validateSafeUrl(ev.url);
          if (!urlSafety.isValid) {
            return NextResponse.json(
              {
                success: false,
                error: {
                  code: 'SECURITY_URL_PROHIBITED',
                  message: urlSafety.error || 'Prohibited or unsafe external link detected.',
                },
              },
              { status: 400 }
            );
          }
        }
      }
    }

    const admin = createAdminClient();

    if (!admin) {
      // Offline / Local fallback
      const inMemoryResult = await submitInMemory(input);
      return NextResponse.json({
        success: true,
        data: {
          report_number: inMemoryResult.reportNumber,
          tracking_secret: inMemoryResult.trackingSecret,
          report_id: inMemoryResult.reportId,
          status: 'submitted',
        },
      });
    }

    // Supabase Live Persistence
    const reportNumber = generateReportNumber();
    const trackingSecret = generateTrackingSecret();
    const secretHash = crypto.createHash('sha256').update(trackingSecret).digest('hex');

    // Resolve valid UUID for category_id
    let resolvedCategoryId = input.category_id;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input.category_id);
    if (!isUuid) {
      const match = INITIAL_CATEGORIES.find(
        (c) => c.id === input.category_id || c.code === input.category_id
      );
      const code = match ? match.code : input.category_id;
      const { data: catRow } = await admin
        .from('report_categories')
        .select('id')
        .eq('code', code)
        .maybeSingle();

      if (catRow?.id) {
        resolvedCategoryId = catRow.id;
      } else {
        const { data: fallbackCat } = await admin
          .from('report_categories')
          .select('id')
          .limit(1)
          .maybeSingle();
        if (fallbackCat?.id) {
          resolvedCategoryId = fallbackCat.id;
        }
      }
    }

    // Insert Report
    const { data: reportData, error: reportError } = await admin
      .from('reports')
      .insert({
        report_number: reportNumber,
        category_id: resolvedCategoryId,
        privacy_mode: input.privacy_mode,
        incident_date: input.incident_date,
        approximate_time: input.approximate_time || null,
        division: input.division,
        district: input.district,
        upazila_thana: input.upazila_thana || null,
        area_landmark: input.area_landmark || null,
        location_privacy: input.location_privacy,
        institution_type: input.institution_type || null,
        custom_organization_name: input.custom_organization_name || null,
        involved_role_or_title: input.involved_role_or_title || null,
        description: input.description,
        public_summary: null,
        status: 'submitted',
        priority: 1,
        is_public: false,
        verified_status: false,
        tracking_secret_hash: secretHash,
        reporter_name: input.privacy_mode === 'identified' ? input.reporter_name : null,
        reporter_email: input.privacy_mode !== 'anonymous' ? input.reporter_email : null,
        reporter_phone: input.privacy_mode !== 'anonymous' ? input.reporter_phone : null,
      })
      .select('id, report_number, status, created_at')
      .single();

    if (reportError || !reportData) {
      console.error('Database report insert error:', reportError);
      // If table doesn't exist yet in Supabase schema, fall back to in-memory submission
      if (reportError?.code === 'PGRST205') {
        console.warn('Reports table not yet migrated, saving in-memory draft.');
        const inMemoryResult = await submitInMemory(input);
        return NextResponse.json({
          success: true,
          data: {
            report_number: inMemoryResult.reportNumber,
            tracking_secret: inMemoryResult.trackingSecret,
            report_id: inMemoryResult.reportId,
            status: 'submitted',
          },
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SUBMISSION_FAILED',
            message:
              'We could not securely register your report in the encrypted database. Your local draft has been preserved. Please retry shortly.',
          },
        },
        { status: 500 }
      );
    }

    const reportId = reportData.id;

    // Insert Initial Timeline History
    await admin.from('report_status_history').insert({
      report_id: reportId,
      new_status: 'submitted',
      public_note: 'Report securely received and registered in Jababdihi system.',
      internal_rationale: 'Citizen submission intake.',
    });

    // Insert Evidence Items
    if (input.evidence_items && input.evidence_items.length > 0) {
      const evidenceRows = input.evidence_items.map((ev) => {
        if (ev.type === 'external_link') {
          const analysis = analyzeExternalUrl(ev.url);
          return {
            report_id: reportId,
            evidence_type: 'external_link',
            provider: analysis.provider,
            external_url: ev.url,
            external_platform_id: analysis.platformId,
            is_embeddable: analysis.isEmbeddable,
            visibility: 'reviewer_only',
            review_state: 'pending',
            caption: ev.caption || null,
          };
        } else {
          return {
            report_id: reportId,
            evidence_type: ev.type,
            provider: 'direct_upload',
            storage_path: ev.storage_path || null,
            original_filename: ev.original_filename,
            mime_type: ev.mime_type,
            file_size_bytes: ev.file_size_bytes,
            visibility: 'reviewer_only',
            review_state: 'pending',
            caption: ev.caption || null,
          };
        }
      });

      await admin.from('evidence').insert(evidenceRows);
    }

    return NextResponse.json({
      success: true,
      data: {
        report_number: reportNumber,
        tracking_secret: trackingSecret,
        report_id: reportId,
        status: 'submitted',
      },
    });
  } catch (error: any) {
    console.error('Report submission API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
