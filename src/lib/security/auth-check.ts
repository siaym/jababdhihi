import type { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '../supabase/admin.ts';

export type StaffRole = 'reviewer' | 'senior_reviewer' | 'admin';

export interface AuthCheckResult {
  authorized: boolean;
  callerType?: 'reporter' | 'reviewer' | 'senior_reviewer' | 'admin';
  report?: {
    id: string;
    report_number: string;
    status: string;
    category_id: string;
    tracking_secret_hash: string;
  };
  user?: {
    id: string;
    email: string;
    role: StaffRole;
    isMfaVerified: boolean;
  };
  error?: string;
  statusCode?: number;
}

/**
 * Check if running under production environment
 */
export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production';
}

/**
 * Verify reporter ownership using report reference identifier and secret tracking passkey.
 * Uses timing-safe hash comparison to prevent side-channel timing attacks.
 */
export async function verifyReporterCredentials(
  reportIdentifier: string,
  trackingSecret: string
): Promise<{ authorized: boolean; report?: any; error?: string }> {
  if (!reportIdentifier?.trim() || !trackingSecret?.trim()) {
    return { authorized: false, error: 'Report number and tracking secret are required.' };
  }

  const cleanId = reportIdentifier.trim();
  const cleanSecret = trackingSecret.trim();
  const candidateHash = crypto.createHash('sha256').update(cleanSecret).digest('hex');

  const admin = createAdminClient();
  if (!admin) {
    if (isProductionEnvironment()) {
      return { authorized: false, error: 'Database service unavailable. Mock mode is prohibited in production.' };
    }
    // Local / development mode fallback
    return { authorized: true, report: { id: 'temp-case-id', report_number: cleanId, status: 'submitted' } };
  }

  // Find report by report_number or UUID id
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const query = admin
    .from('reports')
    .select('id, report_number, tracking_secret_hash, status, category_id')
    .limit(1);

  const { data, error } = isUuid
    ? await query.eq('id', cleanId).single()
    : await query.eq('report_number', cleanId).single();

  if (error || !data) {
    return { authorized: false, error: 'Case not found or invalid reference identifier.' };
  }

  // Constant-time comparison between stored hash and candidate hash
  const storedHashBuf = Buffer.from(data.tracking_secret_hash || '', 'hex');
  const candidateHashBuf = Buffer.from(candidateHash, 'hex');

  if (
    storedHashBuf.length !== candidateHashBuf.length ||
    !crypto.timingSafeEqual(storedHashBuf, candidateHashBuf)
  ) {
    return { authorized: false, error: 'Invalid tracking passkey for this report.' };
  }

  return {
    authorized: true,
    report: data,
  };
}

/**
 * Verify staff/reviewer session from Bearer token or Supabase session cookies.
 * Enforces role hierarchy and MFA checks.
 */
export async function verifyStaffSession(
  req: NextRequest,
  requiredRole: StaffRole = 'reviewer'
): Promise<{ authorized: boolean; user?: any; error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    if (isProductionEnvironment()) {
      return { authorized: false, error: 'Database service unavailable. Mock staff sessions are prohibited in production.' };
    }
    // Local mock environment without Supabase
    return { authorized: true, user: { id: 'mock-staff-id', email: 'reviewer@jababdihi.org', role: 'admin', isMfaVerified: true } };
  }

  // Extract Bearer token
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return { authorized: false, error: 'Authorization bearer token missing or malformed.' };
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return { authorized: false, error: 'Invalid or expired authentication session.' };
  }

  const userId = userData.user.id;

  // Query user profile and assigned role
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id, email, full_name, role, is_active')
    .eq('id', userId)
    .single();

  if (profileError || !profile || !profile.is_active) {
    return { authorized: false, error: 'Account inactive or unauthorized role.' };
  }

  const roleHierarchy: Record<StaffRole, number> = {
    reviewer: 1,
    senior_reviewer: 2,
    admin: 3,
  };

  const userRoleLevel = roleHierarchy[profile.role as StaffRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredLevel) {
    return { authorized: false, error: `Insufficient permissions. Requires ${requiredRole} role.` };
  }

  // MFA verification check for senior_reviewer and admin
  const amr = (userData.user.app_metadata?.amr as any[]) || [];
  const factors = (userData.user as any).factors || [];
  const hasTotp = factors.some((f: any) => f.status === 'verified') || amr.some((m: any) => m.method === 'totp' || m.method === 'mfa');

  // If role is admin or senior_reviewer, require verified MFA
  const isMfaVerified = hasTotp || process.env.NODE_ENV === 'development';

  if ((profile.role === 'admin' || profile.role === 'senior_reviewer') && !isMfaVerified) {
    return {
      authorized: false,
      error: 'Multi-factor authentication (MFA) is mandatory for reviewer and admin operations.',
    };
  }

  return {
    authorized: true,
    user: {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      isMfaVerified,
    },
  };
}

/**
 * Enforces case-level assignment authorization for staff members.
 * - Admin: Unrestricted supervisory access.
 * - Senior Reviewer: Authorized for cases assigned to them or unassigned triage cases.
 * - Reviewer: Strictly restricted to cases where assigned_reviewer_id matches their user ID.
 */
export async function verifyStaffCaseAccess(
  staffUser: { id: string; role: StaffRole },
  targetReportId: string
): Promise<{ authorized: boolean; error?: string }> {
  if (!targetReportId?.trim()) {
    return { authorized: false, error: 'Target report identifier is required for case access verification.' };
  }

  // Administrators have global triage and audit authorization
  if (staffUser.role === 'admin') {
    return { authorized: true };
  }

  const admin = createAdminClient();
  if (!admin) {
    if (isProductionEnvironment()) {
      return { authorized: false, error: 'Database service unavailable in production.' };
    }
    return { authorized: true };
  }

  const cleanId = targetReportId.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
  const query = admin
    .from('reports')
    .select('id, assigned_reviewer_id, assigned_senior_id')
    .limit(1);

  const { data: report, error } = isUuid
    ? await query.eq('id', cleanId).single()
    : await query.eq('report_number', cleanId).single();

  if (error || !report) {
    return { authorized: false, error: 'Case not found for case assignment authorization.' };
  }

  if (staffUser.role === 'senior_reviewer') {
    // Senior reviewers oversee assigned cases or cases awaiting senior assignment
    if (report.assigned_senior_id === staffUser.id || !report.assigned_senior_id) {
      return { authorized: true };
    }
    return { authorized: false, error: 'Case is assigned to another senior reviewer.' };
  }

  if (staffUser.role === 'reviewer') {
    // Regular reviewers strictly authorized only for cases assigned to them
    if (report.assigned_reviewer_id === staffUser.id) {
      return { authorized: true };
    }
    return {
      authorized: false,
      error: 'Unauthorized. This case is not assigned to your reviewer account.',
    };
  }

  return { authorized: false, error: 'Unauthorized role.' };
}

/**
 * Universal case authorization check:
 * Authorizes access if the caller provides either:
 * A) Valid staff session with case assignment verification, OR
 * B) Valid reporter credentials cryptographically bound to the target case.
 */
export async function authorizeCaseOperation(
  req: NextRequest,
  params: {
    reportIdentifier?: string;
    trackingSecret?: string;
    targetReportId?: string;
  }
): Promise<AuthCheckResult> {
  const caseToCheck = params.targetReportId || params.reportIdentifier;

  // 1. Check for staff Bearer token first
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const staffCheck = await verifyStaffSession(req, 'reviewer');
    if (staffCheck.authorized && staffCheck.user) {
      if (caseToCheck) {
        const assignmentCheck = await verifyStaffCaseAccess(staffCheck.user, caseToCheck);
        if (!assignmentCheck.authorized) {
          return {
            authorized: false,
            callerType: staffCheck.user.role as StaffRole,
            user: staffCheck.user,
            error: assignmentCheck.error || 'Reviewer access is restricted to assigned cases.',
            statusCode: 403,
          };
        }
      }

      return {
        authorized: true,
        callerType: staffCheck.user.role as StaffRole,
        user: staffCheck.user,
      };
    }
  }

  // 2. Otherwise verify reporter passkey
  if (params.reportIdentifier && params.trackingSecret) {
    const reporterCheck = await verifyReporterCredentials(
      params.reportIdentifier,
      params.trackingSecret
    );

    if (reporterCheck.authorized && reporterCheck.report) {
      // Cryptographic binding: Enforce that credentials match the exact target case
      if (params.targetReportId && reporterCheck.report.id !== params.targetReportId) {
        return {
          authorized: false,
          callerType: 'reporter',
          error: 'Credentials provided do not belong to the requested case. Cross-case access is strictly prohibited.',
          statusCode: 403,
        };
      }

      return {
        authorized: true,
        callerType: 'reporter',
        report: reporterCheck.report,
      };
    }

    return {
      authorized: false,
      error: reporterCheck.error || 'Invalid report credentials.',
      statusCode: 401,
    };
  }

  return {
    authorized: false,
    error: 'Authentication credentials required (either valid tracking secret or reviewer session).',
    statusCode: 401,
  };
}
