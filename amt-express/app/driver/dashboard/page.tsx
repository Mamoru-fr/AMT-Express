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
                    <div className="min-h-[100dvh] w-full flex flex-col bg-gray-50">
                        <div className="max-w-7xl mx-auto w-full flex flex-1 items-center justify-center p-6">
                            <div className="text-red-600 text-center">Error loading dashboard: {dashboardData.error}</div>
                        </div>
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
            <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
                <div className="max-w-7xl mx-auto w-full flex flex-1 items-center justify-center p-6">
                    <div className="text-gray-900 text-xl">Loading driver dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
            <div className="max-w-7xl mx-auto w-full flex flex-1 flex-col">
                <DriverDashboard data={data} onRefresh={loadData} />
            </div>
        </div>
    );
}
