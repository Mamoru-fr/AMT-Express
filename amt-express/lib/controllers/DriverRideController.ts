import { ActionResponse, ErrorCodes } from '@/lib/types/action-response';
import { verifyRole } from '@/lib/middleware/roleMiddleware';
import { DriverDashboardService } from '@/lib/services/DriverDashboardService';

export class DriverRideController {
    static async updateRideProgress(
        rideId: string,
        data: { waitingTime?: number; driverNotes?: string },
    ): Promise<ActionResponse<void>> {
        try {
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;
            const { user } = roleCheck.data!;

            const driver = await DriverDashboardService.getDriverForUser(user.id);
            if (!driver) return { success: false, error: 'Driver profile not found', code: ErrorCodes.UNAUTHORIZED };

            await DriverDashboardService.updateRideProgress(driver.id, rideId, data);
            return { success: true, data: undefined };
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            if (msg === 'This ride is not assigned to you') {
                return { success: false, error: msg, code: ErrorCodes.UNAUTHORIZED };
            }
            console.error('Error updating ride progress:', error);
            return { success: false, error: 'Failed to update ride progress', code: ErrorCodes.DATABASE_ERROR };
        }
    }

    static async completeRide(
        rideId: string,
        driverPrice: string,
    ): Promise<ActionResponse<void>> {
        try {
            const roleCheck = await verifyRole('driver');
            if (!roleCheck.success) return roleCheck;
            const { user } = roleCheck.data!;

            const driver = await DriverDashboardService.getDriverForUser(user.id);
            if (!driver) return { success: false, error: 'Driver profile not found', code: ErrorCodes.UNAUTHORIZED };

            await DriverDashboardService.completeRide(driver.id, rideId, driverPrice);
            return { success: true, data: undefined };
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            if (msg === 'This ride is not assigned to you') {
                return { success: false, error: msg, code: ErrorCodes.UNAUTHORIZED };
            }
            console.error('Error completing ride:', error);
            return { success: false, error: 'Failed to complete ride', code: ErrorCodes.DATABASE_ERROR };
        }
    }
}
