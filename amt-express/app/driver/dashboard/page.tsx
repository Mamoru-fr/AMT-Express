'use client'

import {useEffect, useState} from "react";
import {DriverDashboard} from "@/components/dashboard/DriverDashboard";
import {fetchDriverDashboard, DriverDashboardData} from "@/lib/actions/driverDashboardActions";
import {useSessionWithRole} from "@/context/SessionContext";
import {redirect} from "next/navigation";

export default function DriverDashboardPage() {
    const {session} = useSessionWithRole();
    const [data, setData] = useState<DriverDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    if (!session || session.user.role !== 'driver') {
        redirect('/');
    }

    const loadData = async () => {
        setLoading(true);
        try {
            const dashboardData = await fetchDriverDashboard();
            setData(dashboardData);
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

    return <DriverDashboard data={data} onRefresh={loadData}/>;
}
