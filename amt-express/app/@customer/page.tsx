'use client';

// React and Hooks
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Icons
import { Car, Calendar, Clock, CheckCircle, User, LayoutDashboard } from 'lucide-react';

// Components
import CustomerRidesView from '@/components/customer/CustomerRidesView';
import { DashboardDataCard } from '@/components/specificCards/DashboardDataCard';
import { CustomerSidebar } from '@/components/customer/navigation/CustomerSidebar';

// Actions
import { getCustomerDashboardData, type CustomerDashboardData } from '@/lib/actions/customerDashboardActions';

// Styles
import styles from '@/components/dashboard/CustomerDashboard.module.css';
import errorStyles from '../page.module.css';

export default function CustomerDashboardPage() {
  const { t } = useTranslation();
  
  // State for data and loading
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Fetch customer dashboard data via server action
        const response = await getCustomerDashboardData();
        
        if (response.success) {
          setData(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to load dashboard');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <CustomerSidebar>
        <div className={styles.customerDashboard}>
          <div className={styles.customerInner}>
            <p>{t('dashboard.loading')}</p>
          </div>
        </div>
      </CustomerSidebar>
    );
  }

  // Error state
  if (error) {
    return (
      <CustomerSidebar>
        <div className={styles.customerDashboard}>
          <div className={styles.customerInner}>
            <div className={errorStyles.homeErrorMessage}>
              <p className={errorStyles.homeErrorText}>{t('dashboard.error.message')}: {error}</p>
            </div>
          </div>
        </div>
      </CustomerSidebar>
    );
  }

  // Success: Render dashboard
  if (!data) return null;

  const { completedRides, pendingRides, totalRides } = data;

  return (
    <CustomerSidebar>
      <div className={styles.customerDashboard}>
        <div className={styles.customerInner}>
          {/* Dashboard Header */}
          <div className={styles.headerBlock}>
            <div className={styles.titleRow}>
              <div className={styles.titleIcon}>
                <LayoutDashboard />
              </div>
              <h1 className={styles.title}>{t('customerDashboard.title')}</h1>
            </div>
            <p className={styles.subtitle}>{t('customerDashboard.subtitle')}</p>
          </div>

          {/* KPIs */}
          <div className={styles.kpiGrid}>
            <DashboardDataCard
              title={t('customerDashboard.totalRides')}
              data={totalRides}
              icon={Car}
              iconColor="blue"
            />
            <DashboardDataCard
              title={t('customerDashboard.completedCount')}
              data={completedRides.length}
              icon={CheckCircle}
              iconColor="green"
            />
            <DashboardDataCard
              title={t('customerDashboard.pendingCount')}
              data={pendingRides.length}
              icon={Clock}
              iconColor="yellow"
            />
            <DashboardDataCard
              title={t('customerDashboard.uniqueDrivers')}
              data={new Set([...completedRides, ...pendingRides]
                .filter(r => r.driver)
                .map(r => r.driver?.id)
              ).size}
              icon={User}
              iconColor="purple"
            />
          </div>

          {/* Quick Stats - Customer specific */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t('customerDashboard.upcomingRides')}</span>
              <span className={styles.statValue}>{pendingRides.filter(r => r.status === 'assigned').length}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t('customerDashboard.recentlyCompleted')}</span>
              <span className={styles.statValue}>
                {completedRides.filter(r => {
                  const rideDate = new Date(r.departureTime);
                  const now = new Date();
                  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                  return rideDate >= thirtyDaysAgo;
                }).length}
              </span>
            </div>
          </div>

          {/* Customer Rides View */}
          <div className={styles.ridesSection}>
            <h2 className={styles.sectionTitle}>
              <Calendar className={styles.sectionIcon} />
              {t('customerDashboard.myRides')}
            </h2>
            <p className={styles.sectionDescription}>{t('customerDashboard.ridesDescription')}</p>
            
            <div className={styles.ridesContent}>
              <CustomerRidesView />
            </div>
          </div>
        </div>
      </div>
    </CustomerSidebar>
  );
}
