'use server'

import {AdminDashboardController} from '@/lib/controllers/AdminDashboardController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {requireRole} from '@/lib/middleware/roleMiddleware';
import type {AdminDashboardData} from '@/lib/services/AdminDashboardService';

/**
 * Admin Dashboard Actions - Server Actions sécurisées
 * - Vérifie les rôles utilisateur (admin uniquement)
 * - Délègue au AdminDashboardController
 */

export async function getAdminDashboardData(): Promise<ActionResponse<AdminDashboardData>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

  return AdminDashboardController.getAdminDashboardData();
}
