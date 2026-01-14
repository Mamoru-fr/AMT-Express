'use client'

import {DashboardDataCard} from "@/components/specificCards/DashboardDataCard";
import {MonthlyRidesChart} from "@/components/dashboard/MonthlyRidesChart";
import {MonthlyRevenueChart} from "@/components/dashboard/MonthlyRevenueChart";
import {StatusPieChart} from "@/components/dashboard/StatusPieChart";
import {RecentRidesTable} from "@/components/dashboard/RecentRidesTable";
import {Car, Users, FileText, Euro} from "lucide-react";
import {AdminDashboardData} from "@/lib/actions/dashboardActions";

type Props = {
    data: AdminDashboardData;
};

export function AdminDashboard({data}: Props) {
    const {kpis, monthlyRides, monthlyRevenue, statusDistribution, recentRides} = data;

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
                        onClick={() => {
                            // Logic to open Add Ride modal goes here
                            alert("Open Add Ride Modal");
                        }}
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
        </div>
    );
}
