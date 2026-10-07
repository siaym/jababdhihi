import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPublicStats as getInMemoryStats } from '@/services/reports';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const admin = createAdminClient();

    if (!admin) {
      const stats = await getInMemoryStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Supabase aggregation
    const { count: totalReports } = await admin
      .from('reports')
      .select('*', { count: 'exact', head: true });

    const { count: underReview } = await admin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'under_review');

    const { count: verified } = await admin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('verified_status', true);

    const { count: referred } = await admin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'referred');

    const { count: resolved } = await admin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');

    return NextResponse.json({
      success: true,
      data: {
        totalReports: totalReports || 0,
        underReview: underReview || 0,
        verified: verified || 0,
        referred: referred || 0,
        resolved: resolved || 0,
      },
    });
  } catch (error: any) {
    console.error('Public stats API error:', error);
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
