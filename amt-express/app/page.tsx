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
      <div className="w-full h-screen p-4 flex flex-1 z-10">
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
      <div className="w-full h-screen flex flex-1">
        <DriverDashboard data={driverData.data}/>
      </div>
    );
  }

  // Customer Dashboard (placeholder for now)
  return (
    <div className="flex w-full h-screen items-center justify-center font-sans z-10 p-4">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center py-16 sm:py-24 md:py-32 px-6 sm:px-12 md:px-16 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Customer Dashboard</h1>
        <p className="text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base">Coming soon...</p>
      </main>
    </div>
  );
}
