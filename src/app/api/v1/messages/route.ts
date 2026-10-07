import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCaseMessage as sendInMemory } from '@/services/reports';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { verifyReporterCredentials, verifyStaffSession } from '@/lib/security/auth-check';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Rate Limiting for case messaging
    const rateCheck = checkRateLimit('case-messages', clientIp);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Too many messages sent. Please wait ${rateCheck.resetSeconds} seconds.`,
          },
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetSeconds) } }
      );
    }

    const body = await req.json();
    const { report_id, report_number, message_text, tracking_secret } = body;
    const targetCaseRef = report_id || report_number;

    if (!targetCaseRef || !message_text?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Target case identifier and message_text are required.',
          },
        },
        { status: 400 }
      );
    }

    const cleanText = message_text.trim();
    if (cleanText.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Message length exceeds maximum allowable limit of 3,000 characters.',
          },
        },
        { status: 400 }
      );
    }

    // 2. Determine and Authenticate Sender Identity
    // Client is NEVER trusted to assert sender_type. Identity is cryptographically verified.
    let verifiedSenderType: 'reporter' | 'reviewer' = 'reporter';
    let verifiedSenderId: string | null = null;
    let boundReportId = targetCaseRef;

    // A. Check for authenticated reviewer session
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const staffAuth = await verifyStaffSession(req, 'reviewer');
      if (staffAuth.authorized && staffAuth.user) {
        verifiedSenderType = 'reviewer';
        verifiedSenderId = staffAuth.user.id;
      }
    }

    // B. If not a verified reviewer, caller MUST prove reporter ownership via tracking secret
    if (verifiedSenderType !== 'reviewer') {
      if (!tracking_secret) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message:
                'Tracking passkey is required to post messages to this case. Unauthenticated case injection is strictly prevented.',
            },
          },
          { status: 401 }
        );
      }

      const reporterAuth = await verifyReporterCredentials(targetCaseRef, tracking_secret);
      if (!reporterAuth.authorized) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: reporterAuth.error || 'Invalid case reference or secret tracking passkey.',
            },
          },
          { status: 401 }
        );
      }

      if (reporterAuth.report) {
        boundReportId = reporterAuth.report.id;
        if (['closed', 'resolved'].includes(reporterAuth.report.status)) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'CASE_INACTIVE',
                message: 'This case is closed. New messages cannot be appended.',
              },
            },
            { status: 403 }
          );
        }
      }
    }

    const admin = createAdminClient();

    if (!admin) {
      // Offline/local mock development fallback
      const msg = await sendInMemory(boundReportId, verifiedSenderType, cleanText);
      return NextResponse.json({
        success: true,
        data: msg,
      });
    }

    // 3. Insert into Supabase `messages` table
    const { data: insertedMsg, error } = await admin
      .from('messages')
      .insert({
        report_id: boundReportId,
        sender_type: verifiedSenderType,
        sender_id: verifiedSenderId,
        message_text: cleanText,
        is_read: false,
      })
      .select('*')
      .single();

    if (error || !insertedMsg) {
      console.error('Database message insert error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MESSAGE_DELIVERY_FAILED',
            message: 'Unable to securely record your message in the case vault. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: insertedMsg,
    });
  } catch (error: any) {
    console.error('Case message API error:', error);
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
