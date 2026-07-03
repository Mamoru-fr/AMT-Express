'use server'

import {RidesManagementController} from '@/lib/controllers/RidesManagementController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {RideStatus, RideWithRelations} from '@/content/database_types/ride';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';
import {requireRole} from '@/lib/middleware/roleMiddleware';
import {validateRideId, validateCreateRide, validateUpdateRide, validateAssignDriver} from '@/lib/validations/ride';
import type {RideFilters, RidesManagementData} from '@/lib/services/RidesManagementService';

/**
 * Rides Management Actions - Server Actions sécurisées
 * - Valide les inputs avec Zod
 * - Vérifie le token CSRF
 * - Vérifie les rôles utilisateur (admin uniquement)
 * - Délègue au RidesManagementController
 */

// Re-export types for backward compatibility
// Note: Types are now imported directly from RidesManagementService
export async function fetchRidesForManagement(filters: any = {}): Promise<ActionResponse<RidesManagementData>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

  return RidesManagementController.fetchRidesForManagement(filters);
}

/**
 * Create a new ride
 * @param data - Ride data
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse with new ride ID
 */
export async function createRide(data: {
    departureTime: Date;
    customerIds: string[];
    departure: string;
    destination: string;
    driverId?: string;
    price?: string | number;
    status?: RideStatus;
}, csrfToken?: string): Promise<ActionResponse<number>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
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

  // Validate input - ensure price is a number for validation
  const rideData = {
    ...data,
    price: data.price !== undefined ? (typeof data.price === 'string' ? parseFloat(data.price) : data.price) : undefined
  };
  const validation = validateCreateRide(rideData);
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid ride data',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Convert back to string for controller
  const validatedData = {
    ...validation.data,
    price: validation.data.price?.toString()
  };

  return RidesManagementController.createRide(validatedData);
}

/**
 * Update ride details
 * @param rideId - Ride ID
 * @param data - Updated ride data
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function updateRideDetails(
    rideId: number,
    data: {
        departure?: string;
        destination?: string;
        departureTime?: Date;
        price?: string;
        status?: RideStatus;
        customerNotes?: string;
    },
    csrfToken?: string
): Promise<ActionResponse<void>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
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

  // Validate ride ID
  const rideIdValidation = validateRideId({ rideId });
  if (!rideIdValidation.success) {
    return {
      success: false,
      error: rideIdValidation.error || 'Invalid ride ID',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Validate update data - ensure price is a number for validation
  const updateData = {
    ...data,
    price: data.price !== undefined ? (typeof data.price === 'string' ? parseFloat(data.price) : data.price) : undefined
  };
  const validation = validateUpdateRide(updateData);
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid update data',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  // Convert back to string for controller
  const validatedData = {
    ...validation.data,
    price: validation.data.price?.toString()
  };

  return RidesManagementController.updateRideDetails(rideId, validatedData);
}

/**
 * Assign a driver to a ride
 * @param rideId - Ride ID
 * @param driverId - Driver ID to assign
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function assignDriverToRide(rideId: number, driverId: string, csrfToken?: string): Promise<ActionResponse<void>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
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
  const validation = validateAssignDriver({ rideId, driverId });
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid assignment data',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  return RidesManagementController.assignDriverToRide(validation.data.rideId, validation.data.driverId);
}

/**
 * Cancel a ride
 * @param rideId - Ride ID to cancel
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function cancelRide(rideId: number, csrfToken?: string): Promise<ActionResponse<void>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
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

  // Validate ride ID
  const validation = validateRideId({ rideId });
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid ride ID',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  return RidesManagementController.cancelRide(validation.data.rideId);
}

/**
 * Delete a ride
 * @param rideId - Ride ID to delete
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function deleteRide(rideId: number, csrfToken?: string): Promise<ActionResponse<void>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
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

  // Validate ride ID
  const validation = validateRideId({ rideId });
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid ride ID',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  return RidesManagementController.deleteRide(validation.data.rideId);
}

export async function fetchAvailableDrivers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

  return RidesManagementController.fetchAvailableDrivers();
}

export async function exportRidesToCSV(filters: any = {}, csrfToken?: string): Promise<ActionResponse<string>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
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

  return RidesManagementController.exportRidesToCSV(filters);
}

export async function fetchAllCustomers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

  return RidesManagementController.fetchAllCustomers();
}

export async function fetchAllProductions(): Promise<ActionResponse<Array<{id: string, name: string}>>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

  return RidesManagementController.fetchAllProductions();
}

export async function fetchAllProjects(): Promise<ActionResponse<Array<{id: string, name: string, productionId: string | null}>>> {
  // Verify user is an admin
  const roleCheck = await requireRole('admin');
  if (!roleCheck.success) {
    return {
      success: false,
      error: roleCheck.error || 'Unauthorized access',
      code: ErrorCodes.UNAUTHORIZED,
    };
  }

  return RidesManagementController.fetchAllProjects();
}
