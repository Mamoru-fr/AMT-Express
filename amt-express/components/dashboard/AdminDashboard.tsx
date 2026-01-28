'use client'

import {useState, useEffect} from "react";
import {DashboardDataCard} from "@/components/specificCards/DashboardDataCard";
import {MonthlyRidesChart} from "@/components/dashboard/MonthlyRidesChart";
import {MonthlyRevenueChart} from "@/components/dashboard/MonthlyRevenueChart";
import {StatusPieChart} from "@/components/dashboard/StatusPieChart";
import {RecentRidesTable} from "@/components/dashboard/RecentRidesTable";
import {AddRideModal} from "@/components/admin/rideManagement/AddRideModal";
import {Car, Users, FileText, Euro} from "lucide-react";
import {AdminDashboardData} from "@/lib/actions/adminDashboardActions";
import {createRide, fetchAvailableDrivers, fetchAllCustomers} from "@/lib/actions/ridesManagementActions";
import {RideStatus} from "@/content/database_types/ride";

type Props = {
    data: AdminDashboardData;
};

export function AdminDashboard({data}: Props) {
    const {kpis, monthlyRides, monthlyRevenue, statusDistribution, recentRides} = data;

    // Modal state - controls visibility of Add Ride modal
    const [addModal, setAddModal] = useState(false);

    // Dropdown data - lists of drivers and customers for ride creation
    const [availableDrivers, setAvailableDrivers] = useState<Array<{id: string; name: string; email: string}>>([]);
    const [availableCustomers, setAvailableCustomers] = useState<Array<{id: string; name: string; email: string}>>([]);

    /**
     * Effect: Load available drivers and customers on component mount
     * These lists populate the dropdowns in the Add Ride modal
     */
    const fetchAvailableDriversAndCustomers = async () => {
        try {
            const driversResponse = await fetchAvailableDrivers();
            if (driversResponse.success) {
                setAvailableDrivers(driversResponse.data);
            } else {
                console.error('Failed to fetch drivers:', driversResponse.error);
            }

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

    useEffect(() => {
        fetchAvailableDriversAndCustomers();
    }, []);

    /**
     * Creates a new ride with provided data from AddRideModal
     * Handles multiple customers, optional driver assignment, and pricing
     * Refreshes the page to show updated data after successful creation
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
            await createRide(data);
            setAddModal(false);
            // Refresh the page to show updated dashboard data
            window.location.reload();
        } catch (error) {
            console.error('Failed to create ride:', error);
            alert('Failed to create ride');
        }
    };

    return (
            <div className="w-full py-8 px-4 md:px-8">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">Admin Dashboard</h1>
                        <p className="text-white/90 mt-2 drop-shadow-md">Complete overview of platform activity</p>
                    </div>

                    {/* KPIs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <DashboardDataCard
                            title="Total Rides"
                            data={kpis.totalRides}
                            icon={Car}
                            iconColor="bg-blue-500"
                        />
                        <DashboardDataCard
                            title="Active Users"
                            data={kpis.activeUsers}
                            icon={Users}
                            iconColor="bg-green-500"
                        />
                        <DashboardDataCard
                            title="Pending Invoices"
                            data={kpis.pendingInvoices}
                            icon={FileText}
                            iconColor="bg-yellow-500"
                        />
                        <DashboardDataCard
                            title="Monthly Revenue"
                            data={`€${Number(kpis.monthlyRevenue).toFixed(2)}`}
                            icon={Euro}
                            iconColor="bg-purple-500"
                        />
                    </div>

                    {/* Add Ride Button */}
                    <div className="flex justify-end">
                        <button
                            className="flex flex-1 justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
                            onClick={() => setAddModal(true)}
                        >
                            <span className="text-xl">+</span>
                            Add New Ride
                        </button>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MonthlyRidesChart data={monthlyRides} />
                        <MonthlyRevenueChart data={monthlyRevenue} />
                    </div>

                    {/* Status Distribution & Recent Rides Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <StatusPieChart data={statusDistribution} />
                        <div className="lg:col-span-2">
                            <RecentRidesTable rides={recentRides} />
                        </div>
                    </div>
                </div>

                {/* Add Ride Modal */}
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
