'use server'

import {DriverDashboardController} from '@/lib/controllers/DriverDashboardController';
import {ActionResponse} from '@/lib/types/action-response';
import type {DriverDashboardData, DriverStats, SuggestedRide} from '@/lib/services/DriverDashboardService';

/**
 * Driver Dashboard Actions - Server Actions minimalistes
 * Délèguent tout au DriverDashboardController
 */

export async function fetchDriverDashboard(): Promise<ActionResponse<DriverDashboardData>> {
    return DriverDashboardController.fetchDriverDashboard();
}

export async function toggleDriverAvailability(available: boolean): Promise<ActionResponse<void>> {
    return DriverDashboardController.toggleDriverAvailability(available);
}

export async function requestRideAssignment(rideId: number, message?: string): Promise<ActionResponse<void>> {
    return DriverDashboardController.requestRideAssignment(rideId, message);
}

export async function getDriverRideHistory(page: number = 1, limit: number = 10): Promise<ActionResponse<{rides: any[], total: number, page: number, totalPages: number}>> {
    return DriverDashboardController.getDriverRideHistory(page, limit);
}
