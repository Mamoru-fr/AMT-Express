'use server'

import {DriverDashboardController} from '@/lib/controllers/DriverDashboardController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import type {DriverDashboardData, DriverStats, SuggestedRide} from '@/lib/services/DriverDashboardService';
import {requireRole} from '@/lib/middleware/roleMiddleware';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';
import {validateRideId, validateToggleDriverAvailability, RideIdInput, ToggleDriverAvailabilityInput} from '@/lib/validations/ride';

/**
 * Driver Dashboard Actions - Server Actions sécurisées
 * - Valide les inputs avec Zod
 * - Vérifie les permissions (rôle driver requis)
 * - Vérifie le token CSRF
 * - Délègue au DriverDashboardController
 */

/**
 * Fetch driver dashboard data
 * @returns ActionResponse with dashboard data or error
 */
export async function fetchDriverDashboard(): Promise<ActionResponse<DriverDashboardData>> {
  // Verify driver role
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return DriverDashboardController.fetchDriverDashboard();
}

/**
 * Toggle driver availability status
 * @param available - New availability status
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with success or error
 */
export async function toggleDriverAvailability(available: boolean, csrfToken?: string): Promise<ActionResponse<void>> {
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
  if (!validation.success) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Verify driver role
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return DriverDashboardController.toggleDriverAvailability(validation.data! // @ts-ignore.available);
}

/**
 * Request assignment to a ride
 * @param rideId - Ride ID to request
 * @param message - Optional message for the request
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with success or error
 */
export async function requestRideAssignment(rideId: number, message?: string, csrfToken?: string): Promise<ActionResponse<void>> {
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

  // Validate ride ID
  const validation = validateRideId({ rideId });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Verify driver role
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return DriverDashboardController.requestRideAssignment(validation.data! // @ts-ignore.rideId, message);
}

/**
 * Get driver ride history with pagination
 * @param page - Page number
 * @param limit - Items per page
 * @returns ActionResponse with paginated ride history or error
 */
export async function getDriverRideHistory(page: number = 1, limit: number = 10): Promise<ActionResponse<{rides: any[], total: number, page: number, totalPages: number}>> {
  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return {
      success: false,
      error: 'Invalid pagination parameters',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Verify driver role
  const roleCheck = await requireRole('driver');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return DriverDashboardController.getDriverRideHistory(page, limit);
}
