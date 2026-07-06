import {z} from 'zod';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {DriverDashboardService, DriverDashboardData, DriverStats, SuggestedRide} from '@/lib/services/DriverDashboardService';
import {RideWithRelations} from '@/content/database_types/ride';
import {ToggleAvailabilitySchema, RequestRideAssignmentSchema, RideHistorySchema} from '@/lib/validations/dashboard';
import {verifyRole} from '@/lib/middleware/roleMiddleware';

/**
 * DriverDashboardController - Gère la sécurité et la validation
 * Délègue la logique métier à DriverDashboardService
 */
export class DriverDashboardController {
    /**
     * SÉCURITÉ: Driver only
     */
    static async fetchDriverDashboard(): Promise<ActionResponse<DriverDashboardData>> {
        try {
            // === SÉCURITÉ ===
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;
            const {session, user} = roleCheck.data!;

            // === APPEL AU SERVICE ===
            const driver = await DriverDashboardService.getDriverForUser(user.id);
            if (!driver) {
                return {
                    success: false,
                    error: 'Driver profile not found',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            const data = await DriverDashboardService.getDriverDashboard(driver.id, driver.available);

            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error fetching driver dashboard:', error);
            return {
                success: false,
                error: 'Failed to fetch driver dashboard',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Driver only
     * VALIDATION: Zod schema
     */
    static async toggleDriverAvailability(available: boolean): Promise<ActionResponse<void>> {
        try {
            // === SÉCURITÉ ===
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;
            const {session, user} = roleCheck.data!;

            // === VALIDATION ===
            const validationResult = ToggleAvailabilitySchema.safeParse({available});
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation failed',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === APPEL AU SERVICE ===
            const driver = await DriverDashboardService.getDriverForUser(user.id);
            if (!driver) {
                return {
                    success: false,
                    error: 'Driver profile not found',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            await DriverDashboardService.updateAvailability(driver.id, available);

            return {success: true, data: undefined};
        } catch (error) {
            console.error('Error toggling availability:', error);
            return {
                success: false,
                error: 'Failed to toggle availability',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Driver only
     * VALIDATION: Zod schema
     */
    static async requestRideAssignment(rideId: string, message?: string): Promise<ActionResponse<void>> {
        try {
            // === SÉCURITÉ ===
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;
            const {session, user} = roleCheck.data!;

            // === VALIDATION ===
            const validationResult = RequestRideAssignmentSchema.safeParse({rideId, message});
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation failed',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === APPEL AU SERVICE ===
            const driver = await DriverDashboardService.getDriverForUser(user.id);
            if (!driver) {
                return {
                    success: false,
                    error: 'Driver profile not found',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            await DriverDashboardService.requestRideAssignment(driver.id, rideId);

            return {success: true, data: undefined};
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            if (errorMsg.includes('Maximum requests')) {
                return {
                    success: false,
                    error: errorMsg,
                    code: ErrorCodes.VALIDATION_ERROR
                };
            }
            console.error('Error requesting assignment:', error);
            return {
                success: false,
                error: 'Failed to request assignment',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Driver only
     * VALIDATION: Zod schema
     */
    static async getDriverRideHistory(
        page: number = 1,
        limit: number = 10
    ): Promise<ActionResponse<{rides: RideWithRelations[], total: number, page: number, totalPages: number}>> {
        try {
            // === SÉCURITÉ ===
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;
            const {session, user} = roleCheck.data!;

            // === VALIDATION ===
            const validationResult = RideHistorySchema.safeParse({page, limit});
            if (!validationResult.success) {
                return {
                    success: false,
                    error: 'Validation failed',
                    code: ErrorCodes.VALIDATION_ERROR,
                    details: validationResult.error.flatten()
                };
            }

            // === APPEL AU SERVICE ===
            const driver = await DriverDashboardService.getDriverForUser(user.id);
            if (!driver) {
                return {
                    success: false,
                    error: 'Driver profile not found',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            const data = await DriverDashboardService.getDriverRideHistory(driver.id, page, limit);

            return {success: true, data};
        } catch (error) {
            console.error('Error fetching ride history:', error);
            return {
                success: false,
                error: 'Failed to fetch ride history',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }
}
