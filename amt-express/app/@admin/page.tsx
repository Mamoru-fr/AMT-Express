'use client';

/* ========== Import Section ========== */
/* React */
import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/* Lucide icons */
import { Car, Users, FileText, Euro, LayoutDashboard, AlertTriangle } from 'lucide-react';

/* Components */
import { DashboardDataCard } from '@/components/specificCards/DashboardDataCard';
import { MonthlyRidesChart } from '@/components/dashboard/MonthlyRidesChart';
import { MonthlyRevenueChart } from '@/components/dashboard/MonthlyRevenueChart';
import { StatusPieChart } from '@/components/dashboard/StatusPieChart';
import { RecentRidesTable } from '@/components/dashboard/RecentRidesTable';
import { AdminNavigationShell } from '@/components/admin/navigation/AdminNavigationShell';
import { useTranslation } from 'react-i18next';

/* Actions & Types */
import { getAdminDashboardData } from '@/lib/actions/adminDashboardActions';
import type { AdminDashboardData } from '@/lib/services/AdminDashboardService';

/* Styles */
import styles from '../page.module.css';
import adminStyles from '@/components/dashboard/AdminDashboard.module.css';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentReturnTo = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  /* State for data and loading/error */
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* Fetch data on mount */
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await getAdminDashboardData();
        if (response.success) {
          setData(response.data);
          setError(null);
        } else {
          setError(response.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  /* Loading state */
  if (isLoading) {
    return (
      <div className={styles.homeContainer}>
        <p>{t('dashboard.loading')}</p>
      </div>
    );
  }

  /* Error state */
  if (error) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.homeContentWrapper}>
          <div className={styles.homeCard}>
            <div className={styles.homeHeader}>
              <div className={styles.homeLogoIcon}>
                <AlertTriangle className={styles.homeErrorIcon} />
              </div>
              <div className={styles.homeTitleSection}>
                <h1 className={styles.homeTitle}>{t('dashboard.error.title')}</h1>
                <p className={styles.homeSubtitle}>
                  {t('dashboard.error.subtitle')}
                </p>
              </div>
            </div>
            <div className={styles.homeErrorMessage}>
              <p className={styles.homeErrorText}>{t('dashboard.error.message')}: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Success: Render dashboard */
  if (!data) return null;

  // Destructure dashboard data
  const { kpis, monthlyRides, monthlyRevenue, statusDistribution, recentRides } = data;

  return (
    <AdminNavigationShell>
      <div className={adminStyles.adminDashboard}>
        <div className={adminStyles.adminInner}>
          {/* Dashboard Header */}
          <div className={adminStyles.headerBlock}>
            <div className={adminStyles.titleRow}>
              <div className={adminStyles.titleIcon}>
                <LayoutDashboard />
              </div>
              <h1 className={adminStyles.title}>{t('adminDashboard.title')}</h1>
            </div>
            <p className={adminStyles.subtitle}>{t('adminDashboard.subtitle')}</p>
          </div>

          {/* KPIs */}
          <div className={adminStyles.kpiGrid}>
            <DashboardDataCard
              title={t('adminDashboard.kpis.totalRides')}
              data={kpis.totalRides}
              icon={Car}
              iconColor="blue"
            />
            <DashboardDataCard
              title={t('adminDashboard.kpis.activeUsers')}
              data={kpis.activeUsers}
              icon={Users}
              iconColor="green"
            />
            <DashboardDataCard
              title={t('adminDashboard.kpis.pendingInvoices')}
              data={kpis.pendingInvoices}
              icon={FileText}
              iconColor="yellow"
            />
            <DashboardDataCard
              title={t('adminDashboard.kpis.monthlyRevenue')}
              data={`€${Number(kpis.monthlyRevenue).toFixed(2)}`}
              icon={Euro}
              iconColor="purple"
            />
          </div>

          {/* Quick Actions */}
          <div className={adminStyles.actionsRow}>
            <button
              className={adminStyles.primaryAction}
              onClick={() => router.push(`/ride-management/new?returnTo=${encodeURIComponent(currentReturnTo)}`)}
            >
              <span className={adminStyles.primaryActionIcon}>+</span>
              <span>{t('adminDashboard.actions.addNewRide')}</span>
            </button>
          </div>

          {/* Charts */}
          <div className={adminStyles.chartGrid}>
            <MonthlyRidesChart data={monthlyRides} />
            <MonthlyRevenueChart data={monthlyRevenue} />
          </div>

          {/* Bottom Grid */}
          <div className={adminStyles.bottomGrid}>
            <StatusPieChart data={statusDistribution} />
            <RecentRidesTable rides={recentRides} />
          </div>
        </div>
      </div>
    </AdminNavigationShell>
  );
}