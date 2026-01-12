import {auth} from "@/lib/auth/auth";
import {headers} from "next/headers";
import {AdminDashboard} from "@/components/dashboard/AdminDashboard";
import {getAdminDashboardData} from "@/lib/actions/dashboardActions";
import {redirect} from "next/navigation";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const userRole = session && session.user.role;

  // Admin Dashboard
  if (userRole === 'admin') {
    const dashboardData = await getAdminDashboardData();
    return (
      <div className="min-h-screen w-full overflow-y-auto md:fixed md:inset-0 z-10">
        <AdminDashboard data={dashboardData}/>
      </div>
    );
  }

  // Driver Dashboard (placeholder for now)
  if (userRole === 'driver') {
    return (
      <div className="flex min-h-screen items-center justify-center font-sans z-10">
        <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-16">
          <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600 mt-4">Coming soon...</p>
        </main>
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
