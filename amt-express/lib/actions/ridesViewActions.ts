'use server'

/**
 * Server actions for role-based ride views
 * Handles fetching rides filtered by user role and status
 */

import db from "@/lib/db/drizzle";
import {rides, users, drivers, rideCustomers} from "@/lib/db/schema";
import {eq, and, desc, inArray, isNull, count} from "drizzle-orm";
import {RideWithRelations} from "@/content/database_types/ride";
import {auth} from "@/lib/auth/auth";
import {ActionResponse, ErrorCodes} from "@/lib/types/action-response";

async function getSessionWithRole() {
    const session = await auth.api.getSession({
        headers: await import('next/headers').then(mod => mod.headers())
    });

    if (!session) {
        return {session: null, user: null, isAdmin: false, isDriver: false, isCustomer: false};
    }

    const user = session.user;
    return {
        session,
        user,
        isAdmin: user.role === 'admin',
        isDriver: user.role === 'driver',
        isCustomer: user.role === 'customer'
    };
}

// Helper to get driver record from userId
async function getDriverForUser(userId: string) {
    return db.query.drivers.findFirst({
        where: eq(drivers.userId, userId)
    });
}

export async function fetchDriverRidesCount(): Promise<ActionResponse<{completed: number, pending: number}>> {
    try {
        const {session, user, isDriver} = await getSessionWithRole();

        if (!session || !isDriver) {
            return {
                success: false,
                error: 'Unauthorized: Driver access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }
        
        // Get driver record
        const driver = await getDriverForUser(user.id);
        if (!driver) {
            return {
                success: false,
                error: 'Driver profile not found',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        const countResultCompleted = await db
            .select({count: count()})
            .from(rides)
            .where(
                and(
                    eq(rides.driverId, driver.id),
                    eq(rides.status, 'completed')
                )
            );

        const totalCompleted = countResultCompleted[0]?.count || 0;

        const countResultPending = await db
            .select({count: count()})
            .from(rides)
            .where(eq(rides.status, 'pending')
            );

        const totalPending = countResultPending[0]?.count || 0;

        return {success: true, data: {completed: totalCompleted, pending: totalPending}};
    } catch (error) {
        console.error('Error fetching driver completed rides count:', error);
        return {
            success: false,
            error: 'Failed to fetch completed rides count',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Fetches all completed rides for a specific driver
 * Returns rides where driver is assigned and status is completed
 */
export async function fetchDriverCompletedRides(): Promise<ActionResponse<RideWithRelations[]>> {
    try {
        const {session, user, isDriver} = await getSessionWithRole();

        if (!session || !isDriver) {
            return {
                success: false,
                error: 'Unauthorized: Driver access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Get driver record
        const driver = await getDriverForUser(user.id);
        if (!driver) {
            return {
                success: false,
                error: 'Driver profile not found',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        const driverRides = await db
            .select({
                ride: rides,
                driver: users,
            })
            .from(rides)
            .leftJoin(drivers, eq(rides.driverId, drivers.id))
            .leftJoin(users, eq(drivers.userId, users.id))
            .where(
                and(
                    eq(rides.driverId, driver.id),
                    eq(rides.status, 'completed')
                )
            )
            .orderBy(desc(rides.departureTime));

        // Fetch customers for each ride
        const ridesWithCustomers: RideWithRelations[] = await Promise.all(
            driverRides.map(async ({ride, driver}) => {
                const customersData = await db
                    .select({
                        customer: users
                    })
                    .from(rideCustomers)
                    .innerJoin(users, eq(rideCustomers.customerId, users.id))
                    .where(eq(rideCustomers.rideId, ride.id));

                return {
                    ...ride,
                    waitingTime: ride.waitingTime || 0,
                    options: [],
                    driver: driver || undefined,
                    customers: customersData.map(c => c.customer),
                    selectedOptions: [],
                };
            })
        );

        return {success: true, data: ridesWithCustomers};
    } catch (error) {
        console.error('Error fetching driver completed rides:', error);
        return {
            success: false,
            error: 'Failed to fetch completed rides',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Fetches all rides assigned to the current driver (not completed)
 * Returns pending and assigned rides where driver is assigned
 */
export async function fetchDriverAssignedRides(): Promise<ActionResponse<RideWithRelations[]>> {
    try {
        const {session, user, isDriver} = await getSessionWithRole();

        if (!session || !isDriver) {
            return {
                success: false,
                error: 'Unauthorized: Driver access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Get driver record
        const driver = await getDriverForUser(user.id);
        if (!driver) {
            return {
                success: false,
                error: 'Driver profile not found',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        const driverRides = await db
            .select({
                ride: rides,
                driver: users,
            })
            .from(rides)
            .leftJoin(drivers, eq(rides.driverId, drivers.id))
            .leftJoin(users, eq(drivers.userId, users.id))
            .where(
                and(
                    eq(rides.driverId, driver.id),
                    inArray(rides.status, ['assigned'])
                )
            )
            .orderBy(desc(rides.departureTime));

        // Fetch customers for each ride
        const ridesWithCustomers: RideWithRelations[] = await Promise.all(
            driverRides.map(async ({ride, driver}) => {
                const customersData = await db
                    .select({
                        customer: users
                    })
                    .from(rideCustomers)
                    .innerJoin(users, eq(rideCustomers.customerId, users.id))
                    .where(eq(rideCustomers.rideId, ride.id));

                return {
                    ...ride,
                    waitingTime: ride.waitingTime || 0,
                    options: [],
                    driver: driver || undefined,
                    customers: customersData.map(c => c.customer),
                    selectedOptions: [],
                };
            })
        );

        return {success: true, data: ridesWithCustomers};
    } catch (error) {
        console.error('Error fetching driver assigned rides:', error);
        return {
            success: false,
            error: 'Failed to fetch assigned rides',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Fetches all pending rides (not assigned to any driver)
 * Available for drivers to request assignment
 */
export async function fetchPendingRides(): Promise<ActionResponse<RideWithRelations[]>> {
    try {
        const {session, isDriver} = await getSessionWithRole();

        if (!session || !isDriver) {
            return {
                success: false,
                error: 'Unauthorized: Driver access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        const pendingRides = await db
            .select({
                ride: rides,
            })
            .from(rides)
            .where(
                and(
                    eq(rides.status, 'pending'),
                    isNull(rides.driverId) // No driver assigned
                )
            )
            .orderBy(desc(rides.departureTime));

        // Fetch customers for each ride
        const ridesWithCustomers: RideWithRelations[] = await Promise.all(
            pendingRides.map(async ({ride}) => {
                const customersData = await db
                    .select({
                        customer: users
                    })
                    .from(rideCustomers)
                    .innerJoin(users, eq(rideCustomers.customerId, users.id))
                    .where(eq(rideCustomers.rideId, ride.id));

                return {
                    ...ride,
                    waitingTime: ride.waitingTime || 0,
                    options: [],
                    driver: undefined,
                    customers: customersData.map(c => c.customer),
                    selectedOptions: [],
                };
            })
        );

        return {success: true, data: ridesWithCustomers};
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
 * Fetches all completed rides where the current user is a customer
 */
export async function fetchCustomerCompletedRides(): Promise<ActionResponse<RideWithRelations[]>> {
    try {
        const {session, user, isCustomer} = await getSessionWithRole();

        if (!session || !isCustomer) {
            return {
                success: false,
                error: 'Unauthorized: Customer access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Get ride IDs where user is a customer
        const customerRideIds = await db
            .select({rideId: rideCustomers.rideId})
            .from(rideCustomers)
            .where(eq(rideCustomers.customerId, user.id));

        if (customerRideIds.length === 0) {
            return {success: true, data: []};
        }

        const rideIds = customerRideIds.map(r => r.rideId);

        const customerRides = await db
            .select({
                ride: rides,
                driver: users,
            })
            .from(rides)
            .leftJoin(drivers, eq(rides.driverId, drivers.id))
            .leftJoin(users, eq(drivers.userId, users.id))
            .where(
                and(
                    inArray(rides.id, rideIds),
                    eq(rides.status, 'completed')
                )
            )
            .orderBy(desc(rides.departureTime));

        // Fetch customers for each ride
        const ridesWithCustomers: RideWithRelations[] = await Promise.all(
            customerRides.map(async ({ride, driver}) => {
                const customersData = await db
                    .select({
                        customer: users
                    })
                    .from(rideCustomers)
                    .innerJoin(users, eq(rideCustomers.customerId, users.id))
                    .where(eq(rideCustomers.rideId, ride.id));

                return {
                    ...ride,
                    waitingTime: ride.waitingTime || 0,
                    options: [],
                    driver: driver || undefined,
                    customers: customersData.map(c => c.customer),
                    selectedOptions: [],
                };
            })
        );

        return {success: true, data: ridesWithCustomers};
    } catch (error) {
        console.error('Error fetching customer completed rides:', error);
        return {
            success: false,
            error: 'Failed to fetch completed rides',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Fetches all rides requested by the current customer that are not yet completed
 */
export async function fetchCustomerRequestedRides(): Promise<ActionResponse<RideWithRelations[]>> {
    try {
        const {session, user, isCustomer} = await getSessionWithRole();

        if (!session || !isCustomer) {
            return {
                success: false,
                error: 'Unauthorized: Customer access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Get ride IDs where user is a customer
        const customerRideIds = await db
            .select({rideId: rideCustomers.rideId})
            .from(rideCustomers)
            .where(eq(rideCustomers.customerId, user.id));

        if (customerRideIds.length === 0) {
            return {success: true, data: []};
        }

        const rideIds = customerRideIds.map(r => r.rideId);

        const customerRides = await db
            .select({
                ride: rides,
                driver: users,
            })
            .from(rides)
            .leftJoin(drivers, eq(rides.driverId, drivers.id))
            .leftJoin(users, eq(drivers.userId, users.id))
            .where(
                and(
                    inArray(rides.id, rideIds),
                    inArray(rides.status, ['pending', 'assigned'])
                )
            )
            .orderBy(desc(rides.departureTime));

        // Fetch customers for each ride
        const ridesWithCustomers: RideWithRelations[] = await Promise.all(
            customerRides.map(async ({ride, driver}) => {
                const customersData = await db
                    .select({
                        customer: users
                    })
                    .from(rideCustomers)
                    .innerJoin(users, eq(rideCustomers.customerId, users.id))
                    .where(eq(rideCustomers.rideId, ride.id));

                return {
                    ...ride,
                    waitingTime: ride.waitingTime || 0,
                    options: [],
                    driver: driver || undefined,
                    customers: customersData.map(c => c.customer),
                    selectedOptions: [],
                };
            })
        );

        return {success: true, data: ridesWithCustomers};
    } catch (error) {
        console.error('Error fetching customer requested rides:', error);
        return {
            success: false,
            error: 'Failed to fetch requested rides',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}
