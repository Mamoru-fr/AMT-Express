import db from "@/lib/db/drizzle";
import {rides, users, drivers, rideCustomers, productions, projects, assignmentRequests} from "@/lib/db/schema";
import {eq, sql, desc, asc, and, or, ilike, ne} from "drizzle-orm";
import {RideStatus, RideWithRelations} from "@/content/database_types/ride";

export interface RideFilters {
    search?: string;
    status?: RideStatus | 'all' | RideStatus[];
    sortBy?: 'departureTime' | 'clients' | 'departure' | 'destination' | 'driver' | 'price' | 'status';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface RidesManagementData {
    rides: RideWithRelations[];
    total: number;
    page: number;
    totalPages: number;
}

export class RidesManagementService {
    /**
     * Fetches rides for the management board with filtering, sorting, and pagination
     */
    static async getRidesForManagement(filters: RideFilters = {}): Promise<RidesManagementData> {
        const {
            search = '',
            status = 'all',
            sortBy = 'departureTime',
            sortOrder = 'desc',
            page = 1,
            limit = 50
        } = filters;

        // === BUILD WHERE CONDITIONS ===
        const conditions = [];

        if (status && status !== 'all') {
            if (Array.isArray(status)) {
                if (status.length > 0) {
                    conditions.push(sql`${rides.status} = ANY(${status})`);
                }
            } else {
                conditions.push(eq(rides.status, status));
            }
        }

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
        const countResult = await db
            .select({count: sql<number>`count(*)`})
            .from(rides)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = Number(countResult[0]?.count || 0);
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        // === DETERMINE SORT COLUMN ===
        const sortInMemory = sortBy === 'clients' || sortBy === 'driver';
        
        const sortColumn = !sortInMemory ? ({
            departureTime: rides.departureTime,
            departure: rides.departure,
            destination: rides.destination,
            price: rides.price,
            status: rides.status
        }[sortBy] || rides.departureTime) : rides.departureTime;

        // === FETCH RIDES WITH DRIVER INFO ===
        const ridesData = await db
            .select({
                ride: rides,
                driver: users,
            })
            .from(rides)
            .leftJoin(drivers, eq(rides.driverId, drivers.id))
            .leftJoin(users, eq(drivers.userId, users.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn))
            .limit(limit)
            .offset(offset);

        // === FETCH ALL CUSTOMERS FOR ALL RIDES IN A SINGLE QUERY ===
        // Get all ride IDs from the current result set
        const rideIds = ridesData.map(row => row.ride.id);
        
        // Fetch all ride-customer relationships in one query
        const customersResult = await db
            .select({
                rideId: rideCustomers.rideId,
                customer: users
            })
            .from(rideCustomers)
            .innerJoin(users, eq(rideCustomers.customerId, users.id))
            .where(rideIds.length > 0 ? or(...rideIds.map(id => eq(rideCustomers.rideId, id))) : undefined);

        // === GROUP CUSTOMERS BY RIDE ID ===
        const customersByRideId = new Map<string, typeof users.$inferSelect[]>();
        customersResult.forEach(row => {
            if (!customersByRideId.has(row.rideId)) {
                customersByRideId.set(row.rideId, []);
            }
            customersByRideId.get(row.rideId)?.push(row.customer);
        });

        // === PARSE AND FORMAT RESULTS ===
        const ridesWithCustomers: RideWithRelations[] = ridesData.map((row) => ({
            ...row.ride,
            driver: row.driver || null,
            customers: customersByRideId.get(row.ride.id) || [],
            selectedOptions: [],
            price: row.ride.price?.toString() || '0',
            distanceKm: row.ride.distanceKm?.toString() || null,
            waitingTime: row.ride.waitingTime ?? 0,
            options: [],
        }));

        // === IN-MEMORY SORTING ===
        if (sortInMemory) {
            ridesWithCustomers.sort((a, b) => {
                let compareValue = 0;
                
                if (sortBy === 'clients') {
                    const aClients = a.customers.map(c => c.name).join(', ').toLowerCase();
                    const bClients = b.customers.map(c => c.name).join(', ').toLowerCase();
                    compareValue = aClients.localeCompare(bClients);
                } else if (sortBy === 'driver') {
                    const aDriver = a.driver?.name?.toLowerCase() || '';
                    const bDriver = b.driver?.name?.toLowerCase() || '';
                    compareValue = aDriver.localeCompare(bDriver);
                }
                
                return sortOrder === 'asc' ? compareValue : -compareValue;
            });
        }

        return {
            rides: ridesWithCustomers,
            total,
            page,
            totalPages
        };
    }

    /**
     * Updates specific fields of a ride
     */
    static async updateRideDetails(
        rideId: string,
        data: {
            departure?: string;
            destination?: string;
            departureTime?: Date;
            price?: string;
            status?: RideStatus;
            customerNotes?: string;
        }
    ): Promise<void> {
        const updateData: Record<string, unknown> = {};

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
    }

    /**
     * Assigns a driver to a ride and updates its status
     */
    static async assignDriverToRide(rideId: string, driverUserId: string): Promise<void> {
        // Check if ride exists and is available
        const ride = await db.query.rides.findFirst({
            where: (rides, {eq}) => eq(rides.id, rideId),
        });

        if (!ride) {
            throw new Error('Ride not found');
        }

        if (ride.status !== 'pending') {
            throw new Error('Ride is not available for assignment');
        }
        
        // Convert userId to drivers.id
        const driver = await db.query.drivers.findFirst({
            where: eq(drivers.userId, driverUserId)
        });
        
        if (!driver) {
            throw new Error('Driver not found');
        }

        await db
            .update(rides)
            .set({
                driverId: driver.id,
                status: 'assigned'
            })
            .where(eq(rides.id, rideId));
    }

    /**
     * Assigns a customer to a ride and updates its status
     * Used when a customer books an available ride
     */
    static async assignCustomerToRide(rideId: string, customerId: string): Promise<void> {
        // Check if ride exists and is available for booking
        const ride = await db.query.rides.findFirst({
            where: (rides, {eq}) => eq(rides.id, rideId),
        });

        if (!ride) {
            throw new Error('Ride not found');
        }

        if (ride.status !== 'pending') {
            throw new Error('Ride is not available for booking');
        }
        
        // Check if customer already exists
        const customer = await db.query.users.findFirst({
            where: eq(users.id, customerId)
        });
        
        if (!customer) {
            throw new Error('Customer not found');
        }

        // Check if customer is already assigned to this ride
        const existingAssignment = await db.query.rideCustomers.findFirst({
            where: and(
                eq(rideCustomers.rideId, rideId),
                eq(rideCustomers.customerId, customerId)
            )
        });
        
        if (existingAssignment) {
            throw new Error('Customer already assigned to this ride');
        }

        // Start transaction
        // First, assign customer to the ride
        await db.insert(rideCustomers).values({
            rideId,
            customerId
        });

        // Then update the ride status to assigned
        await db
            .update(rides)
            .set({
                status: 'assigned'
            })
            .where(eq(rides.id, rideId));
    }

    /**
     * Cancels a ride by updating its status to 'cancelled'
     */
    static async cancelRide(rideId: string): Promise<void> {
        await db
            .update(rides)
            .set({ status: 'cancelled' })
            .where(eq(rides.id, rideId));
    }

    /**
     * Permanently deletes a ride and all associated data
     */
    static async deleteRide(rideId: string): Promise<void> {
        // Delete associated ride-customer relationships first
        await db
            .delete(rideCustomers)
            .where(eq(rideCustomers.rideId, rideId));

        // Then delete the ride itself
        await db
            .delete(rides)
            .where(eq(rides.id, rideId));
    }

    /**
     * Fetches all users with 'driver' role
     */
    static async getAvailableDrivers(): Promise<Array<{id: string, name: string, email: string}>> {
        return db
            .select({
                id: users.id,
                name: users.name,
                email: users.email
            })
            .from(users)
            .where(eq(users.role, 'driver'));
    }

    /**
     * Exports rides to CSV format based on current filters
     */
    static async exportRidesToCSV(filters: RideFilters = {}): Promise<string> {
        const result = await this.getRidesForManagement({
            ...filters,
            limit: 10000,
            page: 1
        });

        const ridesData = result.rides;

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

        const rows = ridesData.map(ride => [
            ride.id.toString(),
            ride.departure,
            ride.destination,
            ride.customers.map(c => c.name).join(', '),
            ride.driver?.name || 'Unassigned',
            new Date(ride.departureTime).toLocaleString('fr-FR'),
            ride.price,
            ride.status
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Creates a new ride and associates it with customers
     */
    static async createRide(data: {
        departureTime: Date;
        customerIds: string[];
        departure: string;
        destination: string;
        driverId?: string;
        price?: string;
        driverPrice?: string;
        status?: RideStatus;
        customerNotes?: string;
    }): Promise<string> {
        const {departureTime, customerIds, departure, destination, driverId: driverUserId, price, driverPrice, status, customerNotes} = data;

        // If driverId provided, convert from userId to drivers.id
        let driverId: string | null = null;
        if (driverUserId) {
            const driver = await db.query.drivers.findFirst({
                where: eq(drivers.userId, driverUserId)
            });
            driverId = driver?.id ?? null;
        }

        const [newRide] = await db
            .insert(rides)
            .values({
                departure,
                destination,
                departureTime,
                price: price || '0',
                driverPrice: driverPrice || '0',
                status: status || 'pending',
                driverId: driverId,
                customerNotes: customerNotes || null,
            })
            .returning();

        // Associate customers
        if (customerIds.length > 0) {
            await db.insert(rideCustomers).values(
                customerIds.map(customerId => ({
                    rideId: newRide.id,
                    customerId,
                }))
            );
        }

        return newRide.id;
    }

    /**
     * Fetches all users with 'customer' role
     */
    static async getAllCustomers(): Promise<Array<{id: string, name: string, email: string}>> {
        return db
            .select({
                id: users.id,
                name: users.name,
                email: users.email
            })
            .from(users)
            .where(eq(users.role, 'customer'));
    }

    /**
     * Fetches all productions
     */
    static async getAllProductions(): Promise<Array<{id: string, name: string}>> {
        return db
            .select({
                id: productions.id,
                name: productions.name
            })
            .from(productions)
            .orderBy(asc(productions.name));
    }

    /**
     * Fetches all projects
     */
    static async getAllProjects(): Promise<Array<{id: string, name: string, productionId: string | null}>> {
        return db
            .select({
                id: projects.id,
                name: projects.name,
                productionId: projects.productionId
            })
            .from(projects)
            .orderBy(asc(projects.name));
    }

    static async getAssignmentRequestsForRide(rideId: string): Promise<AssignmentRequestWithDriver[]> {
        const rows = await db
            .select({
                requestId: assignmentRequests.id,
                status: assignmentRequests.status,
                requestedAt: assignmentRequests.requestedAt,
                driverId: assignmentRequests.driverId,
                driverName: users.name,
                driverEmail: users.email,
            })
            .from(assignmentRequests)
            .innerJoin(drivers, eq(assignmentRequests.driverId, drivers.id))
            .innerJoin(users, eq(drivers.userId, users.id))
            .where(eq(assignmentRequests.rideId, rideId))
            .orderBy(asc(assignmentRequests.requestedAt));

        return rows;
    }

    static async approveAssignmentRequest(requestId: string): Promise<void> {
        const request = await db.query.assignmentRequests.findFirst({
            where: eq(assignmentRequests.id, requestId),
        });
        if (!request) throw new Error('Assignment request not found');
        if (request.status !== 'pending') throw new Error('Request is no longer pending');

        const ride = await db.query.rides.findFirst({
            where: eq(rides.id, request.rideId),
        });
        if (!ride) throw new Error('Ride not found');
        if (ride.status !== 'pending') throw new Error('Ride is no longer available for assignment');

        // Assign the driver and mark ride as assigned
        await db.update(rides)
            .set({ driverId: request.driverId, status: 'assigned' })
            .where(eq(rides.id, request.rideId));

        // Mark this request as approved
        await db.update(assignmentRequests)
            .set({ status: 'approved' })
            .where(eq(assignmentRequests.id, requestId));

        // Reject all other pending requests for this ride
        await db.update(assignmentRequests)
            .set({ status: 'rejected' })
            .where(and(
                eq(assignmentRequests.rideId, request.rideId),
                ne(assignmentRequests.id, requestId),
                eq(assignmentRequests.status, 'pending')
            ));
    }

    static async rejectAssignmentRequest(requestId: string): Promise<void> {
        const request = await db.query.assignmentRequests.findFirst({
            where: eq(assignmentRequests.id, requestId),
        });
        if (!request) throw new Error('Assignment request not found');
        if (request.status !== 'pending') throw new Error('Request is no longer pending');

        await db.update(assignmentRequests)
            .set({ status: 'rejected' })
            .where(eq(assignmentRequests.id, requestId));
    }
}

export type AssignmentRequestWithDriver = {
    requestId: string;
    status: string;
    requestedAt: Date;
    driverId: string;
    driverName: string | null;
    driverEmail: string | null;
};
