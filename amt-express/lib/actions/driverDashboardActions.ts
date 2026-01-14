'use server'

import db from "@/lib/db/drizzle";
import {rides, users, rideCustomers} from "@/lib/db/schema";
import {eq, and, gte, desc, sql, or} from "drizzle-orm";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";
import {auth} from "@/lib/auth/auth";

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
export async function fetchDriverDashboard(): Promise<DriverDashboardData> {
    const session = await auth.api.getSession({
        headers: await import("next/headers").then(m => m.headers())
    });

    if (!session || session.user.role !== 'driver') {
        throw new Error('Unauthorized: Driver access only');
    }

    const driverId = session.user.id;

    // Fetch driver stats
    const stats = await getDriverStats(driverId);

    // Fetch suggested rides (unassigned, upcoming rides)
    const suggestedRides = await getSuggestedRides(driverId);

    // Fetch assigned rides
    const assignedRides = await getAssignedRides(driverId);

    // Get driver availability status
    const driver = await db.query.users.findFirst({
        where: eq(users.id, driverId)
    });

    return {
        stats,
        suggestedRides,
        assignedRides,
        isAvailable: driver?.available || false
    };
}

/**
 * Get driver statistics
 */
async function getDriverStats(driverId: string): Promise<DriverStats> {
    const allRides = await db.query.rides.findMany({
        where: eq(rides.driverId, driverId)
    });

    const completedRides = allRides.filter((r: any) => r.status === 'completed');
    const pendingRides = allRides.filter((r: any) => r.status === 'pending' || r.status === 'assigned');
    
    const totalEarnings = completedRides.reduce((sum: number, ride: any) => {
        return sum + parseFloat(ride.price || '0');
    }, 0);

    // TODO: Calculate average rating when rating system is implemented
    const averageRating = 4.5;

    return {
        totalRides: allRides.length,
        completedRides: completedRides.length,
        earnings: totalEarnings.toFixed(2),
        averageRating,
        pendingRides: pendingRides.length
    };
}

/**
 * Get suggested rides for driver (unassigned, upcoming rides)
 */
async function getSuggestedRides(driverId: string): Promise<SuggestedRide[]> {
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

    return unassignedRides.map((ride: any) => ({
        id: ride.id,
        departureTime: ride.departureTime,
        departure: ride.departure,
        destination: ride.destination,
        price: ride.price || '0.00',
        distance: ride.distanceKm ? `${ride.distanceKm} km` : undefined,
        customers: ride.rideCustomers.map((rc: any) => ({
            id: rc.customer.id,
            name: rc.customer.name || rc.customer.email
        }))
    }));
}

/**
 * Get rides assigned to driver
 */
async function getAssignedRides(driverId: string): Promise<RideWithRelations[]> {
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

    return assignedRides.map((ride: any) => ({
        ...ride,
        customers: ride.rideCustomers.map((rc: any) => ({
            id: rc.customer.id,
            name: rc.customer.name || rc.customer.email,
            email: rc.customer.email
        }))
    })) as RideWithRelations[];
}

/**
 * Toggle driver availability status
 */
export async function toggleDriverAvailability(available: boolean): Promise<void> {
    const session = await auth.api.getSession({
        headers: await import("next/headers").then(m => m.headers())
    });

    if (!session || session.user.role !== 'driver') {
        throw new Error('Unauthorized: Driver access only');
    }

    await db.update(users)
        .set({ available })
        .where(eq(users.id, session.user.id));
}

/**
 * Request assignment to a ride
 */
export async function requestRideAssignment(rideId: number, message?: string): Promise<void> {
    const session = await auth.api.getSession({
        headers: await import("next/headers").then(m => m.headers())
    });

    if (!session || session.user.role !== 'driver') {
        throw new Error('Unauthorized: Driver access only');
    }

    const driverId = session.user.id;

    // Check if ride exists and is available
    const ride = await db.query.rides.findFirst({
        where: eq(rides.id, rideId)
    });

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.driverId) {
        throw new Error('Ride already assigned');
    }

    if (ride.status !== 'pending') {
        throw new Error('Ride is not available for assignment');
    }

    // TODO: Create a ride assignment request in a new table
    // For now, we'll just assign directly
    await db.update(rides)
        .set({
            driverId,
            status: 'assigned' as RideStatus
        })
        .where(eq(rides.id, rideId));

    // TODO: Send notification to admin about the request
}

/**
 * Get ride history for driver
 */
export async function getDriverRideHistory(
    page: number = 1,
    limit: number = 20
): Promise<{ rides: RideWithRelations[]; total: number; page: number; totalPages: number }> {
    const session = await auth.api.getSession({
        headers: await import("next/headers").then(m => m.headers())
    });

    if (!session || session.user.role !== 'driver') {
        throw new Error('Unauthorized: Driver access only');
    }

    const driverId = session.user.id;
    const offset = (page - 1) * limit;

    const allRides = await db.query.rides.findMany({
        where: eq(rides.driverId, driverId),
        orderBy: [desc(rides.departureTime)],
        limit,
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
        .where(eq(rides.driverId, driverId));

    const total = Number(totalRides[0]?.count || 0);

    return {
        rides: allRides.map((ride: any) => ({
            ...ride,
            customers: ride.rideCustomers.map((rc: any) => ({
                id: rc.customer.id,
                name: rc.customer.name || rc.customer.email,
                email: rc.customer.email
            }))
        })) as RideWithRelations[],
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}
