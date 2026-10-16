/**
 * Request-Level Caching for Frequently Used Queries
 * 
 * Uses in-memory Map for caching query results within a single request/render cycle
 * This prevents duplicate database queries for the same data in the same operation
 */

import db from '@/lib/db/drizzle';
import { users, rides, drivers, rideCustomers } from '@/lib/db/schema';
import { eq, and, or, sql, desc } from 'drizzle-orm';

// Type for cache entries
interface CacheEntry<T> {
  promise: Promise<T>;
  timestamp: number;
}

/**
 * Request-scoped cache for database query results
 * This cache lives for the duration of a single HTTP request
 */
class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private static instance: RequestCache | null = null;

  private constructor() {}

  /**
   * Get the singleton instance for the current request
   */
  public static getInstance(): RequestCache {
    if (!RequestCache.instance) {
      RequestCache.instance = new RequestCache();
    }
    return RequestCache.instance;
  }

  /**
   * Get a cached value or execute the query
   * @param key - Unique cache key
   * @param queryFn - Function to execute if not cached
   * @param ttl - Time to live in milliseconds (default: 5000ms)
   */
  public async getOrSet<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 5000
  ): Promise<T> {
    const existing = this.cache.get(key);
    
    // If we have a cached entry that's still fresh, return it
    if (existing && (Date.now() - existing.timestamp < ttl)) {
      return existing.promise;
    }

    // Create new entry
    const promise = queryFn();
    this.cache.set(key, { promise, timestamp: Date.now() });
    
    // Clean up after TTL expires
    setTimeout(() => this.cache.delete(key), ttl);
    
    return promise;
  }

  /**
   * Invalidate a specific cache entry
   */
  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached entries
   */
  public clearAll(): void {
    this.cache.clear();
  }

  /**
   * Clear the singleton instance (call this at the end of each request)
   */
  public static clearInstance(): void {
    if (RequestCache.instance) {
      RequestCache.instance.clearAll();
      RequestCache.instance = null;
    }
  }
}

/**
 * Helper functions for common cached queries
 */

/**
 * Get all available drivers (not assigned to a ride)
 * CACHED: Results are cached for the duration of the request
 */
export async function getAvailableDrivers(): Promise<Array<{
  id: string;
  name: string;
  email: string;
}>> {
  const cache = RequestCache.getInstance();
  const cacheKey = 'available-drivers-all';

  return cache.getOrSet(cacheKey, async () => {
    return db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .innerJoin(drivers, eq(users.id, drivers.userId))
      .where(and(
        eq(users.role, 'driver'),
        eq(drivers.available, true)
      ));
  }, 10000); // 10 second TTL
}

/**
 * Get pending rides count for a driver
 * CACHED: Results are cached per driver for the duration of the request
 */
export async function getDriverPendingRidesCount(driverId: string): Promise<number> {
  const cache = RequestCache.getInstance();
  const cacheKey = `pending-rides-count-driver-${driverId}`;

  return cache.getOrSet(cacheKey, async () => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(rides)
      .where(and(
        eq(rides.driverId, driverId),
        eq(rides.status, 'pending')
      ));
    return Number(result[0]?.count || 0);
  }, 5000); // 5 second TTL
}

/**
 * Get rides by status for a specific driver
 * CACHED: Results are cached per driver and status for the duration of the request
 */
export async function getRidesByDriverAndStatus(
  driverId: string,
  status: 'pending' | 'assigned' | 'completed' | 'cancelled'
): Promise<Array<typeof rides.$inferSelect>> {
  const cache = RequestCache.getInstance();
  const cacheKey = `rides-driver-${driverId}-status-${status}`;

  return cache.getOrSet(cacheKey, async () => {
    return db
      .select()
      .from(rides)
      .where(and(
        eq(rides.driverId, driverId),
        eq(rides.status, status as any)
      ))
      .orderBy(desc(rides.departureTime));
  }, 5000); // 5 second TTL
}

/**
 * Clean up the request cache (should be called at the end of each request)
 */
export function cleanupRequestCache(): void {
  RequestCache.clearInstance();
}

// Export the cache instance for advanced usage
export { RequestCache };
