import { NextRequest, NextResponse } from 'next/server';
import { getSignedEvidenceViewUrl } from '@/lib/supabase/storage';
import { createAdminClient } from '@/lib/supabase/admin';
import { authorizeCaseOperation } from '@/lib/security/auth-check';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate limiting: prevent brute-forcing evidence URLs
    const rateCheck = checkRateLimit('public-api', clientIp);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many requests. Please wait ${rateCheck.resetSeconds} seconds.`,
          },
        },
        { status: 429 }
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
      // Local dev mode fallback
      return NextResponse.json({
        success: true,
        data: {
          signedUrl: `/storage/placeholder/${evidenceId}`,
          expiresInSeconds: expiresInSeconds || 900,
        },
      });
    }

    // 1. Look up evidence record in database
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

    // 2. Authorization check
    // If evidence is public, public visitors can view it
    if (evidence.visibility === 'public') {
      const signedUrl = await getSignedEvidenceViewUrl(
        evidence.storage_path,
        expiresInSeconds || 900
      );

      return NextResponse.json({
        success: true,
        data: {
          signedUrl,
          expiresInSeconds: expiresInSeconds || 900,
          visibility: 'public',
        },
      });
    }

    // Evidence is private or reviewer-only: require verification
    const authResult = await authorizeCaseOperation(req, {
      reportIdentifier: report_number || evidence.report_id,
      trackingSecret: tracking_secret,
    });

    if (!authResult.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have authorization to view this private evidence item.',
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
