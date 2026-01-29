'use client'

/* ========== Import Section ========== */
// React 
import {useState, useEffect} from "react";

// Icons imports from lucide-react
import {Car, Users, FileText, Euro} from "lucide-react";

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
        <div className="w-full py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-8">
            <div className="max-w-7xl mx-auto my-auto space-y-6 sm:space-y-8 md:space-y-10">
                {/* ========== Dashboard Header ========== */}
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Admin Dashboard</h1>
                    <p className="text-white/90 mt-1 sm:mt-2 drop-shadow-md text-sm sm:text-base">Complete overview of platform activity</p>
                </div>

                {/* ========== Key Performance Indicators (KPIs) ========== */}
                {/* Responsive grid: 2 columns on mobile, 4 columns on large screens */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    {/* Total number of rides across all statuses */}
                    <DashboardDataCard
                        title="Total Rides"
                        data={kpis.totalRides}
                        icon={Car}
                        iconColor="bg-blue-500"
                    />
                    {/* Count of currently active users (drivers + customers) */}
                    <DashboardDataCard
                        title="Active Users"
                        data={kpis.activeUsers}
                        icon={Users}
                        iconColor="bg-green-500"
                    />
                    {/* Number of invoices awaiting payment */}
                    <DashboardDataCard
                        title="Pending Invoices"
                        data={kpis.pendingInvoices}
                        icon={FileText}
                        iconColor="bg-yellow-500"
                    />
                    {/* Total revenue generated in the current month */}
                    <DashboardDataCard
                        title="Monthly Revenue"
                        data={`€${Number(kpis.monthlyRevenue).toFixed(2)}`}
                        icon={Euro}
                        iconColor="bg-purple-500"
                    />
                </div>

                {/* ========== Quick Actions ========== */}
                {/* Primary action: Create new ride */}
                <div className="flex justify-end">
                    {/* Button text adapts to screen size: "Add Ride" on mobile, "Add New Ride" on larger screens */}
                    <button
                        className="flex w-full justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 gap-2 text-sm sm:text-base"
                        onClick={() => setAddModal(true)}
                    >
                        <span className="text-lg sm:text-xl">+</span>
                        <span className="hidden xs:inline">Add New Ride</span>
                        <span className="xs:hidden">Add Ride</span>
                    </button>
                </div>

                {/* ========== Analytics Charts ========== */}
                {/* Displays monthly trends for rides and revenue */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    <MonthlyRidesChart data={monthlyRides} />
                    <MonthlyRevenueChart data={monthlyRevenue} />
                </div>

                {/* ========== Status Overview & Recent Activity ========== */}
                {/* Left: Pie chart showing ride status distribution */}
                {/* Right: Table of most recent rides with quick actions (2/3 width on large screens) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    <StatusPieChart data={statusDistribution} />
                    <div className="lg:col-span-2">
                        <RecentRidesTable rides={recentRides} />
                    </div>
                </div>
            </div>

            {/* ========== Modals ========== */}
            {/* Add Ride Modal - Conditionally rendered when addModal state is true */}
            {addModal && (
                <AddRideModal
                    drivers={availableDrivers}
                    customers={availableCustomers}
                    onClose={() => setAddModal(false)}
                    onCreate={handleCreateRide}
                />
            )}
        </div>
    );
}
