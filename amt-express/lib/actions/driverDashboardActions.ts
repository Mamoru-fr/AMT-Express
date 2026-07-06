'use server'

import {DriverDashboardController} from '@/lib/controllers/DriverDashboardController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';
import {requireRole} from '@/lib/middleware/roleMiddleware';
import {validateRideId, validateToggleDriverAvailability} from '@/lib/validations/ride';
import type {DriverDashboardData, DriverStats, SuggestedRide} from '@/lib/services/DriverDashboardService';

/**
 * Driver Dashboard Actions - Server Actions sécurisées
 * - Valide les inputs avec Zod
 * - Vérifie le token CSRF
 * - Vérifie les rôles utilisateur
 * - Délègue au DriverDashboardController
 */

export async function fetchDriverDashboard(): Promise<ActionResponse<DriverDashboardData>> {
  // Verify user is a driver
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

  return DriverDashboardController.fetchDriverDashboard();
}

/**
 * Toggle driver availability status
 * @param available - Availability status
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function toggleDriverAvailability(available: boolean, csrfToken?: string): Promise<ActionResponse<void>> {
  // Verify user is a driver
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

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

  // Validate input
  const validation = validateToggleDriverAvailability({ available });
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  return DriverDashboardController.toggleDriverAvailability(validation.data.available);
}

/**
 * Request assignment to a ride
 * @param rideId - Ride ID to request
 * @param message - Optional message for the request
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function requestRideAssignment(rideId: string, message?: string, csrfToken?: string): Promise<ActionResponse<void>> {
  // Verify user is a driver
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

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

  // Validate input
  const validation = validateRideId({ rideId });
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid ride ID',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  return DriverDashboardController.requestRideAssignment(validation.data.rideId, message);
}

export async function getDriverRideHistory(page: number = 1, limit: number = 10): Promise<ActionResponse<{rides: any[], total: number, page: number, totalPages: number}>> {
  // Verify user is a driver
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

  return DriverDashboardController.getDriverRideHistory(page, limit);
}
