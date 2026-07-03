'use server'

import {AdminDashboardController} from '@/lib/controllers/AdminDashboardController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import type {AdminDashboardData} from '@/lib/services/AdminDashboardService';
import {requireRole} from '@/lib/middleware/roleMiddleware';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';

/**
 * Admin Dashboard Actions - Server Actions sécurisées
 * - Vérifie les permissions (rôle admin requis)
 * - Vérifie le token CSRF
 * - Délègue au AdminDashboardController
 */

/**
 * Get admin dashboard data
 * @param csrfToken - CSRF token for form protection (optional)
 * @returns ActionResponse with dashboard data or error
 */
export async function getAdminDashboardData(csrfToken?: string): Promise<ActionResponse<AdminDashboardData>> {
  // Validate CSRF token if provided
  if (csrfToken) {
    const csrfCheck = await validateCsrfToken(csrfToken);
    if (!csrfCheck.success) {
      return {
        success: false,
        error: csrfCheck.error || 'Invalid CSRF token',
        code: ErrorCodes.UNAUTHORIZED,
      };
    }
  }

  // Verify admin role
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return AdminDashboardController.getAdminDashboardData();
}
