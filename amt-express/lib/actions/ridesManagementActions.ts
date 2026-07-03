'use server'

import {RidesManagementController} from '@/lib/controllers/RidesManagementController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {RideStatus, RideWithRelations} from '@/content/database_types/ride';
import type {RideFilters, RidesManagementData} from '@/lib/services/RidesManagementService';
import {requireRole} from '@/lib/middleware/roleMiddleware';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';
import {
  validateRideFilters,
  validateCreateRide,
  validateUpdateRide,
  validateAssignDriver,
  validateRideId,
  RideFiltersInput,
  CreateRideInput,
  UpdateRideDetailsInput,
  AssignDriverInput,
  RideIdInput,
} from '@/lib/validations/ride';

/**
 * Rides Management Actions - Server Actions sécurisées
 * - Valide les inputs avec Zod
 * - Vérifie les permissions (rôle admin requis)
 * - Vérifie le token CSRF
 * - Délègue au RidesManagementController
 */

/**
 * Fetch rides for management with filters
 * @param filters - Filter criteria
 * @returns ActionResponse with rides data or error
 */
export async function fetchRidesForManagement(filters: RideFiltersInput = {}): Promise<ActionResponse<RidesManagementData>> {
  // Validate filters
  const validation = validateRideFilters(filters);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
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

  return RidesManagementController.fetchRidesForManagement(validation.data);
}

/**
 * Create a new ride
 * @param data - Ride creation data
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with new ride ID or error
 */
export async function createRide(data: CreateRideInput, csrfToken?: string): Promise<ActionResponse<number>> {
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
  const validation = validateCreateRide(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
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

  return RidesManagementController.createRide(validation.data);
}

/**
 * Update ride details
 * @param rideId - Ride ID to update
 * @param data - Updated ride data
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with success or error
 */
export async function updateRideDetails(
    rideId: number,
    data: UpdateRideDetailsInput,
    csrfToken?: string
): Promise<ActionResponse<void>> {
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
  const rideIdValidation = validateRideId({ rideId });
  if (!rideIdValidation.success) {
    return {
      success: false,
      error: rideIdValidation.error,
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Validate update data
  const validation = validateUpdateRide({ rideId, ...data });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
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

  return RidesManagementController.updateRideDetails(rideId, validation.data);
}

/**
 * Assign a driver to a ride
 * @param rideId - Ride ID to assign driver to
 * @param driverId - Driver ID to assign
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with success or error
 */
export async function assignDriverToRide(rideId: number, driverId: string, csrfToken?: string): Promise<ActionResponse<void>> {
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
  const validation = validateAssignDriver({ rideId, driverId });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
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

  return RidesManagementController.assignDriverToRide(validation.data!.rideId, validation.data! // @ts-ignore.driverId);
}

/**
 * Cancel a ride
 * @param rideId - Ride ID to cancel
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with success or error
 */
export async function cancelRide(rideId: number, csrfToken?: string): Promise<ActionResponse<void>> {
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

  // Verify admin role
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesManagementController.cancelRide(validation.data! // @ts-ignore.rideId);
}

/**
 * Delete a ride permanently
 * @param rideId - Ride ID to delete
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with success or error
 */
export async function deleteRide(rideId: number, csrfToken?: string): Promise<ActionResponse<void>> {
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

  // Verify admin role
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesManagementController.deleteRide(validation.data! // @ts-ignore.rideId);
}

/**
 * Fetch all available drivers
 * @returns ActionResponse with drivers list or error
 */
export async function fetchAvailableDrivers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
  // Verify admin role
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesManagementController.fetchAvailableDrivers();
}

/**
 * Export rides to CSV
 * @param filters - Filter criteria for export
 * @returns ActionResponse with CSV data or error
 */
export async function exportRidesToCSV(filters: RideFiltersInput = {}): Promise<ActionResponse<string>> {
  // Validate filters
  const validation = validateRideFilters(filters);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error || 'Invalid input',
      code: ErrorCodes.VALIDATION_ERROR,
    };
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

  return RidesManagementController.exportRidesToCSV(validation.data);
}

/**
 * Fetch all customers
 * @returns ActionResponse with customers list or error
 */
export async function fetchAllCustomers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
  // Verify admin role
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesManagementController.fetchAllCustomers();
}

/**
 * Fetch all productions
 * @returns ActionResponse with productions list or error
 */
export async function fetchAllProductions(): Promise<ActionResponse<Array<{id: string, name: string}>>> {
  // Verify admin role
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesManagementController.fetchAllProductions();
}

/**
 * Fetch all projects
 * @returns ActionResponse with projects list or error
 */
export async function fetchAllProjects(): Promise<ActionResponse<Array<{id: string, name: string, productionId: string | null}>>> {
  // Verify admin role
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error,
      code: roleCheck.code,
    };
  }

  return RidesManagementController.fetchAllProjects();
}
