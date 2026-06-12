import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {RidesViewService} from '@/lib/services/RidesViewService';
import {RideWithRelations} from '@/content/database_types/ride';
import {verifyRole} from '@/lib/middleware/roleMiddleware';

/**
 * RidesViewController - Gère la sécurité et la validation
 * Délègue la logique métier à RidesViewService
 */
export class RidesViewController {
    /**
     * SÉCURITÉ: Driver only
     */
    static async fetchDriverRidesCount(): Promise<ActionResponse<{completed: number, pending: number}>> {
        try {
            // === SÉCURITÉ ===
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;
            const {session, user} = roleCheck.data!;

            // === APPEL AU SERVICE ===
            const driver = await RidesViewService.getDriverForUser(user.id);
            if (!driver) {
                return {
                    success: false,
                    error: 'Driver profile not found',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            const data = await RidesViewService.fetchDriverRidesCount(driver.id);

            return {success: true, data};
        } catch (error) {
            console.error('Error fetching rides count:', error);
            return {
                success: false,
                error: 'Failed to fetch rides count',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Driver only
     */
    static async fetchDriverCompletedRides(): Promise<ActionResponse<RideWithRelations[]>> {
        try {
            // === SÉCURITÉ ===
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;
            const {session, user} = roleCheck.data!;

            // === APPEL AU SERVICE ===
            const driver = await RidesViewService.getDriverForUser(user.id);
            if (!driver) {
                return {
                    success: false,
                    error: 'Driver profile not found',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            const data = await RidesViewService.fetchDriverCompletedRides(driver.id);

            return {success: true, data};
        } catch (error) {
            console.error('Error fetching completed rides:', error);
            return {
                success: false,
                error: 'Failed to fetch completed rides',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Driver only
     */
    static async fetchDriverAssignedRides(): Promise<ActionResponse<RideWithRelations[]>> {
        try {
            // === SÉCURITÉ ===
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;
            const {session, user} = roleCheck.data!;

            // === APPEL AU SERVICE ===
            const driver = await RidesViewService.getDriverForUser(user.id);
            if (!driver) {
                return {
                    success: false,
                    error: 'Driver profile not found',
                    code: ErrorCodes.UNAUTHORIZED
                };
            }

            const data = await RidesViewService.fetchDriverAssignedRides(driver.id);

            return {success: true, data};
        } catch (error) {
            console.error('Error fetching assigned rides:', error);
            return {
                success: false,
                error: 'Failed to fetch assigned rides',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Driver only
     */
    static async fetchPendingRides(): Promise<ActionResponse<RideWithRelations[]>> {
        try {
            // === SÉCURITÉ ===
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;

            // === APPEL AU SERVICE ===
            const data = await RidesViewService.fetchPendingRides();

            return {success: true, data};
        } catch (error) {
            console.error('Error fetching pending rides:', error);
            return {
                success: false,
                error: 'Failed to fetch pending rides',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * SÉCURITÉ: Customer only
     */
    static async fetchCustomerRides(): Promise<ActionResponse<RideWithRelations[]>> {
        try {
            // === SÉCURITÉ ===
            const roleCheck = await verifyRole('customer');
            if (!roleCheck.success) return roleCheck;
            const {session, user} = roleCheck.data!;

            // === APPEL AU SERVICE ===
            const data = await RidesViewService.fetchCustomerRides(user.id);

            return {success: true, data};
        } catch (error) {
            console.error('Error fetching customer rides:', error);
            return {
                success: false,
                error: 'Failed to fetch rides',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }
}
