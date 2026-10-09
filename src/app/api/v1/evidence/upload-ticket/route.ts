import { NextRequest, NextResponse } from 'next/server';
import { createEvidenceUploadTicket } from '@/lib/supabase/storage';
import { checkRateLimitAsync, getClientIp } from '@/lib/security/rate-limit';
import { canAcceptFileUploadsAsync } from '@/lib/security/safe-mode';
import { validateEvidenceFileMetadata } from '@/lib/security/file-validation';
import { authorizeCaseOperation, isProductionEnvironment } from '@/lib/security/auth-check';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Distributed Rate Limiting Check
    const rateCheck = await checkRateLimitAsync('evidence-upload', clientIp);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many file upload requests. Please wait ${rateCheck.resetSeconds} seconds.`,
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

    // 2. Authoritative Safe Mode Check
    const safeModeCheck = await canAcceptFileUploadsAsync();
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

    const body = await req.json();
    const { report_number, reportId, tracking_secret, fileName, fileSizeBytes, mimeType } = body;

    const targetReportRef = report_number || reportId;

    if (!targetReportRef) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'A valid report_number or reportId is required to attach evidence.',
          },
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    if (!admin && isProductionEnvironment()) {
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

    // 3. Zero-Trust Authorization & Case Assignment Verification
    const authResult = await authorizeCaseOperation(req, {
      reportIdentifier: targetReportRef,
      trackingSecret: tracking_secret,
      targetReportId: targetReportRef,
    });

    if (!authResult.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message:
              authResult.error ||
              'Access denied. Valid tracking secret or assigned reviewer credentials required.',
          },
        },
        { status: authResult.statusCode || 401 }
      );
    }

    const boundReportId = authResult.report?.id || targetReportRef;

    // 4. Case Status & Quota Verification
    if (authResult.report) {
      if (['closed', 'resolved'].includes(authResult.report.status)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'CASE_INACTIVE',
              message: 'This report is closed. No further evidence uploads are accepted.',
            },
          },
          { status: 403 }
        );
      }
    }

    if (admin) {
      const { count, error: countErr } = await admin
        .from('evidence')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', boundReportId);

      if (!countErr && typeof count === 'number' && count >= 10) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'QUOTA_EXCEEDED',
              message: 'The maximum limit of 10 evidence items per case has been reached.',
            },
          },
          { status: 429 }
        );
      }
    }

    // 5. File Security, Size, and Extension Validation
    const fileSecurity = validateEvidenceFileMetadata(
      fileName,
      mimeType || 'application/octet-stream',
      fileSizeBytes
    );

    if (!fileSecurity.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FILE_SECURITY',
            message: fileSecurity.error || 'Prohibited or unsafe file upload attempt.',
          },
        },
        { status: 400 }
      );
    }

    // 6. Generate Pre-Signed Upload Ticket Bound to Authorized Report ID
    const ticket = await createEvidenceUploadTicket(
      boundReportId,
      fileSecurity.sanitizedFilename,
      fileSizeBytes
    );

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STORAGE_ERROR',
            message: 'Failed to generate pre-signed upload ticket.',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error: any) {
    console.error('Evidence upload ticket error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'An unexpected error occurred during ticket issuance.',
        },
      },
      { status: 500 }
    );
  }
}
