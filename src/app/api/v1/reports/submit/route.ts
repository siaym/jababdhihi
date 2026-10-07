import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { ReportSubmissionSchema } from '@/lib/validation/report.schema';
import { createAdminClient } from '@/lib/supabase/admin';
import { submitReport as submitInMemory } from '@/services/reports';
import { generateReportNumber, generateTrackingSecret } from '@/lib/utils';
import { analyzeExternalUrl } from '@/services/evidence';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
    const reportSeq = Math.floor(1000 + Math.random() * 9000);
    const reportNumber = generateReportNumber(reportSeq);
    const trackingSecret = generateTrackingSecret();
    const secretHash = crypto.createHash('sha256').update(trackingSecret).digest('hex');

    // 1. Insert Report
    const { data: reportData, error: reportError } = await admin
      .from('reports')
      .insert({
        report_number: reportNumber,
        category_id: input.category_id,
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
      // Fallback gracefully
      const fallback = await submitInMemory(input);
      return NextResponse.json({
        success: true,
        data: {
          report_number: fallback.reportNumber,
          tracking_secret: fallback.trackingSecret,
          report_id: fallback.reportId,
          status: 'submitted',
        },
      });
    }

    const reportId = reportData.id;

    // 2. Insert Initial Timeline History
    await admin.from('report_status_history').insert({
      report_id: reportId,
      new_status: 'submitted',
      public_note: 'Report securely received and registered in Jababdihi system.',
      internal_rationale: 'Citizen submission intake.',
    });

    // 3. Insert Evidence Items
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
