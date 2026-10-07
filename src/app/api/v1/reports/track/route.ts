import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { trackReport as trackInMemory } from '@/services/reports';

export async function POST(req: NextRequest) {
  try {
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

    // Supabase lookup
    const trimmedNum = report_number.trim();
    const trimmedSec = tracking_secret.trim();
    const hashedSec = crypto.createHash('sha256').update(trimmedSec).digest('hex');

    const { data: report, error: reportErr } = await admin
      .from('reports')
      .select('*, category:report_categories(*)')
      .eq('report_number', trimmedNum)
      .single();

    if (reportErr || !report) {
      // Check in-memory fallback just in case seeded data exists in memory
      const fallback = await trackInMemory(trimmedNum, trimmedSec);
      if (fallback) {
        return NextResponse.json({ success: true, data: fallback });
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

    // Verify secret hash
    if (report.tracking_secret_hash !== hashedSec) {
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

    // Fetch timeline
    const { data: timeline } = await admin
      .from('report_status_history')
      .select('*')
      .eq('report_id', report.id)
      .order('created_at', { ascending: true });

    // Fetch evidence
    const { data: evidence } = await admin
      .from('evidence')
      .select('*')
      .eq('report_id', report.id)
      .order('created_at', { ascending: true });

    // Fetch messages
    const { data: messages } = await admin
      .from('case_messages')
      .select('*')
      .eq('report_id', report.id)
      .order('created_at', { ascending: true });

    // Strip sensitive tracking hash from response
    const { tracking_secret_hash, ...sanitizedReport } = report;

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
