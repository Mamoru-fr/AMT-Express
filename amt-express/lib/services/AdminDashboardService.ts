import db from '@/lib/db/drizzle';
import {rides, users, invoices, rideCustomers, drivers} from '@/lib/db/schema';
import {eq, sql, and, gte} from 'drizzle-orm';

// Types for query results
type MonthlyRidesRow = { month: string; rides: number };
type MonthlyRevenueRow = { month: string; revenue: number };
type RecentRideRow = { 
    id: string; 
    departure: string; 
    destination: string; 
    customerId?: string | null; 
    driverName: string | null; 
    price: string; 
    status: 'pending' | 'assigned' | 'completed' | 'cancelled'; 
    departureTime: Date 
};
type CustomerData = { id: string; name: string | null };

// Type definition for the complete dashboard data structure
export type AdminDashboardData = {
    kpis: {
        totalRides: number;
        activeUsers: number;
        pendingInvoices: number;
        monthlyRevenue: string;
    };
    monthlyRides: Array<{month: string; rides: number}>;
    monthlyRevenue: Array<{month: string; revenue: number}>;
    statusDistribution: Array<{name: string; value: number}>;
    recentRides: Array<{
        id: string;
        departure: string;
        destination: string;
        customerName: string | null;
        driverName: string | null;
        price: string;
        status: 'pending' | 'assigned' | 'completed' | 'cancelled';
        departureTime: Date;
    }>;
};

export class AdminDashboardService {
    /**
     * Fetches and aggregates all data needed for the admin dashboard
     */
    static async getAdminDashboardData(): Promise<AdminDashboardData> {
        // Calculate date 12 months ago (for chart data range)
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
        
        // Monthly rides bar chart
        const monthlyRidesData = await db
            .select({
                month: sql<string>`TO_CHAR(${rides.departureTime}, 'Mon YYYY')`,
                rides: sql<number>`count(*)`
            })
            .from(rides)
            .where(gte(rides.departureTime, twelveMonthsAgo))
            .groupBy(sql`TO_CHAR(${rides.departureTime}, 'YYYY-MM'), TO_CHAR(${rides.departureTime}, 'Mon YYYY')`)
            .orderBy(sql`TO_CHAR(${rides.departureTime}, 'YYYY-MM')`);

        // Monthly revenue line chart
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

        // Status distribution pie chart
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
            assigned: 'In Progress',
            pending: 'Pending',
            cancelled: 'Cancelled'
        };

        const statusDistribution = statusData.map((item: {status: string; count: number}) => ({
            name: statusMap[item.status] || item.status,
            value: Number(item.count)
        }));

        // === RECENT RIDES TABLE ===
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
        const customerIds = [...new Set(recentRidesData.map((r: RecentRideRow) => r.customerId).filter(Boolean))];
        const customersData = customerIds.length > 0
            ? await db.select({id: users.id, name: users.name}).from(users).where(sql`${users.id} IN ${customerIds}`)
            : [];
        
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
        };
    }
}
