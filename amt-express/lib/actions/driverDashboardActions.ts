'use server'

import db from "@/lib/db/drizzle";
import {rides, users, drivers, rideCustomers, assignmentRequests} from "@/lib/db/schema";
import {eq, and, gte, desc, sql, or, count} from "drizzle-orm";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";
import {auth} from "@/lib/auth/auth";
import {ActionResponse, ErrorCodes} from "@/lib/types/action-response";
import {RequestRideAssignmentSchema, ToggleAvailabilitySchema, RideHistorySchema} from "@/lib/validations/dashboard";
import {z} from "zod";
import {getSessionWithRole} from "../auth/session";

// Type for a ride record returned from database
type Ride = typeof rides.$inferSelect;
type RideWithCustomers = Ride & {
    rideCustomers: Array<typeof rideCustomers.$inferSelect & {customer: typeof users.$inferSelect}>;
};

/**
 * Get the driver record for a user
 */
async function getDriverForUser(userId: string) {
    return db.query.drivers.findFirst({
        where: eq(drivers.userId, userId)
    });
}

export type DriverStats = {
    totalRides: number;
    completedRides: number;
    earnings: string;
    averageRating: number;
    pendingRides: number;
};

export type SuggestedRide = {
    id: number;
    departureTime: Date;
    departure: string;
    destination: string;
    price: string;
    distance?: string;
    customers: Array<{ id: string; name: string }>;
};

export type DriverDashboardData = {
    stats: DriverStats;
    suggestedRides: SuggestedRide[];
    assignedRides: RideWithRelations[];
    isAvailable: boolean;
};

/**
 * Fetch driver dashboard data including stats, suggested rides, and assigned rides
 */
export async function fetchDriverDashboard(): Promise<ActionResponse<DriverDashboardData>> {
    const {session, isDriver} = await getSessionWithRole();

    if (!isDriver) {
        return {
            success: false,
            error: 'Unauthorized: Driver access only',
            code: ErrorCodes.UNAUTHORIZED
        };
    }

    if (!session) { return { success: false, error: 'No active session found', code: ErrorCodes.UNAUTHORIZED };}

    try {
        const userId = session.user.id;
        
        // Get the driver record for this user
        const driver = await db.query.drivers.findFirst({
            where: eq(drivers.userId, userId)
        });
        
        if (!driver) {
            return {
                success: false,
                error: 'Driver profile not found',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Fetch driver stats
        const stats = await getDriverStats(driver.id);

        // Fetch suggested rides (unassigned, upcoming rides)
        const suggestedRides = await getSuggestedRides();

        // Fetch assigned rides
        const assignedRides = await getAssignedRides(driver.id);

        return {
            success: true,
            data: {
                stats,
                suggestedRides,
                assignedRides,
                isAvailable: driver.available || false
            }
        };
    } catch (error) {
        console.error('Error fetching driver dashboard:', error);
        return {
            success: false,
            error: 'Failed to fetch dashboard data',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Get driver statistics
 */
async function getDriverStats(driverId: number): Promise<DriverStats> {
    const allRides = await db.query.rides.findMany({
        where: eq(rides.driverId, driverId)
    });

    const completedRides = allRides.filter((r: Ride) => r.status === 'completed');
    const pendingRides = allRides.filter((r: Ride) => r.status === 'pending' || r.status === 'assigned');
    
    const totalEarnings = completedRides.reduce((sum: number, ride: Ride) => {
        return sum + parseFloat(ride.price || '0');
    }, 0);

    // Calculate average rating from database
    const ratingResult = await db
        .select({averageRating: sql<number>`COALESCE(AVG(${rideCustomers.rating}), 0)`})
        .from(rideCustomers)
        .innerJoin(rides, eq(rides.id, rideCustomers.rideId))
        .where(eq(rides.driverId, driverId));
    
    const averageRating = Number(ratingResult[0]?.averageRating || 0);

    return {
        totalRides: allRides.length,
        completedRides: completedRides.length,
        earnings: totalEarnings.toFixed(2),
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        pendingRides: pendingRides.length
    };
}

/**
 * Get suggested rides for driver (unassigned, upcoming rides)
 */
async function getSuggestedRides(): Promise<SuggestedRide[]> {
    const now = new Date();
    
    const unassignedRides = await db.query.rides.findMany({
        where: and(
            eq(rides.status, 'pending' as RideStatus),
            gte(rides.departureTime, now)
        ),
        orderBy: [rides.departureTime],
        limit: 10,
        with: {
            rideCustomers: {
                with: {
                    customer: true
                }
            }
        }
    });

    return unassignedRides.map((ride: RideWithCustomers) => ({
        id: ride.id,
        departureTime: ride.departureTime,
        departure: ride.departure,
        destination: ride.destination,
        price: ride.price || '0.00',
        distance: ride.distanceKm ? `${ride.distanceKm} km` : undefined,
        customers: ride.rideCustomers.map((rc: RideWithCustomers['rideCustomers'][0]) => ({
            id: rc.customer.id,
            name: rc.customer.name || rc.customer.email
        }))
    }));
}

/**
 * Get rides assigned to driver
 */
async function getAssignedRides(driverId: number): Promise<RideWithRelations[]> {
    const now = new Date();
    
    const assignedRides = await db.query.rides.findMany({
        where: and(
            eq(rides.driverId, driverId),
            or(
                eq(rides.status, 'assigned' as RideStatus),
                eq(rides.status, 'pending' as RideStatus)
            ),
            gte(rides.departureTime, now)
        ),
        orderBy: [rides.departureTime],
        with: {
            driver: true,
            rideCustomers: {
                with: {
                    customer: true
                }
            }
        }
    });

    return assignedRides.map((ride: RideWithCustomers) => ({
        ...ride,
        customers: ride.rideCustomers.map((rc: RideWithCustomers['rideCustomers'][0]) => ({
            id: rc.customer.id,
            name: rc.customer.name || rc.customer.email,
            email: rc.customer.email
        }))
    })) as unknown as RideWithRelations[];
}

/**
 * Toggle driver availability status
 */
export async function toggleDriverAvailability(available: boolean): Promise<ActionResponse<void>> {
    try {
        const session = await auth.api.getSession({
            headers: await import("next/headers").then(m => m.headers())
        });

        if (!session || session.user.role !== 'driver') {
            return {
                success: false,
                error: 'Unauthorized: Driver access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Validate input
        ToggleAvailabilitySchema.parse({available});
        
        // Get driver record
        const driver = await getDriverForUser(session.user.id);
        if (!driver) {
            return {
                success: false,
                error: 'Driver profile not found',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        await db.update(drivers)
            .set({ available })
            .where(eq(drivers.id, driver.id));

        return {success: true, data: undefined};
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed',
                code: ErrorCodes.VALIDATION_ERROR,
                details: error.flatten()
            };
        }
        console.error('Error toggling availability:', error);
        return {
            success: false,
            error: 'Failed to update availability',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Request assignment to a ride
 * Enforces maximum of 5 simultaneous pending requests per driver
 */
export async function requestRideAssignment(rideId: number, message?: string): Promise<ActionResponse<void>> {
    try {
        const session = await auth.api.getSession({
            headers: await import("next/headers").then(m => m.headers())
        });

        if (!session || session.user.role !== 'driver') {
            return {
                success: false,
                error: 'Unauthorized: Driver access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Validate input
        const validatedData = RequestRideAssignmentSchema.parse({rideId, message});
        
        // Get driver record
        const driver = await getDriverForUser(session.user.id);
        if (!driver) {
            return {
                success: false,
                error: 'Driver profile not found',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Check if driver has reached max pending requests (5)
        const pendingRequestsCount = await db
            .select({count: count()})
            .from(assignmentRequests)
            .where(
                and(
                    eq(assignmentRequests.driverId, driver.id),
                    eq(assignmentRequests.status, 'pending')
                )
            );

        if (Number(pendingRequestsCount[0]?.count || 0) >= 5) {
            return {
                success: false,
                error: 'Maximum of 5 simultaneous requests allowed',
                code: ErrorCodes.MAX_REQUESTS_EXCEEDED
            };
        }

        // Check if ride exists and is available
        const ride = await db.query.rides.findFirst({
            where: eq(rides.id, validatedData.rideId)
        });

        if (!ride) {
            return {
                success: false,
                error: 'Ride not found',
                code: ErrorCodes.RIDE_NOT_FOUND
            };
        }

        if (ride.driverId) {
            return {
                success: false,
                error: 'Ride already assigned',
                code: ErrorCodes.RIDE_ALREADY_ASSIGNED
            };
        }

        if (ride.status !== 'pending') {
            return {
                success: false,
                error: 'Ride is not available for assignment',
                code: ErrorCodes.RIDE_NOT_AVAILABLE
            };
        }

        // Check if driver already has a pending request for this ride
        const existingRequest = await db.query.assignmentRequests.findFirst({
            where: (assignmentRequests, {and, eq}) => and(
                eq(assignmentRequests.rideId, validatedData.rideId),
                eq(assignmentRequests.driverId, driver.id)
            )
        });

        if (existingRequest) {
            return {
                success: false,
                error: 'Request already submitted for this ride',
                code: ErrorCodes.ASSIGNMENT_ERROR
            };
        }

        // Create assignment request
        await db.insert(assignmentRequests).values({
            rideId: validatedData.rideId,
            driverId: driver.id,
            status: 'pending'
        });

        // TODO: Send notification to admin about the request

        return {success: true, data: undefined};
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed',
                code: ErrorCodes.VALIDATION_ERROR,
                details: error.flatten()
            };
        }
        console.error('Error requesting ride assignment:', error);
        return {
            success: false,
            error: 'Failed to request assignment',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Get ride history for driver
 */
export async function getDriverRideHistory(
    page: number = 1,
    limit: number = 20
): Promise<ActionResponse<{ rides: RideWithRelations[]; total: number; page: number; totalPages: number }>> {
    try {
        const session = await auth.api.getSession({
            headers: await import("next/headers").then(m => m.headers())
        });

        if (!session || session.user.role !== 'driver') {
            return {
                success: false,
                error: 'Unauthorized: Driver access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Validate input
        const validatedData = RideHistorySchema.parse({page, limit});
        
        // Get driver record
        const driver = await getDriverForUser(session.user.id);
        if (!driver) {
            return {
                success: false,
                error: 'Driver profile not found',
                code: ErrorCodes.UNAUTHORIZED
            };
        }
        
        const offset = (validatedData.page - 1) * validatedData.limit;

        const allRides = await db.query.rides.findMany({
            where: eq(rides.driverId, driver.id),
            orderBy: [desc(rides.departureTime)],
            limit: validatedData.limit,
            offset,
            with: {
                driver: true,
                rideCustomers: {
                    with: {
                        customer: true
                    }
                }
            }
        });

        const totalRides = await db.select({ count: sql<number>`count(*)` })
            .from(rides)
            .where(eq(rides.driverId, driver.id));

        const total = Number(totalRides[0]?.count || 0);

        return {
            success: true,
            data: {
                rides: allRides.map((ride: RideWithCustomers) => ({
                    ...ride,
                    customers: ride.rideCustomers.map((rc: RideWithCustomers['rideCustomers'][0]) => ({
                        id: rc.customer.id,
                        name: rc.customer.name || rc.customer.email,
                        email: rc.customer.email
                    }))
                })) as unknown as RideWithRelations[],
                total,
                page: validatedData.page,
                totalPages: Math.ceil(total / validatedData.limit)
            }
        };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed',
                code: ErrorCodes.VALIDATION_ERROR,
                details: error.flatten()
            };
        }
        console.error('Error fetching ride history:', error);
        return {
            success: false,
            error: 'Failed to fetch ride history',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}
