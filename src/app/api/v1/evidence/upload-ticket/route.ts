import { NextRequest, NextResponse } from 'next/server';
import { createEvidenceUploadTicket } from '@/lib/supabase/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportId, fileName, fileSizeBytes } = body;

    if (!fileName || !fileSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'fileName and fileSizeBytes are required',
          },
        },
        { status: 400 }
      );
    }

    const ticket = await createEvidenceUploadTicket(
      reportId || 'temp',
      fileName,
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
