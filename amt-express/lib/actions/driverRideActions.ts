'use server';

import { requireRole } from '@/lib/middleware/roleMiddleware';
import { ActionResponse, ErrorCodes } from '@/lib/types/action-response';
import { validateRideId } from '@/lib/validations/ride';
import { DriverRideController } from '@/lib/controllers/DriverRideController';
import { z } from 'zod';

const UpdateProgressSchema = z.object({
    waitingTime: z.number().int().min(0).max(600).optional(),
    driverNotes: z.string().max(2000).optional(),
});

const DriverPriceSchema = z
    .string()
    .min(1, 'Meter amount is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Must be a valid amount (e.g. 42 or 42.50)');

export async function updateRideProgress(
    rideId: string,
    data: { waitingTime?: number; driverNotes?: string },
): Promise<ActionResponse<void>> {
    console.log('[Action] updateRideProgress — rideId:', rideId, '| data:', data);

    const roleCheck = await requireRole('driver');
    if (!roleCheck.success) return { success: false, error: roleCheck.error || 'Unauthorized', code: ErrorCodes.UNAUTHORIZED };

    const idValidation = validateRideId({ rideId });
    if (!idValidation.success) return { success: false, error: idValidation.error || 'Invalid ride ID', code: ErrorCodes.VALIDATION_ERROR };

    const parsed = UpdateProgressSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid data', code: ErrorCodes.VALIDATION_ERROR };

    console.log('[Action] updateRideProgress — validations passed, delegating to DriverRideController');
    return DriverRideController.updateRideProgress(rideId, parsed.data);
}

export async function completeRide(
    rideId: string,
    driverPrice: string,
): Promise<ActionResponse<void>> {
    console.log('[Action] completeRide — rideId:', rideId, '| driverPrice:', driverPrice);

    const roleCheck = await requireRole('driver');
    if (!roleCheck.success) return { success: false, error: roleCheck.error || 'Unauthorized', code: ErrorCodes.UNAUTHORIZED };

    const idValidation = validateRideId({ rideId });
    if (!idValidation.success) return { success: false, error: idValidation.error || 'Invalid ride ID', code: ErrorCodes.VALIDATION_ERROR };

    const priceValidation = DriverPriceSchema.safeParse(driverPrice.trim());
    if (!priceValidation.success) return { success: false, error: priceValidation.error.issues[0]?.message ?? 'Invalid amount', code: ErrorCodes.VALIDATION_ERROR };

    console.log('[Action] completeRide — validations passed, delegating to DriverRideController');
    return DriverRideController.completeRide(rideId, priceValidation.data);
}

