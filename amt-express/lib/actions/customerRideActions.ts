'use server';

import { ActionResponse, ErrorCodes } from '@/lib/types/action-response';
import { RidesViewController } from '@/lib/controllers/RidesViewController';
import { CustomerRideController } from '@/lib/controllers/CustomerRideController';
import { getSessionWithRole } from '@/lib/auth/session';
import { RideWithRelations } from '@/content/database_types/ride';

/**
 * Search for available rides based on customer criteria
 * @param departure - Departure location filter
 * @param destination - Destination location filter  
 * @param date - Date filter (ISO string)
 * @param minPrice - Minimum price filter
 * @param maxPrice - Maximum price filter
 * @returns ActionResponse with available rides or error
 */
export async function searchAvailableRides(
    params: {
        departure?: string;
        destination?: string;
        date?: string;
        minPrice?: string | number;
        maxPrice?: string | number;
    } = {}
): Promise<ActionResponse<RideWithRelations[]>> {
    try {
        // Get authenticated customer
        const { isAuthenticated, isCustomer } = await getSessionWithRole();
        
        if (!isAuthenticated) {
            return {
                success: false,
                error: 'Unauthorized: Please log in to search for rides',
                code: ErrorCodes.UNAUTHORIZED,
            };
        }

        if (!isCustomer) {
            return {
                success: false,
                error: 'Forbidden: Only customers can search for rides',
                code: ErrorCodes.FORBIDDEN,
            };
        }

        // Get pending rides (available for booking) from controller
        // These are rides that haven't been assigned to any customer yet
        const pendingResponse = await RidesViewController.fetchPendingRides();
        
        if (!pendingResponse.success) {
            return {
                success: false,
                error: pendingResponse.error || 'Failed to fetch pending rides',
                code: pendingResponse.code,
            };
        }

        let rides = pendingResponse.data || [];

        // Apply client-side filtering if needed
        // In a production app, you'd want to do this filtering at the database level
        // But for simplicity, we'll filter here
        if (params.departure) {
            rides = rides.filter(ride => 
                ride.departure.toLowerCase().includes(params.departure!.toLowerCase())
            );
        }

        if (params.destination) {
            rides = rides.filter(ride => 
                ride.destination.toLowerCase().includes(params.destination!.toLowerCase())
            );
        }

        if (params.date) {
            const targetDate = new Date(params.date).toISOString().split('T')[0];
            rides = rides.filter(ride => {
                const rideDate = new Date(ride.departureTime).toISOString().split('T')[0];
                return rideDate === targetDate;
            });
        }

        if (params.minPrice) {
            rides = rides.filter(ride => {
                const price = parseFloat(ride.price || '0');
                return price >= Number(params.minPrice);
            });
        }

        if (params.maxPrice) {
            rides = rides.filter(ride => {
                const price = parseFloat(ride.price || '0');
                return price <= Number(params.maxPrice);
            });
        }
        
        return {
            success: true,
            data: rides,
        };
    } catch (error) {
        console.error('Error searching rides:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to search rides',
            code: ErrorCodes.INTERNAL_ERROR,
        };
    }
}

/**
 * Book a specific ride for the authenticated customer
 * @param rideId - ID of the ride to book
 * @returns ActionResponse with success status or error
 */
export async function bookRide(rideId: string): Promise<ActionResponse<RideWithRelations>> {
    try {
        // Get authenticated customer
        const { user, isCustomer, isAuthenticated } = await getSessionWithRole();
        
        if (!isAuthenticated) {
            return {
                success: false,
                error: 'Unauthorized: Please log in to book a ride',
                code: ErrorCodes.UNAUTHORIZED,
            };
        }

        if (!isCustomer) {
            return {
                success: false,
                error: 'Forbidden: Only customers can book rides',
                code: ErrorCodes.FORBIDDEN,
            };
        }

        if (!user?.id) {
            return {
                success: false,
                error: 'User information not available',
                code: ErrorCodes.UNAUTHORIZED,
            };
        }

        // Use CustomerRideController to book the ride
        const response = await CustomerRideController.bookRide(rideId, user.id);
        
        if (!response.success) {
            return {
                success: false,
                error: response.error || 'Failed to book ride',
                code: response.code,
            };
        }
        
        return response;
    } catch (error) {
        console.error('Error booking ride:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to book ride',
            code: ErrorCodes.INTERNAL_ERROR,
        };
    }
}

/**
 * Cancel a booking for the authenticated customer
 * @param rideId - ID of the ride to cancel
 * @returns ActionResponse with success status or error
 */
export async function cancelBooking(rideId: string): Promise<ActionResponse<void>> {
    try {
        // Get authenticated customer
        const { user, isCustomer, isAuthenticated } = await getSessionWithRole();
        
        if (!isAuthenticated) {
            return {
                success: false,
                error: 'Unauthorized: Please log in to cancel booking',
                code: ErrorCodes.UNAUTHORIZED,
            };
        }

        if (!isCustomer) {
            return {
                success: false,
                error: 'Forbidden: Only customers can cancel bookings',
                code: ErrorCodes.FORBIDDEN,
            };
        }

        if (!user?.id) {
            return {
                success: false,
                error: 'User information not available',
                code: ErrorCodes.UNAUTHORIZED,
            };
        }

        // Use CustomerRideController to cancel the booking
        const response = await CustomerRideController.cancelBooking(rideId, user.id);
        
        if (!response.success) {
            return {
                success: false,
                error: response.error || 'Failed to cancel booking',
                code: response.code,
            };
        }
        
        return response;
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to cancel booking',
            code: ErrorCodes.INTERNAL_ERROR,
        };
    }
}

/**
 * Get customer's booked rides
 * @returns ActionResponse with customer's rides or error
 */
export async function getMyRides(): Promise<ActionResponse<RideWithRelations[]>> {
    try {
        // Use existing customer rides endpoint
        const response = await RidesViewController.fetchCustomerRides();
        
        if (!response.success) {
            return {
                success: false,
                error: response.error || 'Failed to fetch your rides',
                code: response.code,
            };
        }

        return {
            success: true,
            data: response.data || [],
        };
    } catch (error) {
        console.error('Error fetching customer rides:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch rides',
            code: ErrorCodes.INTERNAL_ERROR,
        };
    }
}
