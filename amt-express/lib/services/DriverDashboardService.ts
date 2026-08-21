import db from "@/lib/db/drizzle";
import {rides, users, drivers, rideCustomers, assignmentRequests} from "@/lib/db/schema";
import {eq, and, gte, desc, sql, or, count} from "drizzle-orm";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";

type Ride = typeof rides.$inferSelect;
type RideWithCustomers = Ride & {
    rideCustomers: Array<typeof rideCustomers.$inferSelect & {customer: typeof users.$inferSelect}>;
};

export type DriverStats = {
    totalRides: number;
    completedRides: number;
    earnings: string;
    averageRating: number;
    pendingRides: number;
};

export type SuggestedRide = {
    id: string;
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

export class DriverDashboardService {
    /**
     * Get driver record for a user
     */
    static async getDriverForUser(userId: string) {
        const existing = await db.query.drivers.findFirst({
            where: eq(drivers.userId, userId)
        });
        if (existing) return existing;

        // Auto-create a minimal profile when the user has role=driver but no drivers record
        const [created] = await db.insert(drivers)
            .values({ userId, vehiclePlate: '' })
            .returning();
        return created;
    }

    /**
     * Fetch driver dashboard data including stats, suggested rides, and assigned rides
     */
    static async getDriverDashboard(driverId: string, available: boolean): Promise<DriverDashboardData> {
        const stats = await this.getDriverStats(driverId);
        const suggestedRides = await this.getSuggestedRides();
        const assignedRides = await this.getAssignedRides(driverId);

        return {
            stats,
            suggestedRides,
            assignedRides,
            isAvailable: available
        };
    }

    /**
     * Get driver statistics
     */
    private static async getDriverStats(driverId: string): Promise<DriverStats> {
        const allRides = await db.query.rides.findMany({
            where: eq(rides.driverId, driverId)
        });

        const completedRides = allRides.filter((r: Ride) => r.status === 'completed');
        const pendingRides = allRides.filter((r: Ride) => r.status === 'pending' || r.status === 'assigned');
        
        const totalEarnings = completedRides.reduce((sum: number, ride: Ride) => {
            return sum + parseFloat(ride.price || '0');
        }, 0);

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
            averageRating: Math.round(averageRating * 10) / 10,
            pendingRides: pendingRides.length
        };
    }

    /**
     * Get suggested rides for driver (unassigned, upcoming rides)
     */
    private static async getSuggestedRides(): Promise<SuggestedRide[]> {
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
    private static async getAssignedRides(driverId: string): Promise<RideWithRelations[]> {
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
     * Update driver availability status
     */
    static async updateAvailability(driverId: string, available: boolean): Promise<void> {
        await db.update(drivers)
            .set({ available })
            .where(eq(drivers.id, driverId));
    }

    /**
     * Request assignment to a ride
     */
    static async requestRideAssignment(driverId: string, rideId: string): Promise<void> {
        // Check if driver has reached max pending requests (5)
        const pendingRequestsCount = await db
            .select({count: count()})
            .from(assignmentRequests)
            .where(
                and(
                    eq(assignmentRequests.driverId, driverId),
                    eq(assignmentRequests.status, 'pending')
                )
            );

        if (Number(pendingRequestsCount[0]?.count || 0) >= 5) {
            throw new Error('Maximum of 5 simultaneous requests allowed');
        }

        // Check if ride exists
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

        // Check if driver already has a pending request for this ride
        const existingRequest = await db.query.assignmentRequests.findFirst({
            where: (assignmentRequests, {and, eq}) => and(
                eq(assignmentRequests.rideId, rideId),
                eq(assignmentRequests.driverId, driverId)
            )
        });

        if (existingRequest) {
            throw new Error('Request already submitted for this ride');
        }

        // Create assignment request
        await db.insert(assignmentRequests).values({
            rideId,
            driverId,
            status: 'pending'
        });
    }

    /**
     * Get ride history for driver
     */
    static async getDriverRideHistory(
        driverId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<{ rides: RideWithRelations[]; total: number; page: number; totalPages: number }> {
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
            rides: allRides.map((ride: RideWithCustomers) => ({
                ...ride,
                customers: ride.rideCustomers.map((rc: RideWithCustomers['rideCustomers'][0]) => ({
                    id: rc.customer.id,
                    name: rc.customer.name || rc.customer.email,
                    email: rc.customer.email
                }))
            })) as unknown as RideWithRelations[],
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
}
