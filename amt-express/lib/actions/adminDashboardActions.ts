'use server'

import {AdminDashboardController} from '@/lib/controllers/AdminDashboardController';
import {ActionResponse} from '@/lib/types/action-response';
import type {AdminDashboardData} from '@/lib/services/AdminDashboardService';

/**
 * Admin Dashboard Actions - Server Actions minimalistes
 * Délèguent tout au AdminDashboardController
 */

export async function getAdminDashboardData(): Promise<ActionResponse<AdminDashboardData>> {
    return AdminDashboardController.getAdminDashboardData();
}
