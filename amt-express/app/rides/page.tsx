/**
 * Unified Rides Page
 * 
 * This page displays different views based on user role:
 * - Admin: Full CRUD management board with all rides
 * - Driver: 3 views (completed, assigned, available rides)
 * - Customer: 2 views (completed, pending rides)
 */

'use client';

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import {auth} from "@/lib/auth/auth";
import {RidesManagementBoard} from "@/components/admin/rideManagement/RidesManagementBoard";
import DriverRidesView from "@/components/driver/DriverRidesView";
import CustomerRidesView from "@/components/customer/CustomerRidesView";

export default function RidesPage() {
    const {t} = useTranslation();
    const router = useRouter();
    
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const session = await auth.api.getSession();
                if (!session) {
                    router.push("/");
                    return;
                }
                setUserRole(session.user.role);
            } catch (error) {
                router.push("/");
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    if (loading) {
        return null;
    }

    if (!userRole) {
        router.push("/");
        return null;
    }

    // Render appropriate component based on role
    if (userRole === "admin") {
        return <RidesManagementBoard />;
    } else if (userRole === "driver") {
        return <DriverRidesView />;
    } else if (userRole === "customer") {
        return <CustomerRidesView />;
    }

    // Fallback for unknown roles
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('errors.accessDenied')}</h1>
                <p className="text-gray-600">{t('errors.unauthorizedRole')}</p>
            </div>
        </div>
    );
}
