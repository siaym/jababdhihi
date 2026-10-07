import { NextRequest, NextResponse } from 'next/server';
import { analyzeExternalUrl } from '@/services/evidence';
import { validateSafeUrlAsync } from '@/lib/security/ssrf';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting check
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
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetSeconds) } }
      );
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'A valid URL string is required',
          },
        },
        { status: 400 }
      );
    }

    // SSRF & Protocol Safety Check with real DNS resolution
    const safety = await validateSafeUrlAsync(url);
    if (!safety.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROHIBITED_URL',
            message: safety.error || 'Prohibited URL format or destination.',
          },
        },
        { status: 400 }
      );
    }

    const analysis = analyzeExternalUrl(url);

    return NextResponse.json({
      success: true,
      data: analysis,
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
