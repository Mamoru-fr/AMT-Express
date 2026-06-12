'use server'

import {RidesViewController} from '@/lib/controllers/RidesViewController';
import {ActionResponse} from '@/lib/types/action-response';
import {RideWithRelations} from '@/content/database_types/ride';

/**
 * Rides View Actions - Server Actions minimalistes
 * Délèguent tout au RidesViewController
 */

export async function fetchDriverRidesCount(): Promise<ActionResponse<{completed: number, pending: number}>> {
    return RidesViewController.fetchDriverRidesCount();
}

export async function fetchDriverCompletedRides(): Promise<ActionResponse<RideWithRelations[]>> {
    return RidesViewController.fetchDriverCompletedRides();
}

export async function fetchDriverAssignedRides(): Promise<ActionResponse<RideWithRelations[]>> {
    return RidesViewController.fetchDriverAssignedRides();
}

export async function fetchPendingRides(): Promise<ActionResponse<RideWithRelations[]>> {
    return RidesViewController.fetchPendingRides();
}

export async function fetchCustomerRides(): Promise<ActionResponse<RideWithRelations[]>> {
    return RidesViewController.fetchCustomerRides();
}

// Aliases for backward compatibility
export async function fetchCustomerCompletedRides(): Promise<ActionResponse<RideWithRelations[]>> {
    return fetchCustomerRides();
}

export async function fetchCustomerRequestedRides(): Promise<ActionResponse<RideWithRelations[]>> {
    return fetchCustomerRides();
}
