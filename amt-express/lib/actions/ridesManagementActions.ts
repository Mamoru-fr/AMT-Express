'use server'

/**
 * Server actions for ride management board
 * This file handles all CRUD operations for rides including:
 * - Fetching and filtering rides with pagination
 * - Creating, updating, and deleting rides
 * - Assigning drivers and managing ride status
 * - Exporting ride data to CSV
 */

import db from "@/lib/db/drizzle";
import {rides, users, rideCustomers} from "@/lib/db/schema";
import {eq, sql, desc, asc, and, or, ilike} from "drizzle-orm";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";
import {auth} from "@/lib/auth/auth";
import {ActionResponse, ErrorCodes} from "@/lib/types/action-response";
import {
    CreateRideSchema,
    UpdateRideDetailsSchema,
    AssignDriverSchema,
    RideIdSchema,
    RideFiltersSchema
} from "@/lib/validations/ride";
import {z} from "zod";
import {getSessionWithRole} from "../auth/session";

// Filter options for querying rides
export interface RideFilters {
    search?: string;          // Search in ID, departure, or destination
    status?: RideStatus | 'all';  // Filter by ride status or show all
    sortBy?: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status';  // Column to sort by
    sortOrder?: 'asc' | 'desc';   // Sort direction
    page?: number;            // Page number for pagination (1-indexed)
    limit?: number;           // Number of rides per page
}

// Response structure for paginated ride data
export interface RidesManagementData {
    rides: RideWithRelations[];  // Array of rides with driver and customer relations
    total: number;               // Total count of rides matching filters
    page: number;                // Current page number
    totalPages: number;          // Total number of pages
}

/**
 * Fetches rides for the management board with filtering, sorting, and pagination
 * This is the main function for the ride management table
 * 
 * @param filters - Optional filters for search, status, sorting, and pagination
 * @returns Paginated ride data with total count and page information
 */
export async function fetchRidesForManagement(filters: RideFilters = {}): Promise<ActionResponse<RidesManagementData>> {
    try {
        // Validate session
        const {session, isAdmin} = await getSessionWithRole();

        if (!session || !isAdmin) {
            return {
                success: false,
                error: 'Unauthorized: Admin access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Validate input
        const validatedFilters = RideFiltersSchema.parse(filters);
        // Extract filter parameters with defaults
        const {
            search = '',
            status = 'all',
            sortBy = 'departureTime',
            sortOrder = 'desc',
            page = 1,
            limit = 50
        } = validatedFilters;

        // === BUILD WHERE CONDITIONS ===
        const conditions = [];

        // Apply status filter (skip if 'all' is selected)
        if (status && status !== 'all') {
            conditions.push(eq(rides.status, status));
        }

        // Apply search filter across multiple columns
        // Searches in: ride ID (converted to text), departure location, destination
        // Uses case-insensitive ILIKE for partial matching
        if (search) {
            const searchLower = search.toLowerCase();
            conditions.push(
                or(
                    sql`CAST(${rides.id} AS TEXT) ILIKE ${`%${searchLower}%`}`,
                    ilike(rides.departure, `%${searchLower}%`),
                    ilike(rides.destination, `%${searchLower}%`)
                )
            );
        }

        // === GET TOTAL COUNT ===
        // Count total rides matching the filters (for pagination)
        const countResult = await db
            .select({count: sql<number>`count(*)`})
            .from(rides)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = Number(countResult[0]?.count || 0);
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;  // Calculate offset for SQL LIMIT/OFFSET

        // === DETERMINE SORT COLUMN ===
        // Note: 'clients' and 'driver' sorting requires in-memory sorting
        // because they come from joined tables (not directly available in rides table)
        const sortInMemory = sortBy === 'clients' || sortBy === 'driver';
        
        // Map sortBy parameter to actual database column
        // Defaults to departureTime if sortBy is not recognized or is in-memory
        const sortColumn = !sortInMemory ? ({
            departureTime: rides.departureTime,
            departure: rides.departure,
            destination: rides.destination,
            price: rides.price,
            status: rides.status
        }[sortBy] || rides.departureTime) : rides.departureTime;

        // === FETCH RIDES WITH DRIVER INFO ===
        // Left join with users table to get driver information
        // Apply all filters, sorting, and pagination
        const ridesData = await db
            .select({
                ride: rides,
                driver: users,
            })
            .from(rides)
            .leftJoin(users, eq(rides.driverId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
            .limit(limit)
            .offset(offset);

        // === FETCH CUSTOMER DATA FOR EACH RIDE ===
        // For each ride, query the many-to-many rideCustomers table
        // to get all associated customers (a ride can have multiple customers)
        let ridesWithCustomers: RideWithRelations[] = await Promise.all(
            ridesData.map(async (row) => {
                const customers = await db
                    .select({customer: users})
                    .from(rideCustomers)
                    .innerJoin(users, eq(rideCustomers.customerId, users.id))
                    .where(eq(rideCustomers.rideId, row.ride.id));

                // Transform database row into RideWithRelations type
                // Convert numeric fields to strings where needed for UI compatibility
                return {
                    ...row.ride,
                    driver: row.driver || null,
                    customers: customers.map(c => c.customer),
                    selectedOptions: [],
                    price: row.ride.price.toString(),  // Convert to string for display
                    distanceKm: row.ride.distanceKm?.toString() || null,
                    waitingTime: row.ride.waitingTime ?? 0,
                    options: row.ride.options ?? [],
                };
            })
        );

        // === IN-MEMORY SORTING ===
        // Handle sorting for columns that can't be sorted in SQL
        // (clients and driver require joined data)
        if (sortInMemory) {
            ridesWithCustomers.sort((a, b) => {
                let compareValue = 0;
                
                if (sortBy === 'clients') {
                    // Join all customer names and compare alphabetically
                    const aClients = a.customers.map(c => c.name).join(', ').toLowerCase();
                    const bClients = b.customers.map(c => c.name).join(', ').toLowerCase();
                    compareValue = aClients.localeCompare(bClients);
                } else if (sortBy === 'driver') {
                    // Compare driver names (empty string if no driver)
                    const aDriver = a.driver?.name?.toLowerCase() || '';
                    const bDriver = b.driver?.name?.toLowerCase() || '';
                    compareValue = aDriver.localeCompare(bDriver);
                }
                
                // Apply sort direction (reverse for descending)
                return sortOrder === 'asc' ? compareValue : -compareValue;
            });
        }

        return {
            success: true,
            data: {
                rides: ridesWithCustomers,
                total,
                page,
                totalPages
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
        console.error('Error fetching rides:', error);
        return {
            success: false,
            error: 'Failed to fetch rides',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Updates specific fields of a ride
 * Only provided fields will be updated, others remain unchanged
 * 
 * @param rideId - ID of the ride to update
 * @param data - Object containing fields to update (all optional)
 */
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
    try {
        // Validate session
        const {session, isAdmin} = await getSessionWithRole();

        if (!session || !isAdmin) {
            return {
                success: false,
                error: 'Unauthorized: Admin access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Validate input
        const validatedData = UpdateRideDetailsSchema.parse({rideId, ...data});
        // Build update object only with provided fields (partial update)
        const updateData: any = {};

        if (data.departure) updateData.departure = data.departure;
        if (data.destination) updateData.destination = data.destination;
        if (data.departureTime) updateData.departureTime = data.departureTime;
        if (data.price) updateData.price = data.price;
        if (data.status) updateData.status = data.status;
        if (data.customerNotes !== undefined) updateData.customerNotes = data.customerNotes;

        await db
            .update(rides)
            .set(updateData)
            .where(eq(rides.id, rideId));

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
        console.error('Error updating ride:', error);
        return {
            success: false,
            error: 'Failed to update ride',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Assigns a driver to a ride and updates its status
 * Automatically changes ride status to 'assigned'
 * 
 * @param rideId - ID of the ride
 * @param driverId - ID of the driver to assign
 */
export async function assignDriverToRide(rideId: number, driverId: string): Promise<ActionResponse<void>> {
    try {
        // Validate session
        const {session, isAdmin} = await getSessionWithRole();

        if (!session || !isAdmin) {
            return {
                success: false,
                error: 'Unauthorized: Admin access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Validate input
        const validatedData = AssignDriverSchema.parse({rideId, driverId});

        // Check if ride exists and is available
        const ride = await db.query.rides.findFirst({
            where: (rides, {eq}) => eq(rides.id, validatedData.rideId),
        });

        if (!ride) {
            return {
                success: false,
                error: 'Ride not found',
                code: ErrorCodes.RIDE_NOT_FOUND
            };
        }

        if (ride.status !== 'pending') {
            return {
                success: false,
                error: 'Ride is not available for assignment',
                code: ErrorCodes.RIDE_NOT_AVAILABLE
            };
        }

        await db
            .update(rides)
            .set({
                driverId: validatedData.driverId,
                status: 'assigned'  // Automatically update status when driver is assigned
            })
            .where(eq(rides.id, validatedData.rideId));

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
        console.error('Error assigning driver:', error);
        return {
            success: false,
            error: 'Failed to assign driver',
            code: ErrorCodes.ASSIGNMENT_ERROR
        };
    }
}

/**
 * Cancels a ride by updating its status to 'cancelled'
 * Does not delete the ride from the database
 * 
 * @param rideId - ID of the ride to cancel
 */
export async function cancelRide(rideId: number): Promise<ActionResponse<void>> {
    try {
        // Validate session
        const {session} = await getSessionWithRole();

        if (!session) {
            return {
                success: false,
                error: 'Unauthorized',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Validate input
        const validatedData = RideIdSchema.parse({rideId});

        await db
            .update(rides)
            .set({
                status: 'cancelled'
            })
            .where(eq(rides.id, validatedData.rideId));

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
        console.error('Error cancelling ride:', error);
        return {
            success: false,
            error: 'Failed to cancel ride',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Permanently deletes a ride and all associated data
 * Cascades deletion to rideCustomers table to maintain referential integrity
 * 
 * @param rideId - ID of the ride to delete
 */
export async function deleteRide(rideId: number): Promise<ActionResponse<void>> {
    try {
        // Validate session
        const {session, isAdmin} = await getSessionWithRole();


        if (!session || !isAdmin) {
            return {
                success: false,
                error: 'Unauthorized: Admin access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Validate input
        const validatedData = RideIdSchema.parse({rideId});

        // Delete associated ride-customer relationships first (foreign key constraint)
        await db
            .delete(rideCustomers)
            .where(eq(rideCustomers.rideId, validatedData.rideId));

        // Then delete the ride itself
        await db
            .delete(rides)
            .where(eq(rides.id, validatedData.rideId));

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
        console.error('Error deleting ride:', error);
        return {
            success: false,
            error: 'Failed to delete ride',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Fetches all users with 'driver' role
 * Used to populate driver selection dropdowns
 * 
 * @returns Array of driver objects with id, name, and email
 */
export async function fetchAvailableDrivers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
    try {
        // Validate session
        const {session, isAdmin} = await getSessionWithRole();

        if (!session || !isAdmin) {
            return {
                success: false,
                error: 'Unauthorized: Admin access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        const drivers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email
            })
            .from(users)
            .where(eq(users.role, 'driver'));

        return {success: true, data: drivers};
    } catch (error) {
        console.error('Error fetching drivers:', error);
        return {
            success: false,
            error: 'Failed to fetch drivers',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Exports rides to CSV format based on current filters
 * Returns CSV string that can be downloaded by the client
 * 
 * @param filters - Same filters as fetchRidesForManagement (search, status, etc.)
 * @returns CSV string with ride data
 */
export async function exportRidesToCSV(filters: RideFilters = {}): Promise<ActionResponse<string>> {
    try {
        // Validate session
        const {session, isAdmin} = await getSessionWithRole();

        if (!session || !isAdmin) {
            return {
                success: false,
                error: 'Unauthorized: Admin access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Fetch all matching rides (up to 10,000 for export)
        // Uses same filters as the main table view
        const result = await fetchRidesForManagement({
            ...filters,
            limit: 10000, // Max export limit to prevent memory issues
            page: 1
        });

        if (!result.success) {
            return result;
        }

        const {rides: ridesData} = result.data;

        // === BUILD CSV CONTENT ===
        const headers = [
            'ID',
            'Departure',
            'Destination',
            'Client(s)',
            'Driver',
            'Departure Time',
            'Price (€)',
            'Status'
        ];

        // Transform each ride into a CSV row
        const rows = ridesData.map(ride => [
            ride.id.toString(),
            ride.departure,
            ride.destination,
            ride.customers.map(c => c.name).join(', '),  // Multiple customers joined by comma
            ride.driver?.name || 'Unassigned',
            new Date(ride.departureTime).toLocaleString('fr-FR'),  // French locale format
            ride.price,
            ride.status
        ]);

        // Build CSV string: headers + rows with quoted cells (to handle commas in data)
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))  // Wrap each cell in quotes
        ].join('\n');

        return {success: true, data: csvContent};
    } catch (error) {
        console.error('Error exporting CSV:', error);
        return {
            success: false,
            error: 'Failed to export CSV',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Creates a new ride and associates it with customers
 * Handles the many-to-many relationship in the rideCustomers table
 * 
 * @param data - Ride data including required and optional fields
 * @returns ID of the newly created ride
 */
export async function createRide(data: {
    departureTime: Date;
    customerIds: string[];
    departure: string;
    destination: string;
    driverId?: string;
    price?: string;
    status?: RideStatus;
}): Promise<ActionResponse<number>> {
    try {
        // Validate session
        const {session, isAdmin} = await getSessionWithRole();

        if (!session || !isAdmin) {
            return {
                success: false,
                error: 'Unauthorized: Admin access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        // Validate input
        const validatedData = CreateRideSchema.parse(data);
        const {departureTime, customerIds, departure, destination, driverId, price, status} = validatedData;

        // === CREATE RIDE ===
        const [newRide] = await db
            .insert(rides)
            .values({
                departure,
                destination,
                departureTime,
                price: price || '0',
                status: status || 'pending',
                driverId: driverId || null,
            })
            .returning({id: rides.id});

        // === ASSOCIATE CUSTOMERS ===
        // Create entries in the rideCustomers junction table
        // This enables the many-to-many relationship (one ride can have multiple customers)
        if (customerIds.length > 0) {
            await db.insert(rideCustomers).values(
                customerIds.map(customerId => ({
                    rideId: newRide.id,
                    customerId,
                }))
            );
        }

        return {success: true, data: newRide.id};  // Return new ride ID for confirmation/redirect
    } catch (error) {
        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: 'Validation failed',
                code: ErrorCodes.VALIDATION_ERROR,
                details: error.flatten()
            };
        }
        console.error('Error creating ride:', error);
        return {
            success: false,
            error: 'Failed to create ride',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}

/**
 * Fetches all users with 'customer' role
 * Used to populate customer selection when creating/editing rides
 * 
 * @returns Array of customer objects with id, name, and email
 */
export async function fetchAllCustomers(): Promise<ActionResponse<Array<{id: string, name: string, email: string}>>> {
    try {
        // Validate session
        const {session, isAdmin} = await getSessionWithRole();

        if (!session || !isAdmin) {
            return {
                success: false,
                error: 'Unauthorized: Admin access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }

        const customers = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email
            })
            .from(users)
            .where(eq(users.role, 'customer'));

        return {success: true, data: customers};
    } catch (error) {
        console.error('Error fetching customers:', error);
        return {
            success: false,
            error: 'Failed to fetch customers',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}
