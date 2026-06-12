'use client'

import {useEffect, useState} from "react";
import {DriverDashboard} from "@/components/dashboard/DriverDashboard";
import {fetchDriverDashboard} from "@/lib/actions/driverDashboardActions";
import {useSessionWithRole} from "@/context/SessionContext";
import {redirect} from "next/navigation";
import type {DriverDashboardData} from "@/lib/services/DriverDashboardService";

export default function DriverDashboardPage() {
    const {session, isDriver} = useSessionWithRole();
    const [data, setData] = useState<DriverDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    if (!session || !isDriver) {
        redirect('/');
    }

    const loadData = async () => {
        setLoading(true);
        try {
            const dashboardData = await fetchDriverDashboard();

            if (!dashboardData.success) {
                return (
                    <div className="min-h-screen w-full flex items-center justify-center">
                        <div className="text-red-600">Error loading dashboard: {dashboardData.error}</div>
                    </div>
                );
            }

            setData(dashboardData.data);
        } catch (error) {
            console.error('Failed to load driver dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading || !data) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center">
                <div className="text-white text-xl">Loading driver dashboard...</div>
            </div>
        );
    }

    return <DriverDashboard data={data} onRefresh={loadData} />;
}
