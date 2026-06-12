import db from "@/lib/db/drizzle";
import {rides, users, drivers, rideCustomers} from "@/lib/db/schema";
import {eq, and, desc, inArray, count} from "drizzle-orm";
import {RideWithRelations} from "@/content/database_types/ride";

type RideWithCustomers = typeof rides.$inferSelect & {
    rideCustomers: Array<typeof rideCustomers.$inferSelect & {customer: typeof users.$inferSelect}>;
};

export class RidesViewService {
    /**
     * Get driver record from userId
     */
    static async getDriverForUser(userId: string) {
        return db.query.drivers.findFirst({
            where: eq(drivers.userId, userId)
        });
    }

    /**
     * Fetches completed and pending rides count for a driver
     */
    static async fetchDriverRidesCount(driverId: number): Promise<{completed: number, pending: number}> {
        const countResultCompleted = await db
            .select({count: count()})
            .from(rides)
            .where(
                and(
                    eq(rides.driverId, driverId),
                    eq(rides.status, 'completed')
                )
            );

        const totalCompleted = countResultCompleted[0]?.count || 0;

        const countResultPending = await db
            .select({count: count()})
            .from(rides)
            .where(eq(rides.status, 'pending'));

        const totalPending = countResultPending[0]?.count || 0;

        return {completed: totalCompleted, pending: totalPending};
    }

    /**
     * Fetches all completed rides for a specific driver
     */
    static async fetchDriverCompletedRides(driverId: number): Promise<RideWithRelations[]> {
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
                    eq(rides.driverId, driverId),
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

        return ridesWithCustomers;
    }

    /**
     * Fetches all rides assigned to the current driver (not completed)
     */
    static async fetchDriverAssignedRides(driverId: number): Promise<RideWithRelations[]> {
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
                    eq(rides.driverId, driverId),
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

        return ridesWithCustomers;
    }

    /**
     * Fetches all pending rides (not assigned to any driver)
     */
    static async fetchPendingRides(): Promise<RideWithRelations[]> {
        const pendingRides = await db.query.rides.findMany({
            where: eq(rides.status, 'pending'),
            orderBy: [desc(rides.departureTime)],
            with: {
                driver: true,
                rideCustomers: {
                    with: {
                        customer: true
                    }
                }
            }
        });

        return pendingRides.map((ride: RideWithCustomers) => ({
            ...ride,
            customers: ride.rideCustomers.map((rc: RideWithCustomers['rideCustomers'][0]) => ({
                id: rc.customer.id,
                name: rc.customer.name || rc.customer.email,
                email: rc.customer.email
            }))
        })) as unknown as RideWithRelations[];
    }

    /**
     * Fetches all rides for a customer
     */
    static async fetchCustomerRides(customerId: string): Promise<RideWithRelations[]> {
        const customerRides = await db
            .select({
                ride: rides,
                driver: users,
            })
            .from(rideCustomers)
            .innerJoin(rides, eq(rides.id, rideCustomers.rideId))
            .leftJoin(drivers, eq(rides.driverId, drivers.id))
            .leftJoin(users, eq(drivers.userId, users.id))
            .where(eq(rideCustomers.customerId, customerId))
            .orderBy(desc(rides.departureTime));

        const ridesWithCustomers: RideWithRelations[] = customerRides.map(({ride, driver}) => ({
            ...ride,
            waitingTime: ride.waitingTime || 0,
            options: [],
            driver: driver || undefined,
            customers: [],
            selectedOptions: [],
        }));

        return ridesWithCustomers;
    }
}
