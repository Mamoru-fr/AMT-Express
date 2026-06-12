'use server'

import {RidesManagementController} from '@/lib/controllers/RidesManagementController';
import {ActionResponse} from '@/lib/types/action-response';
import {RideStatus, RideWithRelations} from '@/content/database_types/ride';
import type {RideFilters, RidesManagementData} from '@/lib/services/RidesManagementService';

/**
 * Rides Management Actions - Server Actions minimalistes
 * Délèguent tout au RidesManagementController
 */

// Re-export types for backward compatibility
export type {RideFilters, RidesManagementData};

export async function fetchRidesForManagement(filters: any = {}): Promise<ActionResponse<RidesManagementData>> {
    return RidesManagementController.fetchRidesForManagement(filters);
}

export async function createRide(data: {
    departureTime: Date;
    customerIds: string[];
    departure: string;
    destination: string;
    driverId?: string;
    price?: string;
    status?: RideStatus;
}): Promise<ActionResponse<number>> {
    return RidesManagementController.createRide(data);
}

export async function updateRideDetails(
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
    return RidesManagementController.updateRideDetails(rideId, data);
}

export async function assignDriverToRide(rideId: number, driverId: string): Promise<ActionResponse<void>> {
    return RidesManagementController.assignDriverToRide(rideId, driverId);
}

export async function cancelRide(rideId: number): Promise<ActionResponse<void>> {
    return RidesManagementController.cancelRide(rideId);
}

export async function deleteRide(rideId: number): Promise<ActionResponse<void>> {
    return RidesManagementController.deleteRide(rideId);
}

export async function fetchAvailableDrivers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
    return RidesManagementController.fetchAvailableDrivers();
}

export async function exportRidesToCSV(filters: any = {}): Promise<ActionResponse<string>> {
    return RidesManagementController.exportRidesToCSV(filters);
}

export async function fetchAllCustomers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
    return RidesManagementController.fetchAllCustomers();
}

export async function fetchAllProductions(): Promise<ActionResponse<Array<{id: string, name: string}>>> {
    return RidesManagementController.fetchAllProductions();
}

export async function fetchAllProjects(): Promise<ActionResponse<Array<{id: string, name: string, productionId: string | null}>>> {
    return RidesManagementController.fetchAllProjects();
}
