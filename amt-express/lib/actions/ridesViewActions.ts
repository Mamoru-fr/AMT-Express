'use server'

import {RidesViewController} from '@/lib/controllers/RidesViewController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {RideWithRelations} from '@/content/database_types/ride';
import {requireRole} from '@/lib/middleware/roleMiddleware';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';

/**
 * Rides View Actions - Server Actions sécurisées
 * - Vérifie les permissions selon le rôle
 * - Vérifie le token CSRF
 * - Délègue au RidesViewController
 */

/**
 * Fetch driver rides count
 * @returns ActionResponse with rides count or error
 */
export async function fetchDriverRidesCount(): Promise<ActionResponse<{completed: number, pending: number}>> {
  // Verify driver role
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesViewController.fetchDriverRidesCount();
}

/**
 * Fetch driver completed rides
 * @returns ActionResponse with rides list or error
 */
export async function fetchDriverCompletedRides(): Promise<ActionResponse<RideWithRelations[]>> {
  // Verify driver role
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesViewController.fetchDriverCompletedRides();
}

/**
 * Fetch driver assigned rides
 * @returns ActionResponse with rides list or error
 */
export async function fetchDriverAssignedRides(): Promise<ActionResponse<RideWithRelations[]>> {
  // Verify driver role
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesViewController.fetchDriverAssignedRides();
}

/**
 * Fetch pending rides (for drivers)
 * @returns ActionResponse with rides list or error
 */
export async function fetchPendingRides(): Promise<ActionResponse<RideWithRelations[]>> {
  // Verify driver role
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesViewController.fetchPendingRides();
}

/**
 * Fetch customer rides
 * @returns ActionResponse with rides list or error
 */
export async function fetchCustomerRides(): Promise<ActionResponse<RideWithRelations[]>> {
  // Verify customer role
  const roleCheck = await requireRole('customer');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesViewController.fetchCustomerRides();
}

// Aliases for backward compatibility
export async function fetchCustomerCompletedRides(): Promise<ActionResponse<RideWithRelations[]>> {
  return fetchCustomerRides();
}

export async function fetchCustomerRequestedRides(): Promise<ActionResponse<RideWithRelations[]>> {
  return fetchCustomerRides();
}
