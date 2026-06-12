import {AdminDashboard} from "@/components/dashboard/AdminDashboard";
import {getAdminDashboardData} from "@/lib/actions/adminDashboardActions";
import {DriverDashboard} from "@/components/dashboard/DriverDashboard";
import {fetchDriverDashboard} from "@/lib/actions/driverDashboardActions";
import {getSessionWithRole} from "@/lib/auth/session";
import type {AdminDashboardData} from "@/lib/services/AdminDashboardService";
import type {DriverDashboardData} from "@/lib/services/DriverDashboardService";
import {redirect} from "next/navigation";
import {AlertTriangle, Car} from "lucide-react";
import styles from "./page.module.css";

export default async function Home() {
  const {isAdmin, isDriver, isAuthenticated} = await getSessionWithRole();

  const renderErrorState = (message: string) => (
    <div className={styles.homeContainer}>
      <div className={styles.homeContentWrapper}>
        <div className={styles.homeCard}>
          <div className={styles.homeHeader}>
            <div className={styles.homeLogoIcon}>
              <AlertTriangle className={styles.homeErrorIcon} />
            </div>
            <div className={styles.homeTitleSection}>
              <h1 className={styles.homeTitle}>Dashboard Error</h1>
              <p className={styles.homeSubtitle}>Something went wrong while loading your view.</p>
            </div>
          </div>

          <div className={styles.homeErrorMessage}>
            <p className={styles.homeErrorText}>Error loading dashboard: {message}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // If the user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    redirect('/connections');
  }

  // Admin Dashboard
  if (isAdmin) {
    const response = await getAdminDashboardData();
    if (!response.success) {
      return renderErrorState(response.error);
    }
    return (
      <div className={styles.homeDashboardWrapper}>
        <AdminDashboard data={response.data}/>
      </div>
    );
  }

  // Driver Dashboard
  if (isDriver) {
    const driverData = await fetchDriverDashboard();
    if (!driverData.success) {
      return renderErrorState(driverData.error);
    }
    return (
      <div className={styles.homeDashboardWrapper}>
        <DriverDashboard data={driverData.data}/>
      </div>
    );
  }

  // Customer Dashboard (placeholder for now)
  return (
    <div className={styles.homeContainer}>
      <div className={styles.homeHeader}>
        <div className={styles.homeLogoIcon}>
          <Car className={styles.homeLogoIconSvg} />
        </div>
        <div className={styles.homeTitleSection}>
          <h1 className={styles.homeTitle}>Customer Dashboard</h1>
          <p className={styles.homeSubtitle}>A shared layout inspired by the connection page.</p>
        </div>
      </div>

      <div className={styles.homeContentWrapper}>
        <main className={styles.homeCard}>
          <div className={styles.homePlaceholder}>
            <h2 className={styles.homePlaceholderTitle}>Coming soon...</h2>
            <p className={styles.homePlaceholderText}>
              This area will host the customer dashboard once it is ready.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
