import { NextRequest, NextResponse } from 'next/server';
import { createEvidenceUploadTicket } from '@/lib/supabase/storage';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { canAcceptFileUploads } from '@/lib/security/safe-mode';
import { validateEvidenceFileMetadata } from '@/lib/security/file-validation';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit('evidence-upload', clientIp);
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

    // 2. Safe Mode Check
    const safeModeCheck = canAcceptFileUploads();
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
    const { reportId, fileName, fileSizeBytes, mimeType } = body;

    // 3. File Security and Extension Validation
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

    const ticket = await createEvidenceUploadTicket(
      reportId || 'temp',
      fileSecurity.sanitizedFilename,
      fileSizeBytes
    );

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STORAGE_ERROR',
            message: 'Failed to generate pre-signed upload ticket',
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
