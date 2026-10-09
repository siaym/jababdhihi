import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ReportSubmissionSchema } from '@/lib/validation/report.schema';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitReport as submitInMemory } from '@/services/reports';
import { generateReportNumber, generateTrackingSecret } from '@/lib/utils';
import { analyzeExternalUrl } from '@/services/evidence';
import { checkRateLimitAsync, getClientIp } from '@/lib/security/rate-limit';
import { canAcceptSubmissionsAsync } from '@/lib/security/safe-mode';
import { validateSafeUrlAsync } from '@/lib/security/ssrf';
import { encryptField } from '@/lib/security/encryption';
import { isProductionEnvironment } from '@/lib/security/auth-check';
import { INITIAL_CATEGORIES } from '@/config/constants';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Distributed Rate Limiting Check
    const rateCheck = await checkRateLimitAsync('report-submit', clientIp);
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

    // 3. Emergency Defensive Safe Mode Check (authoritative async)
    const safeModeCheck = await canAcceptSubmissionsAsync(input.privacy_mode);
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

    // 4. DNS-Aware SSRF & Protocol Safety Check on External Links (async DNS resolution)
    if (input.evidence_items) {
      for (const ev of input.evidence_items) {
        if (ev.type === 'external_link') {
          const urlSafety = await validateSafeUrlAsync(ev.url);
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
      if (isProductionEnvironment()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Database submission service unavailable in production. Mock mode is disabled in production.',
            },
          },
          { status: 503 }
        );
      }
      // Offline / Local development fallback
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

    // 5. Insert Core Report without Plaintext PII (P0-2)
    // Contact info is NEVER stored in the main reports table
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
      })
      .select('id, report_number, status, created_at')
      .single();

    if (reportError || !reportData) {
      console.error('Database report insert error:', reportError);
      // In non-production only, handle schema migrating fallback
      if (reportError?.code === 'PGRST205' && !isProductionEnvironment()) {
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

    // 6. P0-2: Store confidential contacts encrypted in dedicated `reporter_contacts` table
    if (input.privacy_mode !== 'anonymous') {
      const hasContactInfo = input.reporter_name || input.reporter_email || input.reporter_phone;
      if (hasContactInfo) {
        const { error: contactErr } = await admin.from('reporter_contacts').insert({
          report_id: reportId,
          reporter_name: input.privacy_mode === 'identified' ? input.reporter_name : null,
          encrypted_phone: input.reporter_phone ? encryptField(input.reporter_phone) : null,
          encrypted_email: input.reporter_email ? encryptField(input.reporter_email) : null,
          preferred_contact_method: 'in_app',
          can_contact_for_clarification: true,
        });

        if (contactErr) {
          console.error('Failed to store encrypted reporter contacts, rolling back report:', contactErr);
          await admin.from('reports').delete().eq('id', reportId);
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'SUBMISSION_FAILED',
                message: 'Failed to securely encrypt and store reporter contact information.',
              },
            },
            { status: 500 }
          );
        }
      }
    }

    // 7. P1-5: Insert Initial Timeline History with atomic rollback on failure
    const { error: histError } = await admin.from('report_status_history').insert({
      report_id: reportId,
      new_status: 'submitted',
      public_note: 'Report securely received and registered in Jababdihi system.',
      internal_rationale: 'Citizen submission intake.',
    });

    if (histError) {
      console.error('Timeline insert failed, rolling back report:', histError);
      await admin.from('reports').delete().eq('id', reportId);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SUBMISSION_FAILED',
            message: 'Failed to initialize case timeline history.',
          },
        },
        { status: 500 }
      );
    }

    // 8. P1-5: Insert Evidence Items with atomic rollback on failure
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

      const { error: evError } = await admin.from('evidence').insert(evidenceRows);
      if (evError) {
        console.error('Evidence items insert failed, rolling back report:', evError);
        await admin.from('reports').delete().eq('id', reportId);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SUBMISSION_FAILED',
              message: 'Failed to securely attach evidence items.',
            },
          },
          { status: 500 }
        );
      }
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
