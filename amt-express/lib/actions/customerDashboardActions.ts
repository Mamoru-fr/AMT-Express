'use server';

import { ActionResponse, ErrorCodes } from '@/lib/types/action-response';
import { requireRole } from '@/lib/middleware/roleMiddleware';
import { RidesViewController } from '@/lib/controllers/RidesViewController';
import { RideWithRelations } from '@/content/database_types/ride';

/**
 * Customer Dashboard Actions - Server Actions sécurisées
 * - Vérifie les rôles utilisateur (customer uniquement)
 * - Délègue au RidesViewController
 */

export type CustomerDashboardData = {
    completedRides: RideWithRelations[];
    pendingRides: RideWithRelations[];
    totalRides: number;
};

/**
 * Get customer dashboard data
 * @returns ActionResponse with customer rides data
 */
export async function getCustomerDashboardData(): Promise<ActionResponse<CustomerDashboardData>> {
  // Verify user is a customer
  const roleCheck = await requireRole('customer');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: roleCheck.code,
    };
  }

  try {
    // Fetch customer rides
    const ridesResponse = await RidesViewController.fetchCustomerRides();
    
    if (!ridesResponse.success) {
      return {
        success: false,
        error: ridesResponse.error || 'Failed to load rides',
        code: ErrorCodes.DATABASE_ERROR,
      };
    }

    const rides = ridesResponse.data || [];
    
    // Categorize rides
    const completedRides = rides.filter(ride => ride.status === 'completed');
    const pendingRides = rides.filter(ride => ride.status !== 'completed');
    
    return {
      success: true,
      data: {
        completedRides,
        pendingRides,
        totalRides: rides.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load dashboard',
      code: ErrorCodes.INTERNAL_ERROR,
    };
  }
}
