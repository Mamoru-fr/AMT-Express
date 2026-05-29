'use client'

/* ========== Import Section ========== */
// React 
import {useState, useEffect} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

// Icons imports from lucide-react
import {Car, Users, FileText, Euro, LayoutDashboard} from "lucide-react";

// Actions imports from the rides management library and admin dashboard library
import {AdminDashboardData} from "@/lib/actions/adminDashboardActions";

// Component imports for dashboard cards, charts, tables, and modals
import {DashboardDataCard} from "@/components/specificCards/DashboardDataCard";
import {MonthlyRidesChart} from "@/components/dashboard/MonthlyRidesChart";
import {MonthlyRevenueChart} from "@/components/dashboard/MonthlyRevenueChart";
import {StatusPieChart} from "@/components/dashboard/StatusPieChart";
import {RecentRidesTable} from "@/components/dashboard/RecentRidesTable";
import styles from "./AdminDashboard.module.css";

// Type imports for ride status enumeration
/**
 * Props for the AdminDashboard component
 * @property {AdminDashboardData} data - Pre-fetched dashboard data including KPIs, charts, and recent rides
 */
type Props = {
    data: AdminDashboardData;
};

/**
 * AdminDashboard - Main dashboard component for administrators
 * 
 * Displays comprehensive platform analytics including:
 * - Key Performance Indicators (KPIs): total rides, active users, pending invoices, monthly revenue
 * - Monthly rides and revenue trend charts
 * - Ride status distribution pie chart
 * - Recent rides table with quick actions
 * - Add new ride functionality with modal form
 * 
 * @param {Props} props - Component props containing pre-fetched dashboard data
 * @returns {JSX.Element} The admin dashboard interface
 */
export function AdminDashboard({data}: Props) {
    // Destructure dashboard data for easier access
    const {kpis, monthlyRides, monthlyRevenue, statusDistribution, recentRides} = data;
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    // ========== Component State ==========
    return (
        <div className={styles.adminDashboard}>
            <div className={styles.adminInner}>
                {/* ========== Dashboard Header ========== */}
                <div className={styles.headerBlock}>
                    <div className={styles.titleRow}>
                        <div className={styles.titleIcon}>
                            <LayoutDashboard />
                        </div>
                        <h1 className={styles.title}>Admin Dashboard</h1>
                    </div>
                    <p className={styles.subtitle}>Complete overview of platform activity</p>
                </div>

                {/* ========== Key Performance Indicators (KPIs) ========== */}
                {/* Responsive grid: 2 columns on mobile, 4 columns on large screens */}
                <div className={styles.kpiGrid}>
                    {/* Total number of rides across all statuses */}
                    <DashboardDataCard
                        title="Total Rides"
                        data={kpis.totalRides}
                        icon={Car}
                        iconColor="blue"
                    />
                    {/* Count of currently active users (drivers + customers) */}
                    <DashboardDataCard
                        title="Active Users"
                        data={kpis.activeUsers}
                        icon={Users}
                        iconColor="green"
                    />
                    {/* Number of invoices awaiting payment */}
                    <DashboardDataCard
                        title="Pending Invoices"
                        data={kpis.pendingInvoices}
                        icon={FileText}
                        iconColor="yellow"
                    />
                    {/* Total revenue generated in the current month */}
                    <DashboardDataCard
                        title="Monthly Revenue"
                        data={`€${Number(kpis.monthlyRevenue).toFixed(2)}`}
                        icon={Euro}
                        iconColor="purple"
                    />
                </div>

                {/* ========== Quick Actions ========== */}
                {/* Primary action: Create new ride */}
                <div className={styles.actionsRow}>
                    {/* Button text adapts to screen size: "Add Ride" on mobile, "Add New Ride" on larger screens */}
                    <button
                        className={styles.primaryAction}
                        onClick={() => router.push(`/admin/ride-management/new?returnTo=${encodeURIComponent(currentReturnTo)}`)}
                    >
                        <span className={styles.primaryActionIcon}>+</span>
                        <span>Add New Ride</span>
                    </button>
                </div>

                {/* ========== Analytics Charts ========== */}
                {/* Displays monthly trends for rides and revenue */}
                <div className={styles.chartGrid}>
                    <MonthlyRidesChart data={monthlyRides} />
                    <MonthlyRevenueChart data={monthlyRevenue} />
                </div>

                {/* ========== Status Overview & Recent Activity ========== */}
                {/* Left: Pie chart showing ride status distribution */}
                {/* Right: Table of most recent rides with quick actions (2/3 width on large screens) */}
                <div className={styles.bottomGrid}>
                    <StatusPieChart data={statusDistribution} />
                    <div className={styles.recentRidesCol}>
                        <RecentRidesTable rides={recentRides} />
                    </div>
                </div>
            </div>
        </div>
    );
}
