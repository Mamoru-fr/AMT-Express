'use client'

/* ========== Import Section ========== */
// React 
import {useState, useEffect} from "react";

// Icons imports from lucide-react
import {Car, Users, FileText, Euro, LayoutDashboard} from "lucide-react";

// Actions imports from the rides management library and admin dashboard library
import {createRide, fetchAvailableDrivers, fetchAllCustomers} from "@/lib/actions/ridesManagementActions";
import {AdminDashboardData} from "@/lib/actions/adminDashboardActions";

// Component imports for dashboard cards, charts, tables, and modals
import {DashboardDataCard} from "@/components/specificCards/DashboardDataCard";
import {MonthlyRidesChart} from "@/components/dashboard/MonthlyRidesChart";
import {MonthlyRevenueChart} from "@/components/dashboard/MonthlyRevenueChart";
import {StatusPieChart} from "@/components/dashboard/StatusPieChart";
import {RecentRidesTable} from "@/components/dashboard/RecentRidesTable";
import {AddRideModal} from "@/components/admin/rideManagement/AddRideModal";
import styles from "./AdminDashboard.module.css";

// Type imports for ride status enumeration
import {RideStatus} from "@/content/database_types/ride";

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

    // ========== Component State ==========
    
    /** Controls the visibility of the Add Ride modal */
    const [addModal, setAddModal] = useState(false);

    /** List of available drivers fetched from the database for ride assignment */
    const [availableDrivers, setAvailableDrivers] = useState<Array<{id: string; name: string; email: string}>>([]);
    
    /** List of all customers fetched from the database for ride creation */
    const [availableCustomers, setAvailableCustomers] = useState<Array<{id: string; name: string; email: string}>>([]);

    /**
     * Effect: Load available drivers and customers on component mount
     * These lists populate the dropdowns in the Add Ride modal
     */
    const fetchAvailableDriversAndCustomers = async () => {
        try {
            // Fetch all drivers available for ride assignment
            const driversResponse = await fetchAvailableDrivers();
            if (driversResponse.success) {
                setAvailableDrivers(driversResponse.data);
            } else {
                console.error('Failed to fetch drivers:', driversResponse.error);
            }

            // Fetch all customers for ride creation
            const customersResponse = await fetchAllCustomers();
            if (customersResponse.success) {
                setAvailableCustomers(customersResponse.data);
            } else {
                console.error('Failed to fetch customers:', customersResponse.error);
            }
        } catch (error) {
            console.error('Error fetching drivers or customers:', error);
        }
    };

    /**
     * Effect hook: Fetch drivers and customers on component mount
     * Dependencies: [] - runs only once when component mounts
     */
    useEffect(() => {
        fetchAvailableDriversAndCustomers();
    }, []);

    // ========== Event Handlers ==========
    
    /**
     * Handles the creation of a new ride
     * 
     * Receives ride data from the AddRideModal form, sends it to the server,
     * and refreshes the page to display the updated dashboard data.
     * 
     * Features:
     * - Supports multiple customers per ride
     * - Optional driver assignment (can be assigned later)
     * - Optional pricing (can be set during or after creation)
     * - Configurable ride status (defaults to appropriate initial state)
     * 
     * @async
     * @param {Object} data - The ride creation data
     * @param {Date} data.departureTime - Scheduled departure time for the ride
     * @param {string[]} data.customerIds - Array of customer IDs for the ride
     * @param {string} data.departure - Pickup location address
     * @param {string} data.destination - Drop-off location address
     * @param {string} [data.driverId] - Optional driver ID for assignment
     * @param {string} [data.price] - Optional price for the ride
     * @param {RideStatus} [data.status] - Optional initial status for the ride
     * @returns {Promise<void>}
     */
    const handleCreateRide = async (data: {
        departureTime: Date;
        customerIds: string[];
        departure: string;
        destination: string;
        driverId?: string;
        price?: string;
        status?: RideStatus;
    }) => {
        try {
            // Call server action to create the ride in the database
            await createRide(data);
            
            // Close the modal on successful creation
            setAddModal(false);
            
            // Refresh the page to fetch and display updated dashboard data
            // Note: In a production app, consider using React state updates or revalidation
            // instead of full page reload for better UX
            window.location.reload();
        } catch (error) {
            console.error('Failed to create ride:', error);
            alert('Failed to create ride');
        }
    };

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
                        onClick={() => setAddModal(true)}
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

            {/* ========== Modals ========== */}
            {/* Add Ride Modal - Conditionally rendered when addModal state is true */}
            {addModal && (
                <AddRideModal
                    onClose={() => {setAddModal(false); window.location.reload();}}
                    isOpen={addModal}
                />
            )}
        </div>
    );
}
