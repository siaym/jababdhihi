import { NextRequest, NextResponse } from 'next/server';
import { getSignedEvidenceViewUrl } from '@/lib/supabase/storage';
import { createAdminClient } from '@/lib/supabase/admin';
import { authorizeCaseOperation, isProductionEnvironment } from '@/lib/security/auth-check';
import { checkRateLimitAsync, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Distributed Rate limiting: prevent brute-forcing evidence URLs
    const rateCheck = await checkRateLimitAsync('public-api', clientIp);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Please wait ${rateCheck.resetSeconds} seconds.`,
          },
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetSeconds) } }
      );
    }

    const body = await req.json();
    const evidenceId = body.evidence_id || body.evidenceId;
    const { report_number, tracking_secret, expiresInSeconds } = body;

    if (!evidenceId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'evidence_id is required. Direct client storagePath access is strictly prohibited.',
          },
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    if (!admin) {
      // Fail closed in production if Supabase configuration is missing
      if (isProductionEnvironment()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SERVICE_UNAVAILABLE',
              message: 'Database storage service unavailable in production.',
            },
          },
          { status: 503 }
        );
      }
      // Local dev mode fallback
      return NextResponse.json({
        success: true,
        data: {
          signedUrl: `/storage/placeholder/${evidenceId}`,
          expiresInSeconds: expiresInSeconds || 900,
        },
      });
    }

    // 2. Look up evidence record in database
    const { data: evidence, error: evError } = await admin
      .from('evidence')
      .select('id, report_id, storage_path, visibility, review_state, evidence_type')
      .eq('id', evidenceId)
      .single();

    if (evError || !evidence) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Requested evidence record not found.',
          },
        },
        { status: 404 }
      );
    }

    if (!evidence.storage_path) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_EVIDENCE_TYPE',
            message: 'This evidence item does not have an attached stored file.',
          },
        },
        { status: 400 }
      );
    }

    // 3. P0-5: Public evidence review state check
    // Evidence is only publicly accessible if visibility is 'public' AND review_state is accepted/approved
    const isApprovedPublic =
      evidence.visibility === 'public' &&
      (evidence.review_state === 'accepted' || evidence.review_state === 'approved');

    if (isApprovedPublic) {
      const ttl = Math.min(Math.max(60, expiresInSeconds || 900), 3600);
      const signedUrl = await getSignedEvidenceViewUrl(evidence.storage_path, ttl);

      if (!signedUrl) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'STORAGE_ERROR',
              message: 'Failed to generate signed download URL.',
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          signedUrl,
          expiresInSeconds: ttl,
          visibility: 'public',
        },
      });
    }

    // 4. P0-1: Bound authorization check for private or unapproved evidence
    // Cryptographically binds the authenticated credential to evidence.report_id
    const authResult = await authorizeCaseOperation(req, {
      reportIdentifier: report_number || evidence.report_id,
      trackingSecret: tracking_secret,
      targetReportId: evidence.report_id, // STRICT CASE BINDING
    });

    if (!authResult.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: authResult.error || 'You do not have authorization to view this evidence item.',
          },
        },
        { status: authResult.statusCode || 403 }
      );
    }

    // Explicit double-check: enforce caller's case ID matches evidence's case ID
    if (authResult.callerType === 'reporter' && authResult.report?.id !== evidence.report_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Cryptographic credentials belong to a different case. Cross-case access is strictly prohibited.',
          },
        },
        { status: 403 }
      );
    }

    // Verified: Generate secure short-lived signed URL
    const ttl = Math.min(Math.max(60, expiresInSeconds || 900), 3600); // 1 min to 1 hour
    const signedUrl = await getSignedEvidenceViewUrl(evidence.storage_path, ttl);

    if (!signedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STORAGE_ERROR',
            message: 'Failed to generate signed download URL.',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        signedUrl,
        expiresInSeconds: ttl,
        visibility: evidence.visibility,
      },
    });
  } catch (error: any) {
    console.error('Signed view API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'An unexpected error occurred.',
        },
      },
      { status: 500 }
    );
  }
}
