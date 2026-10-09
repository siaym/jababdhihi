import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { trackReport as trackInMemory } from '@/services/reports';
import { checkRateLimitAsync, getClientIp } from '@/lib/security/rate-limit';
import { isProductionEnvironment } from '@/lib/security/auth-check';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Distributed Rate Limiting: protect against brute-force passkey guessing
    const rateCheck = await checkRateLimitAsync('report-track', clientIp);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many tracking attempts. Please wait ${rateCheck.resetSeconds} seconds.`,
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
    const { report_number, tracking_secret } = body;

    if (!report_number || !tracking_secret) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Both report_number and tracking_secret are required',
          },
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    if (!admin) {
      if (isProductionEnvironment()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Database tracking service unavailable in production.',
            },
          },
          { status: 503 }
        );
      }

      // In-memory fallback
      const result = await trackInMemory(report_number, tracking_secret);
      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Invalid Report Reference ID or Tracking Passkey',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // 2. Cryptographic Secret Lookup
    const trimmedNum = report_number.trim();
    const trimmedSec = tracking_secret.trim();
    const candidateHash = crypto.createHash('sha256').update(trimmedSec).digest('hex');

    // Strict projection: never select internal notes, reviewer assignments, or reporter contacts
    const REPORT_TRACKING_COLUMNS = [
      'id',
      'report_number',
      'category_id',
      'privacy_mode',
      'incident_date',
      'approximate_time',
      'division',
      'district',
      'upazila_thana',
      'area_landmark',
      'location_privacy',
      'institution_type',
      'custom_organization_name',
      'involved_role_or_title',
      'description',
      'public_summary',
      'status',
      'priority',
      'is_public',
      'verified_status',
      'created_at',
      'updated_at',
      'tracking_secret_hash',
      'category:report_categories(id, code, name_en, name_bn, icon)',
    ].join(', ');

    const { data: report, error: reportErr } = await admin
      .from('reports')
      .select(REPORT_TRACKING_COLUMNS)
      .eq('report_number', trimmedNum)
      .single();

    if (reportErr || !report) {
      // In non-production, check in-memory fallback
      if (!isProductionEnvironment()) {
        const fallback = await trackInMemory(trimmedNum, trimmedSec);
        if (fallback) {
          return NextResponse.json({ success: true, data: fallback });
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Invalid Report Reference ID or Tracking Passkey',
          },
        },
        { status: 404 }
      );
    }

    // 3. Constant-time comparison between candidate hash and stored hash
    const storedHashBuf = Buffer.from((report as any).tracking_secret_hash || '', 'hex');
    const candidateHashBuf = Buffer.from(candidateHash, 'hex');

    if (
      storedHashBuf.length !== candidateHashBuf.length ||
      !crypto.timingSafeEqual(storedHashBuf, candidateHashBuf)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid Report Reference ID or Tracking Passkey',
          },
        },
        { status: 401 }
      );
    }

    // 4. Fetch timeline strictly allow-listing public note (NO internal_rationale or actor_id)
    const { data: timeline } = await admin
      .from('report_status_history')
      .select('id, report_id, previous_status, new_status, public_note, created_at')
      .eq('report_id', (report as any).id)
      .order('created_at', { ascending: true });

    // 5. Fetch evidence strictly allow-listing metadata (NO internal storage_path or reviewer notes)
    const { data: evidence } = await admin
      .from('evidence')
      .select(
        'id, report_id, evidence_type, provider, external_url, is_embeddable, original_filename, mime_type, file_size_bytes, visibility, review_state, caption, created_at'
      )
      .eq('report_id', (report as any).id)
      .order('created_at', { ascending: true });

    // 6. Fetch messages strictly allow-listing reporter-safe communication (NO staff user IDs)
    const { data: messages } = await admin
      .from('messages')
      .select('id, report_id, sender_type, message_text, created_at')
      .eq('report_id', (report as any).id)
      .order('created_at', { ascending: true });

    // 7. Strip sensitive tracking hash from response
    const { tracking_secret_hash, ...sanitizedReport } = report as any;

    return NextResponse.json({
      success: true,
      data: {
        report: sanitizedReport,
        timeline: timeline || [],
        evidence: evidence || [],
        messages: messages || [],
      },
    });
  } catch (error: any) {
    console.error('Case tracking API error:', error);
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
