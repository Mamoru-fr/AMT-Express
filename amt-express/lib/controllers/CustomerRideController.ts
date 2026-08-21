import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';
import {RidesManagementService} from '@/lib/services/RidesManagementService';
import {RidesViewController} from '@/lib/controllers/RidesViewController';
import {getSessionWithRole} from '@/lib/auth/session';
import {RideWithRelations} from '@/content/database_types/ride';
import type {SessionWithUser} from '@/content/database_types/auth';

interface SessionInfo {
    session: SessionWithUser | null;
    user: SessionWithUser['user'] | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isDriver: boolean;
    isCustomer: boolean;
}

/**
 * CustomerRideController - Gère les actions spécifiques aux clients
 * (contrairement à RidesManagementController qui est admin-only)
 */
export class CustomerRideController {
    /**
     * Réserve une course pour un client authentifié
     * SÉCURITÉ: Client only (must be authenticated and have customer role)
     */
    static async bookRide(rideId: string, customerId: string): Promise<ActionResponse<RideWithRelations>> {
        try {
            // === SÉCURITÉ ===
            const { isAuthenticated, isCustomer, user } = await getSessionWithRole() as SessionInfo;
            
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
            
            // Vérifier que le customerId correspond à l'utilisateur authentifié
            if (user?.id !== customerId) {
                return {
                    success: false,
                    error: 'Forbidden: You can only book rides for yourself',
                    code: ErrorCodes.FORBIDDEN,
                };
            }

            // Vérifier que la course existe et est disponible
            const pendingResponse = await RidesViewController.fetchPendingRides();
            
            if (!pendingResponse.success) {
                return {
                    success: false,
                    error: pendingResponse.error || 'Failed to fetch pending rides',
                    code: pendingResponse.code,
                };
            }
            
            const availableRides = pendingResponse.data || [];
            const rideToBook = availableRides.find(r => r.id === rideId);
            
            if (!rideToBook) {
                return {
                    success: false,
                    error: 'Ride not found or not available for booking',
                    code: ErrorCodes.RIDE_NOT_FOUND,
                };
            }
            
            if (rideToBook.status !== 'pending') {
                return {
                    success: false,
                    error: 'Ride is no longer available for booking',
                    code: ErrorCodes.RIDE_NOT_AVAILABLE,
                };
            }

            // === APPEL AU SERVICE ===
            await RidesManagementService.assignCustomerToRide(rideId, customerId);
            
            // Re-fetch the ride with updated data
            const updatedRides = await RidesViewController.fetchPendingRides();
            const updatedRide = updatedRides.success 
                ? updatedRides.data?.find(r => r.id === rideId)
                : null;
            
            if (!updatedRide) {
                // If we can't fetch the updated ride, just return the original ride
                // The frontend will refresh the ride list separately
                return {
                    success: true,
                    data: rideToBook
                };
            }
            
            return {
                success: true,
                data: updatedRide
            };
        } catch (error) {
            console.error('Error booking ride:', error);
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            
            if (errorMsg.includes('not found')) {
                return {
                    success: false,
                    error: errorMsg,
                    code: ErrorCodes.RIDE_NOT_FOUND
                };
            }
            
            if (errorMsg.includes('not available') || errorMsg.includes('already assigned')) {
                return {
                    success: false,
                    error: errorMsg,
                    code: ErrorCodes.RIDE_NOT_AVAILABLE
                };
            }
            
            return {
                success: false,
                error: errorMsg,
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * Annule la réservation d'une course par un client
     * SÉCURITÉ: Client only (must be authenticated and own the booking)
     */
    static async cancelBooking(rideId: string, customerId: string): Promise<ActionResponse<void>> {
        try {
            // === SÉCURITÉ ===
            const { isAuthenticated, isCustomer, user } = await getSessionWithRole() as SessionInfo;
            
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
            
            // Vérifier que le customerId correspond à l'utilisateur authentifié
            if (user?.id !== customerId) {
                return {
                    success: false,
                    error: 'Forbidden: You can only cancel your own bookings',
                    code: ErrorCodes.FORBIDDEN,
                };
            }

            // Vérifier que le client est bien assigné à cette course
            const customerRidesResponse = await RidesViewController.fetchCustomerRides();
            
            if (!customerRidesResponse.success) {
                return {
                    success: false,
                    error: customerRidesResponse.error || 'Failed to fetch your rides',
                    code: customerRidesResponse.code,
                };
            }
            
            const customerRides = customerRidesResponse.data || [];
            const rideToCancel = customerRides.find(r => r.id === rideId);
            
            if (!rideToCancel) {
                return {
                    success: false,
                    error: 'Ride not found in your bookings',
                    code: ErrorCodes.RIDE_NOT_FOUND,
                };
            }
            
            if (rideToCancel.status !== 'assigned') {
                return {
                    success: false,
                    error: 'Cannot cancel a ride that is not assigned to you',
                    code: ErrorCodes.RIDE_NOT_AVAILABLE,
                };
            }

            // === APPEL AU SERVICE ===
            await RidesManagementService.cancelRide(rideId);
            
            return {
                success: true,
                data: undefined
            };
        } catch (error) {
            console.error('Error cancelling booking:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to cancel booking',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }

    /**
     * Récupère les courses réservées par un client
     * SÉCURITÉ: Client only (must be authenticated)
     */
    static async getMyBookedRides(customerId: string): Promise<ActionResponse<RideWithRelations[]>> {
        try {
            // === SÉCURITÉ ===
            const { isAuthenticated, isCustomer, user } = await getSessionWithRole() as SessionInfo;
            
            if (!isAuthenticated) {
                return {
                    success: false,
                    error: 'Unauthorized: Please log in to view your rides',
                    code: ErrorCodes.UNAUTHORIZED,
                };
            }

            if (!isCustomer) {
                return {
                    success: false,
                    error: 'Forbidden: Only customers can view their rides',
                    code: ErrorCodes.FORBIDDEN,
                };
            }
            
            // Vérifier que le customerId correspond à l'utilisateur authentifié
            if (user?.id !== customerId) {
                return {
                    success: false,
                    error: 'Forbidden: You can only view your own rides',
                    code: ErrorCodes.FORBIDDEN,
                };
            }

            // === APPEL AU SERVICE ===
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
                data: response.data || []
            };
        } catch (error) {
            console.error('Error fetching customer rides:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch rides',
                code: ErrorCodes.DATABASE_ERROR
            };
        }
    }
}
