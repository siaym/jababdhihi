import { NextRequest, NextResponse } from 'next/server';
import { getSafeModeStatusAsync, setSafeModeStatusAsync } from '@/lib/security/safe-mode';
import { verifyStaffSession } from '@/lib/security/auth-check';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await getSafeModeStatusAsync();
  return NextResponse.json({
    success: true,
    data: status,
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify administrative privileges and MFA
    const staffCheck = await verifyStaffSession(req, 'admin');
    if (!staffCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: staffCheck.error || 'Administrator privileges required.',
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await setSafeModeStatusAsync(body, staffCheck.user?.id);

    // 2. Append to tamper-evident audit logs
    const admin = createAdminClient();
    if (admin && staffCheck.user) {
      await admin.from('audit_logs').insert({
        actor_id: staffCheck.user.id,
        actor_role: staffCheck.user.role,
        action: body.isEnabled ? 'ENABLE_SAFE_MODE' : 'DISABLE_SAFE_MODE',
        resource_type: 'platform_security_settings',
        resource_id: '00000000-0000-0000-0000-000000000000',
        new_state: updated,
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error.message || 'Failed to toggle Safe Mode.',
        },
      },
      { status: 500 }
    );
  }
}
