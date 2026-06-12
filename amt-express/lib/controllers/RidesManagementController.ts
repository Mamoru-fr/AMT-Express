import {z} from 'zod';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {RidesManagementService} from '@/lib/services/RidesManagementService';
import {
    CreateRideSchema,
    UpdateRideDetailsSchema,
    AssignDriverSchema,
    RideIdSchema,
    RideFiltersSchema
} from '@/lib/validations/ride';
import {RideStatus} from '@/content/database_types/ride';
import {getSessionWithRole} from '@/lib/auth/session';

// Import types
import type {RideFilters, RidesManagementData} from '@/lib/services/RidesManagementService';

/**
 * RidesManagementController - Gère la validation et la sécurité
 * Délègue la logique métier à RidesManagementService
 */
export class RidesManagementController {
    /**
     * SÉCURITÉ: Admin only
     * VALIDATION: Zod schema
     */
    static async fetchRidesForManagement(filters: RideFilters = {}): Promise<ActionResponse<RidesManagementData>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === VALIDATION ===
            const validationResult = RideFiltersSchema.safeParse(filters);
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation failed',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === APPEL AU SERVICE ===
            const data = await RidesManagementService.getRidesForManagement(filters);
            return {success: true, data};
        } catch (error) {
            console.error('Error fetching rides:', error);
            return {
                success: false,
                error: 'Failed to fetch rides',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Admin only
     * VALIDATION: Zod schema
     */
    static async updateRideDetails(
        rideId: number,
        data: {
            departure?: string;
            destination?: string;
            departureTime?: Date;
            price?: string;
            status?: RideStatus;
            customerNotes?: string;
        }
    ): Promise<ActionResponse<void>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === VALIDATION ===
            const validationResult = UpdateRideDetailsSchema.safeParse({rideId, ...data});
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation failed',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === APPEL AU SERVICE ===
            await RidesManagementService.updateRideDetails(rideId, data);
            return {success: true, data: undefined};
        } catch (error) {
            console.error('Error updating ride:', error);
            return {
                success: false,
                error: 'Failed to update ride',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Admin only
     * VALIDATION: Zod schema
     */
    static async assignDriverToRide(rideId: number, driverId: string): Promise<ActionResponse<void>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === VALIDATION ===
            const validationResult = AssignDriverSchema.safeParse({rideId, driverId});
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation failed',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === APPEL AU SERVICE ===
            await RidesManagementService.assignDriverToRide(rideId, driverId);
            return {success: true, data: undefined};
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            if (errorMsg.includes('not found') || errorMsg.includes('not available')) {
                return {
                    success: false,
                    error: errorMsg,
                    code: ErrorCodes.RIDE_NOT_FOUND
                };
            }
            console.error('Error assigning driver:', error);
            return {
                success: false,
                error: 'Failed to assign driver',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Session required
     * VALIDATION: Zod schema
     */
    static async cancelRide(rideId: number): Promise<ActionResponse<void>> {
        try {
            // === SÉCURITÉ ===
            const {session} = await getSessionWithRole();
            if (!session) {
                return {
                    success: false,
                    error: 'Unauthorized',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === VALIDATION ===
            const validationResult = RideIdSchema.safeParse({rideId});
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation failed',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === APPEL AU SERVICE ===
            await RidesManagementService.cancelRide(rideId);
            return {success: true, data: undefined};
        } catch (error) {
            console.error('Error cancelling ride:', error);
            return {
                success: false,
                error: 'Failed to cancel ride',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Admin only
     * VALIDATION: Zod schema
     */
    static async deleteRide(rideId: number): Promise<ActionResponse<void>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === VALIDATION ===
            const validationResult = RideIdSchema.safeParse({rideId});
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation failed',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === APPEL AU SERVICE ===
            await RidesManagementService.deleteRide(rideId);
            return {success: true, data: undefined};
        } catch (error) {
            console.error('Error deleting ride:', error);
            return {
                success: false,
                error: 'Failed to delete ride',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Admin only
     */
    static async fetchAvailableDrivers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === APPEL AU SERVICE ===
            const data = await RidesManagementService.getAvailableDrivers();
            return {success: true, data};
        } catch (error) {
            console.error('Error fetching drivers:', error);
            return {
                success: false,
                error: 'Failed to fetch drivers',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Admin only
     */
    static async exportRidesToCSV(filters: RideFilters = {}): Promise<ActionResponse<string>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === APPEL AU SERVICE ===
            const csv = await RidesManagementService.exportRidesToCSV(filters);
            return {success: true, data: csv};
        } catch (error) {
            console.error('Error exporting CSV:', error);
            return {
                success: false,
                error: 'Failed to export CSV',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Admin only
     * VALIDATION: Zod schema
     */
    static async createRide(data: {
        departureTime: Date;
        customerIds: string[];
        departure: string;
        destination: string;
        driverId?: string;
        price?: string;
        status?: RideStatus;
    }): Promise<ActionResponse<number>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === VALIDATION ===
            const validationResult = CreateRideSchema.safeParse(data);
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation failed',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === APPEL AU SERVICE ===
            const rideId = await RidesManagementService.createRide(data);
            return {success: true, data: rideId};
        } catch (error) {
            console.error('Error creating ride:', error);
            return {
                success: false,
                error: 'Failed to create ride',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Admin only
     */
    static async fetchAllCustomers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === APPEL AU SERVICE ===
            const data = await RidesManagementService.getAllCustomers();
            return {success: true, data};
        } catch (error) {
            console.error('Error fetching customers:', error);
            return {
                success: false,
                error: 'Failed to fetch customers',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Admin only
     */
    static async fetchAllProductions(): Promise<ActionResponse<Array<{id: string, name: string}>>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === APPEL AU SERVICE ===
            const data = await RidesManagementService.getAllProductions();
            return {success: true, data};
        } catch (error) {
            console.error('Error fetching productions:', error);
            return {
                success: false,
                error: 'Failed to fetch productions',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Admin only
     */
    static async fetchAllProjects(): Promise<ActionResponse<Array<{id: string, name: string, productionId: string | null}>>> {
        try {
            // === SÉCURITÉ ===
            const {session, isAdmin} = await getSessionWithRole();
            if (!session || !isAdmin) {
                return {
                    success: false,
                    error: 'Unauthorized: Admin access only',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            // === APPEL AU SERVICE ===
            const data = await RidesManagementService.getAllProjects();
            return {success: true, data};
        } catch (error) {
            console.error('Error fetching projects:', error);
            return {
                success: false,
                error: 'Failed to fetch projects',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }
}
