'use server'

import {RidesManagementController} from '@/lib/controllers/RidesManagementController';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {RideStatus, RideWithRelations} from '@/content/database_types/ride';
import {validateCsrfToken} from '@/lib/middleware/csrfMiddleware';
import {requireRole} from '@/lib/middleware/roleMiddleware';
import {validateRideId, validateCreateRide, validateUpdateRide, validateAssignDriver} from '@/lib/validations/ride';
import {AuditLogger} from '@/lib/services/AuditService';
import type {RideFilters, RidesManagementData} from '@/lib/services/RidesManagementService';

/**
 * Rides Management Actions - Server Actions sécurisées
 * 
 * Ce module expose les actions principales pour la gestion des rides.
 * Chaque action :
 * - Valide les inputs avec Zod
 * - Vérifie le token CSRF pour la protection contre les attaques
 * - Vérifie les rôles utilisateur (admin uniquement pour la plupart des actions)
 * - Log les activités sensibles via AuditLogger
 * - Délègue la logique métier au RidesManagementController
 * 
 * @module lib/actions/ridesManagementActions
 */

// Re-export types for backward compatibility
// Note: Types are now imported directly from RidesManagementService

/**
 * Récupère la liste des rides avec filtres, pagination et tri
 * 
 * @param filters - Objet de filtres contenant :
 *   - search: string - Terme de recherche (recherche dans départ, destination, ID)
 *   - status: RideStatus | 'all' | RideStatus[] - Filtre par statut
 *   - sortBy: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status' - Colonne de tri
 *   - sortOrder: 'asc' | 'desc' - Ordre de tri
 *   - page: number - Numéro de page (début à 1)
 *   - limit: number - Nombre d'éléments par page
 *   - columnFilters: ColumnFilter[] - Filtres par colonne avancés
 * @returns ActionResponse<RidesManagementData> - { rides, total, page, totalPages }
 * 
 * @throws {Error} Si l'utilisateur n'à pas le rôle 'admin'
 * @throws {Error} Si la validation des filtres échoue
 * 
 * @example
 * const result = await fetchRidesForManagement({
 *   search: 'Paris',
 *   status: 'pending',
 *   page: 1,
 *   limit: 50,
 *   sortBy: 'departureTime',
 *   sortOrder: 'desc'
 * });
 * if (result.success) {
 *   console.log(`Trouvé ${result.data.total} rides sur ${result.data.totalPages} pages`);
 * }
 */
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
/**
 * Crée un nouveau ride dans le système
 * 
 * @param data - Données de création du ride
 * @param data.departureTime - Date et heure de départ (obligatoire)
 * @param data.customerIds - Tableau des IDs clients associés (obligatoire, minimum 1)
 * @param data.departure - Lieu de départ (obligatoire, max 255 caractères)
 * @param data.destination - Lieu de destination (obligatoire, max 255 caractères)
 * @param data.driverId - ID du driver à assigner (optionnel, par défaut non assigné)
 * @param data.price - Prix du ride (optionnel, format string ou number, par défaut "0")
 * @param data.status - Statut initial (optionnel, par défaut 'pending')
 * @param csrfToken - Token CSRF pour la protection des formulaires (optionnel)
 * @returns ActionResponse<string> - ID du ride créé en cas de succès
 * 
 * @throws {Error} Si l'utilisateur n'est pas admin
 * @throws {Error} Si le token CSRF est invalide
 * @throws {Error} Si la validation des données échoue (voir ErrorCodes.VALIDATION_ERROR)
 * @throws {Error} Si erreur de base de données (voir ErrorCodes.DATABASE_ERROR)
 * 
 * @example
 * const result = await createRide({
 *   departureTime: new Date('2024-12-25T10:00:00Z'),
 *   customerIds: ['uuid-123', 'uuid-456'],
 *   departure: 'Paris',
 *   destination: 'Lyon',
 *   price: '150.00',
 *   driverId: 'driver-uuid-789',
 *   status: 'pending'
 * }, csrfToken);
 * if (result.success) {
 *   console.log(`Ride créé avec ID: ${result.data}`);
 * }
 */
export async function createRide(data: {
    departureTime: Date;
    customerIds: string[];
    departure: string;
    destination: string;
    driverId?: string;
    price?: string | number;
    status?: RideStatus;
}, csrfToken?: string): Promise<ActionResponse<string>> {
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

  // Validate input directly without price conversion
  const validation = validateCreateRide(data);
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid ride data',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  const result = await RidesManagementController.createRide(validation.data);
  
  // Audit logging for ride creation
  if (result.success && result.data) {
    await AuditLogger.ride.create(result.data, roleCheck.data?.user.id);
  }
  
  return result;
}

/**
 * Update ride details
 * @param rideId - Ride ID
 * @param data - Updated ride data
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function updateRideDetails(
    rideId: string,
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

  // Validate update data directly
  const validation = validateUpdateRide(data);
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: validation.error || 'Invalid update data',
      code: ErrorCodes.VALIDATION_ERROR,
    };
  }

  return RidesManagementController.updateRideDetails(rideId, validation.data);
}

/**
 * Assign a driver to a ride
 * @param rideId - Ride ID
 * @param driverId - Driver ID to assign
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function assignDriverToRide(rideId: string, driverId: string, csrfToken?: string): Promise<ActionResponse<void>> {
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

  const result = await RidesManagementController.assignDriverToRide(validation.data.rideId, validation.data.driverId);
  
  // Audit logging for driver assignment
  if (result.success) {
    await AuditLogger.ride.assign(validation.data.rideId, validation.data.driverId, roleCheck.data?.user.id);
  }
  
  return result;
}

/**
 * Cancel a ride
 * @param rideId - Ride ID to cancel
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function cancelRide(rideId: string, csrfToken?: string): Promise<ActionResponse<void>> {
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

  const result = await RidesManagementController.cancelRide(validation.data.rideId);
  
  // Audit logging for ride cancellation
  if (result.success) {
    await AuditLogger.ride.cancel(validation.data.rideId, roleCheck.data?.user.id);
  }
  
  return result;
}

/**
 * Delete a ride
 * @param rideId - Ride ID to delete
 * @param csrfToken - CSRF token for form protection
 * @returns ActionResponse
 */
export async function deleteRide(rideId: string, csrfToken?: string): Promise<ActionResponse<void>> {
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

  const result = await RidesManagementController.deleteRide(validation.data.rideId);
  
  // Audit logging for ride deletion
  if (result.success) {
    await AuditLogger.ride.delete(validation.data.rideId, roleCheck.data?.user.id);
  }
  
  return result;
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
