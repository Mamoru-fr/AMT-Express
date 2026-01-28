import {AdminDashboard} from "@/components/dashboard/AdminDashboard";
import {getAdminDashboardData} from "@/lib/actions/adminDashboardActions";
import {DriverDashboard} from "@/components/dashboard/DriverDashboard";
import {fetchDriverDashboard} from "@/lib/actions/driverDashboardActions";
import {getSessionWithRole} from "@/lib/auth/session";
import {redirect} from "next/navigation";

export default async function Home() {
  const {isAdmin, isDriver, isAuthenticated} = await getSessionWithRole();

  // If the user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    redirect('/connections');
  }

  // Admin Dashboard
  if (isAdmin) {
    const response = await getAdminDashboardData();
    if (!response.success) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-red-600">Error loading dashboard: {response.error}</div>
        </div>
      );
    }
    return (
      <div className="min-h-screen w-full overflow-y-auto z-10">
        <AdminDashboard data={response.data}/>
      </div>
    );
  }

  // Driver Dashboard
  if (isDriver) {
    const driverData = await fetchDriverDashboard();
    if (!driverData.success) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="text-red-600">Error loading dashboard: {driverData.error}</div>
        </div>
      );
    }
    return (
      <div className="min-h-screen w-full overflow-y-auto z-10">
        <DriverDashboard data={driverData.data}/>
      </div>
    );
  }

  // Customer Dashboard (placeholder for now)
  return (
    <div className="flex min-h-screen items-center justify-center font-sans z-10">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
        <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="text-gray-600 mt-4">Coming soon...</p>
      </main>
    </div>
  );
}
