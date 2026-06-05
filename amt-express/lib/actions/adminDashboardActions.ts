// Server action for fetching admin dashboard data
// This file contains the main function that aggregates all dashboard metrics

import db from '@/lib/db/drizzle';
import {rides, users, invoices, rideCustomers, drivers} from '@/lib/db/schema';
import {eq, sql, and, gte} from 'drizzle-orm';
import {auth} from '@/lib/auth/auth';
import {ActionResponse, ErrorCodes} from '@/lib/types/action-response';

// Types for query results
type MonthlyRidesRow = { month: string; rides: number };
type MonthlyRevenueRow = { month: string; revenue: number };
type RecentRideRow = { id: number; departure: string; destination: string; customerId?: string | null; driverName: string | null; price: string; status: 'pending' | 'assigned' | 'completed' | 'cancelled'; departureTime: Date };
type CustomerData = { id: string; name: string | null };

// Type definition for the complete dashboard data structure
// Includes KPIs, charts data, and recent activity
export type AdminDashboardData = {
    // Key Performance Indicators displayed at the top of the dashboard
    kpis: {
        totalRides: number;           // Total number of rides in the system
        activeUsers: number;          // Users who had rides in last 30 days
        pendingInvoices: number;      // Count of unpaid invoices
        monthlyRevenue: string;       // Total revenue for current month (completed rides only)
    };
    // Data for bar chart showing ride count per month (last 12 months)
    monthlyRides: Array<{month: string; rides: number}>;
    // Data for line chart showing revenue per month (last 12 months, completed rides only)
    monthlyRevenue: Array<{month: string; revenue: number}>;
    // Data for pie chart showing distribution of rides by status
    statusDistribution: Array<{name: string; value: number}>;
    // List of the 10 most recent rides with full details
    recentRides: Array<{
        id: number;
        departure: string;
        destination: string;
        customerName: string | null;  // Null if ride has no customer assigned
        driverName: string | null;    // Null if ride has no driver assigned
        price: string;
        status: 'pending' | 'assigned' | 'completed' | 'cancelled';
        departureTime: Date;
    }>;
};

/**
 * Fetches and aggregates all data needed for the admin dashboard
 * This function performs multiple database queries to gather:
 * - KPIs (total rides, active users, pending invoices, monthly revenue)
 * - Monthly rides chart data (last 12 months)
 * - Monthly revenue chart data (last 12 months)
 * - Status distribution for pie chart
 * - 10 most recent rides with customer and driver info
 * 
 * @returns AdminDashboardData object with all dashboard metrics
 */
export async function getAdminDashboardData(): Promise<ActionResponse<AdminDashboardData>> {
    try {
        // Validate session
        const session = await auth.api.getSession({
            headers: await import("next/headers").then(m => m.headers())
        });

        if (!session || session.user.role !== 'admin') {
            return {
                success: false,
                error: 'Unauthorized: Admin access only',
                code: ErrorCodes.UNAUTHORIZED
            };
        }
        // Calculate date 12 months ago (for chart data range)
        // Set to first day of that month at midnight
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        // Current month start (for monthly revenue KPI calculation)
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        // === KPI CALCULATIONS ===
        
        // KPI 1: Count all rides in the system
        const totalRidesResult = await db
            .select({count: sql<number>`count(*)`})
            .from(rides);
        const totalRides = Number(totalRidesResult[0]?.count || 0);

        // KPI 2: Count distinct customers who had rides in the last 30 days
        // This helps track customer engagement and activity
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const activeUsersResult = await db
            .selectDistinct({userId: rideCustomers.customerId})
            .from(rideCustomers)
            .innerJoin(rides, eq(rides.id, rideCustomers.rideId))
            .where(gte(rides.departureTime, thirtyDaysAgo));
        const activeUsers = activeUsersResult.length;

        // KPI 3: Count invoices that haven't been paid yet
        const pendingInvoicesResult = await db
            .select({count: sql<number>`count(*)`})
            .from(invoices)
            .where(eq(invoices.status, 'unpaid'));
        const pendingInvoices = Number(pendingInvoicesResult[0]?.count || 0);

        // KPI 4: Sum of revenue from completed rides in the current month
        // Only completed rides count toward revenue
        const monthlyRevenueResult = await db
            .select({total: sql<string>`COALESCE(SUM(${rides.price}), 0)`})
            .from(rides)
            .where(
                and(
                    gte(rides.departureTime, currentMonthStart),
                    eq(rides.status, 'completed')
                )
            );
        const monthlyRevenue = monthlyRevenueResult[0]?.total || '0';

        // === CHART DATA QUERIES ===
        
        // Monthly rides bar chart: Count rides per month for the last 12 months
        // Groups by month and formats as "Mon YYYY" (e.g., "Jan 2026")
        const monthlyRidesData = await db
            .select({
                month: sql<string>`TO_CHAR(${rides.departureTime}, 'Mon YYYY')`,
                rides: sql<number>`count(*)`
            })
            .from(rides)
            .where(gte(rides.departureTime, twelveMonthsAgo))
            .groupBy(sql`TO_CHAR(${rides.departureTime}, 'YYYY-MM'), TO_CHAR(${rides.departureTime}, 'Mon YYYY')`)
            .orderBy(sql`TO_CHAR(${rides.departureTime}, 'YYYY-MM')`);

        // Monthly revenue line chart: Sum revenue per month (completed rides only)
        // Only completed rides contribute to actual revenue
        const monthlyRevenueData = await db
            .select({
                month: sql<string>`TO_CHAR(${rides.departureTime}, 'Mon YYYY')`,
                revenue: sql<number>`COALESCE(SUM(${rides.price}), 0)`
            })
            .from(rides)
            .where(
                and(
                    gte(rides.departureTime, twelveMonthsAgo),
                    eq(rides.status, 'completed')
                )
            )
            .groupBy(sql`TO_CHAR(${rides.departureTime}, 'YYYY-MM'), TO_CHAR(${rides.departureTime}, 'Mon YYYY')`)
            .orderBy(sql`TO_CHAR(${rides.departureTime}, 'YYYY-MM')`);

        // Status distribution pie chart: Count rides grouped by their status
        const statusData = await db
            .select({
                status: rides.status,
                count: sql<number>`count(*)`
            })
            .from(rides)
            .groupBy(rides.status);

        // Map database status values to user-friendly display names
        const statusMap: Record<string, string> = {
            completed: 'Completed',
            assigned: 'In Progress',  // "assigned" status shown as "In Progress" to users
            pending: 'Pending',
            cancelled: 'Cancelled'
        };

        // Transform status data for the pie chart component
        const statusDistribution = statusData.map((item: {status: string; count: number}) => ({
            name: statusMap[item.status] || item.status,
            value: Number(item.count)
        }));

        // === RECENT RIDES TABLE ===
        // Fetch the 10 most recently created rides with driver info
        const recentRidesData = await db
            .select({
                id: rides.id,
                departure: rides.departure,
                destination: rides.destination,
                price: rides.price,
                status: rides.status,
                departureTime: rides.departureTime,
                driverName: users.name,
                customerId: rideCustomers.customerId
            })
            .from(rides)
            .leftJoin(drivers, eq(rides.driverId, drivers.id))
            .leftJoin(users, eq(drivers.userId, users.id))
            .leftJoin(rideCustomers, eq(rides.id, rideCustomers.rideId))
            .orderBy(sql`${rides.createdAt} DESC`)
            .limit(10);

        // Get customer names for recent rides
        // Extract unique customer IDs from the rides (filter out null values)
        const customerIds = [...new Set(recentRidesData.map((r: RecentRideRow) => r.customerId).filter(Boolean))];
        // Batch fetch all customer data in one query for efficiency
        const customersData = customerIds.length > 0
            ? await db.select({id: users.id, name: users.name}).from(users).where(sql`${users.id} IN ${customerIds}`)
            : [];
        
        // Create a lookup map for quick customer name access by ID
        const customerMap = new Map(customersData.map((c: CustomerData) => [c.id, c.name]));

        const recentRides = recentRidesData.map((ride: RecentRideRow) => ({
            id: ride.id,
            departure: ride.departure,
            destination: ride.destination,
            customerName: ride.customerId ? (customerMap.get(ride.customerId) || null) : null,
            driverName: ride.driverName,
            price: ride.price,
            status: ride.status,
            departureTime: ride.departureTime
        }));

        return {
            success: true,
            data: {
                kpis: {
                    totalRides,
                    activeUsers,
                    pendingInvoices,
                    monthlyRevenue
                },
                monthlyRides: monthlyRidesData.map((d: MonthlyRidesRow) => ({
                    month: d.month,
                    rides: Number(d.rides)
                })),
                monthlyRevenue: monthlyRevenueData.map((d: MonthlyRevenueRow) => ({
                    month: d.month,
                    revenue: Number(d.revenue)
                })),
                statusDistribution,
                recentRides
            }
        };
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        return {
            success: false,
            error: 'Failed to fetch dashboard data',
            code: ErrorCodes.DATABASE_ERROR
        };
    }
}
