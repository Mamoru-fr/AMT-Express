'use server'

import {RidesViewController} from '@/lib/controllers/RidesViewController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {RideWithRelations} from '@/content/database_types/ride';
import {verifyAuth} from '@/lib/middleware/roleMiddleware';

/**
 * Rides View Actions - Server Actions sécurisées
 * - Vérifie que l'utilisateur est authentifié
 * - Délègue au RidesViewController
 */

export async function fetchDriverRidesCount(): Promise<ActionResponse<{completed: number, pending: number}>> {
  const sessionCheck = await verifyAuth();
  if (!sessionCheck.success) {
    return {
      success: false,
      error: sessionCheck.error || 'Unauthorized access',
      code: sessionCheck.code,
    };
  }
    return RidesViewController.fetchDriverRidesCount();
}

export async function fetchDriverCompletedRides(): Promise<ActionResponse<RideWithRelations[]>> {
  const sessionCheck = await verifyAuth();
  if (!sessionCheck.success) {
    return {
      success: false,
      error: sessionCheck.error || 'Unauthorized access',
      code: sessionCheck.code,
    };
  }
    return RidesViewController.fetchDriverCompletedRides();
}

export async function fetchDriverAssignedRides(): Promise<ActionResponse<RideWithRelations[]>> {
  const sessionCheck = await verifyAuth();
  if (!sessionCheck.success) {
    return {
      success: false,
      error: sessionCheck.error || 'Unauthorized access',
      code: sessionCheck.code,
    };
  }
    return RidesViewController.fetchDriverAssignedRides();
}

export async function fetchPendingRides(): Promise<ActionResponse<RideWithRelations[]>> {
  const sessionCheck = await verifyAuth();
  if (!sessionCheck.success) {
    return {
      success: false,
      error: sessionCheck.error || 'Unauthorized access',
      code: sessionCheck.code,
    };
  }
    return RidesViewController.fetchPendingRides();
}

export async function fetchCustomerRides(): Promise<ActionResponse<RideWithRelations[]>> {
  const sessionCheck = await verifyAuth();
  if (!sessionCheck.success) {
    return {
      success: false,
      error: sessionCheck.error || 'Unauthorized access',
      code: sessionCheck.code,
    };
  }
    return RidesViewController.fetchCustomerRides();
}

// Aliases for backward compatibility
export async function fetchCustomerCompletedRides(): Promise<ActionResponse<RideWithRelations[]>> {
  return RidesViewController.fetchCustomerCompletedRides();
}

export async function fetchCustomerRequestedRides(): Promise<ActionResponse<RideWithRelations[]>> {
    return RidesViewController.fetchCustomerPendingRides();
}
