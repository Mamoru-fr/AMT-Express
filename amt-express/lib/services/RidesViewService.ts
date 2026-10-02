import db from "@/lib/db/drizzle";
import { rides, users, drivers, rideCustomers } from "@/lib/db/schema";
import { eq, and, desc, inArray, count, or, sql } from "drizzle-orm";
import { RideWithRelations } from "@/content/database_types/ride";

/**
 * Optimized RidesViewService with N+1 query fixes
 * Uses Drizzle's `with:` clause to load relationships in single queries
 */
export class RidesViewService {
  /**
   * Get driver record from userId
   */
  static async getDriverForUser(userId: string) {
    return db.query.drivers.findFirst({
      where: eq(drivers.userId, userId),
    });
  }

  /**
   * Fetches completed and pending rides count for a driver
   * OPTIMIZED: Single query with CASE WHEN for both counts
   */
  static async fetchDriverRidesCount(driverId: string): Promise<{ completed: number; pending: number }> {
    const countResults = await db
      .select({
        completed: sql<number>`SUM(CASE WHEN ${rides.status} = 'completed' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${rides.status} = 'pending' THEN 1 ELSE 0 END)`,
      })
      .from(rides)
      .where(eq(rides.driverId, driverId));

    return {
      completed: countResults[0]?.completed || 0,
      pending: countResults[0]?.pending || 0,
    };
  }

  /**
   * Fetches all completed rides for a specific driver
   * FIXED: Uses Drizzle relations with `with:` for single query
   */
  static async fetchDriverCompletedRides(driverId: string): Promise<RideWithRelations[]> {
    const driverRides = await db.query.rides.findMany({
      where: and(
        eq(rides.driverId, driverId),
        eq(rides.status, 'completed')
      ),
      orderBy: desc(rides.departureTime),
      with: {
        driver: {
          with: {
            user: true
          }
        },
        rideCustomers: {
          with: {
            customer: true
          }
        }
      }
    });

    return driverRides.map((ride: any) => ({
      ...ride,
      waitingTime: ride.waitingTime || 0,
      options: [],
      driver: ride.driver?.user || undefined,
      customers: ride.rideCustomers?.map((rc: any) => rc.customer) || [],
      selectedOptions: [],
    })) as RideWithRelations[];
  }

  /**
   * Fetches all rides assigned to the current driver (not completed)
   * FIXED: Uses Drizzle relations with `with:` for single query
   */
  static async fetchDriverAssignedRides(driverId: string): Promise<RideWithRelations[]> {
    const driverRides = await db.query.rides.findMany({
      where: and(
        eq(rides.driverId, driverId),
        inArray(rides.status, ['assigned'])
      ),
      orderBy: desc(rides.departureTime),
      with: {
        driver: {
          with: {
            user: true
          }
        },
        rideCustomers: {
          with: {
            customer: true
          }
        }
      }
    });

    return driverRides.map((ride: any) => ({
      ...ride,
      waitingTime: ride.waitingTime || 0,
      options: [],
      driver: ride.driver?.user || undefined,
      customers: ride.rideCustomers?.map((rc: any) => rc.customer) || [],
      selectedOptions: [],
    })) as RideWithRelations[];
  }

  /**
   * Fetches all pending rides (not assigned to any driver)
   * ALREADY OPTIMIZED: Uses with: clause
   */
  static async fetchPendingRides(): Promise<RideWithRelations[]> {
    const pendingRides = await db.query.rides.findMany({
      where: eq(rides.status, 'pending'),
      orderBy: [desc(rides.departureTime)],
      with: {
        driver: {
          with: {
            user: true
          }
        },
        rideCustomers: {
          with: {
            customer: true
          }
        }
      }
    });

    return pendingRides.map((ride: any) => ({
      ...ride,
      customers: ride.rideCustomers?.map((rc: any) => ({
        id: rc.customer?.id,
        name: rc.customer?.name || rc.customer?.email,
        email: rc.customer?.email
      })) || [],
      waitingTime: ride.waitingTime || 0,
    })) as RideWithRelations[];
  }

  /**
   * Fetches all rides for a customer
   * OPTIMIZED: orderBy moved to ride relation, removed redundant rideCustomers loading
   */
  static async fetchCustomerRides(customerId: string): Promise<RideWithRelations[]> {
    const customerRides = await db.query.rideCustomers.findMany({
      where: eq(rideCustomers.customerId, customerId),
      with: {
        ride: {
          with: {
            driver: {
              with: {
                user: true
              }
            }
          },
          orderBy: desc(rides.departureTime),
        }
      }
    });

    return customerRides.map((rc: any) => ({
      ...rc.ride,
      waitingTime: rc.ride.waitingTime || 0,
      options: [],
      driver: rc.ride.driver?.user || undefined,
      customers: [rc.customer],
      selectedOptions: [],
    })) as RideWithRelations[];
  }

  /**
   * Fetches completed/cancelled rides for a customer
   * OPTIMIZED: Filters on ride.status directly in SQL (no in-memory filtering)
   */
  static async fetchCustomerCompletedRides(customerId: string): Promise<RideWithRelations[]> {
    const customerRides = await db.query.rideCustomers.findMany({
      where: eq(rideCustomers.customerId, customerId),
      with: {
        ride: {
          where: inArray(rides.status, ['completed', 'cancelled']),
          with: {
            driver: {
              with: {
                user: true
              }
            }
          },
          orderBy: desc(rides.departureTime),
        }
      }
    });

    return customerRides.map(({ ride }: any) => ({
      ...ride,
      waitingTime: ride.waitingTime || 0,
      options: [],
      driver: ride.driver?.user || undefined,
      customers: [],
      selectedOptions: [],
    })) as RideWithRelations[];
  }

  /**
   * Fetches pending/assigned rides for a customer
   * OPTIMIZED: Filters on ride.status directly in SQL (no in-memory filtering)
   */
  static async fetchCustomerPendingRides(customerId: string): Promise<RideWithRelations[]> {
    const customerRides = await db.query.rideCustomers.findMany({
      where: eq(rideCustomers.customerId, customerId),
      with: {
        ride: {
          where: inArray(rides.status, ['pending', 'assigned']),
          with: {
            driver: {
              with: {
                user: true
              }
            }
          },
          orderBy: desc(rides.departureTime),
        }
      }
    });

    return customerRides.map(({ ride }: any) => ({
      ...ride,
      waitingTime: ride.waitingTime || 0,
      options: [],
      driver: ride.driver?.user || undefined,
      customers: [],
      selectedOptions: [],
    })) as RideWithRelations[];
  }

  /**
   * Fetches a single ride by ID with all relations
   * FIXED: Uses Drizzle relations with `with:` for single query
   */
  static async getRideById(rideId: string): Promise<RideWithRelations | null> {
    const result = await db.query.rides.findFirst({
      where: eq(rides.id, rideId),
      with: {
        driver: {
          with: {
            user: true
          }
        },
        rideCustomers: {
          with: {
            customer: true
          }
        }
      }
    });

    if (!result) return null;

    return {
      ...result,
      waitingTime: result.waitingTime || 0,
      options: [],
      driver: result.driver?.user || undefined,
      customers: result.rideCustomers?.map((rc: any) => rc.customer) || [],
      selectedOptions: [],
    } as unknown as RideWithRelations;
  }
}

export default RidesViewService;
