import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPublicReports as getInMemoryPublicReports } from '@/services/reports';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // Rate Limiting on public querying/scraping
    const rateCheck = checkRateLimit('public-api', clientIp);
    if (!rateCheck.isAllowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Please wait ${rateCheck.resetSeconds} seconds.`,
          },
        },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetSeconds) } }
      );
    }

    const { searchParams } = new URL(req.url);
    const categoryCode = searchParams.get('category') || undefined;
    const division = searchParams.get('division') || undefined;
    const district = searchParams.get('district') || undefined;
    const status = searchParams.get('status') || undefined;
    const searchQuery = searchParams.get('search') || undefined;
    const rawPage = parseInt(searchParams.get('page') || '1', 10);
    const page = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
    
    // Strict bounding: limit is constrained between 1 and 50
    const rawLimit = parseInt(searchParams.get('limit') || '20', 10);
    const limit = isNaN(rawLimit) ? 20 : Math.min(50, Math.max(1, rawLimit));

    const admin = createAdminClient();

    if (!admin) {
      const reports = await getInMemoryPublicReports({
        categoryCode,
        division,
        district,
        status,
        searchQuery,
      });

      const startIndex = (page - 1) * limit;
      const paginated = reports.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        success: true,
        data: paginated,
        meta: {
          page,
          limit,
          total: reports.length,
          totalPages: Math.ceil(reports.length / limit),
        },
      });
    }

    let query = admin
      .from('reports')
      .select('*, category:report_categories(*)', { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (division) query = query.eq('division', division);
    if (district) query = query.eq('district', district);
    if (status) query = query.eq('status', status);
    if (searchQuery) {
      query = query.or(
        `description.ilike.%${searchQuery}%,report_number.ilike.%${searchQuery}%,custom_organization_name.ilike.%${searchQuery}%`
      );
    }

    const startIndex = (page - 1) * limit;
    query = query.range(startIndex, startIndex + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error('Database public reports query error:', error);
      const fallback = await getInMemoryPublicReports({
        categoryCode,
        division,
        district,
        status,
        searchQuery,
      });
      return NextResponse.json({
        success: true,
        data: fallback,
        meta: { page: 1, limit, total: fallback.length, totalPages: 1 },
      });
    }

    // Strip any sensitive fields before returning publicly
    const sanitized = (data || []).map((r) => {
      const { tracking_secret_hash, reporter_name, reporter_email, reporter_phone, ...safe } = r;
      return safe;
    });

    return NextResponse.json(
      {
        success: true,
        data: sanitized,
        meta: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('Public reports API error:', error);
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
