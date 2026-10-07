import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCaseMessage as sendInMemory } from '@/services/reports';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting for case messaging
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
    const { report_id, sender_type, message_text } = body;

    if (!report_id || !sender_type || !message_text?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'report_id, sender_type, and message_text are required',
          },
        },
        { status: 400 }
      );
    }

    if (!['reporter', 'reviewer'].includes(sender_type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'sender_type must be "reporter" or "reviewer"',
          },
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    if (!admin) {
      // In-memory fallback
      const msg = await sendInMemory(report_id, sender_type, message_text.trim());
      return NextResponse.json({
        success: true,
        data: msg,
      });
    }

    // Insert into Supabase
    const { data: insertedMsg, error } = await admin
      .from('case_messages')
      .insert({
        report_id,
        sender_type,
        message_text: message_text.trim(),
        is_read: false,
      })
      .select('*')
      .single();

    if (error || !insertedMsg) {
      console.error('Database message insert error:', error);
      const fallback = await sendInMemory(report_id, sender_type, message_text.trim());
      return NextResponse.json({
        success: true,
        data: fallback,
      });
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
