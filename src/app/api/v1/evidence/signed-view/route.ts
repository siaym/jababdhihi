import { NextRequest, NextResponse } from 'next/server';
import { getSignedEvidenceViewUrl } from '@/lib/supabase/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storagePath, expiresInSeconds } = body;

    if (!storagePath) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'storagePath is required',
          },
        },
        { status: 400 }
      );
    }

    const signedUrl = await getSignedEvidenceViewUrl(storagePath, expiresInSeconds || 900);

    if (!signedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'STORAGE_ERROR',
            message: 'Failed to generate signed evidence view URL',
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        signedUrl,
        expiresInSeconds: expiresInSeconds || 900,
      },
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
