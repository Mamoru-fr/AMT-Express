/**
 * Unified Rides Page
 * 
 * This page displays different views based on user role:
 * - Admin: Full CRUD management board with all rides
 * - Driver: 3 views (completed, assigned, available rides)
 * - Customer: 2 views (completed, pending rides)
 */

import {redirect} from "next/navigation";
import {auth} from "@/lib/auth/auth";
import {headers} from "next/headers";
import {RidesManagementBoard} from "@/components/admin/rideManagement/RidesManagementBoard";
import DriverRidesView from "@/components/driver/DriverRidesView";
import CustomerRidesView from "@/components/customer/CustomerRidesView";

export default async function RidesPage() {
    // Get current session
    const session = await auth.api.getSession({
        headers: await headers()
    });

    // Redirect to login if not authenticated
    if (!session) {
        redirect("/");
    }

    const userRole = session.user.role;

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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                <p className="text-gray-600">Your account role is not authorized to view this page.</p>
            </div>
        </div>
    );
}
