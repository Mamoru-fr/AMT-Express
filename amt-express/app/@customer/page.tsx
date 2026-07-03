'use client';

// React and Hooks
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Icons
import { Car, Calendar, Clock, CheckCircle, User, BarChart3 } from 'lucide-react';

// Components
import CustomerRidesView from '@/components/customer/CustomerRidesView';
import { DashboardDataCard } from '@/components/specificCards/DashboardDataCard';

// Actions
import { getCustomerDashboardData, type CustomerDashboardData } from '@/lib/actions/customerDashboardActions';

// Styles
import styles from '@/components/dashboard/DriverDashboard.module.css';
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

  // Status classes mapping
  const statusClassByValue = {
    pending: styles.statusPending,
    assigned: styles.statusAssigned,
    completed: styles.statusCompleted,
    cancelled: styles.statusCancelled,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={errorStyles.homeContainer}>
        <p>{t('dashboard.loading')}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={errorStyles.homeContainer}>
        <div className={errorStyles.homeContentWrapper}>
          <div className={errorStyles.homeCard}>
            <div className={errorStyles.homeHeader}>
              <div className={errorStyles.homeLogoIcon}>
                <Car className={errorStyles.homeErrorIcon} />
              </div>
              <div className={errorStyles.homeTitleSection}>
                <h1 className={errorStyles.homeTitle}>{t('dashboard.error.title')}</h1>
                <p className={errorStyles.homeSubtitle}>
                  {t('dashboard.error.subtitle')}
                </p>
              </div>
            </div>
            <div className={errorStyles.homeErrorMessage}>
              <p className={errorStyles.homeErrorText}>{t('dashboard.error.message')}: {error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success: Render dashboard
  if (!data) return null;

  const { completedRides, pendingRides, totalRides } = data;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{t('customerDashboard.title')}</h1>
                  <p className="text-sm text-gray-500">{t('customerDashboard.subtitle')}</p>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{totalRides}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('customerDashboard.totalRides')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{pendingRides.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('customerDashboard.pendingRides')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{completedRides.length}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{t('customerDashboard.completedRides')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardDataCard
              icon={Calendar}
              title={t('customerDashboard.upcomingRides')}
              data={pendingRides.filter(r => r.status === 'assigned').length}
              iconColor="yellow"
            />
            
            <DashboardDataCard
              icon={CheckCircle}
              title={t('customerDashboard.completedCount')}
              data={completedRides.length}
              iconColor="green"
            />
            
            <DashboardDataCard
              icon={Clock}
              title={t('customerDashboard.pendingCount')}
              data={pendingRides.filter(r => r.status === 'pending').length}
              iconColor="blue"
            />
            
            <DashboardDataCard
              icon={User}
              title={t('customerDashboard.uniqueDrivers')}
              data={new Set([...completedRides, ...pendingRides]
                .filter(r => r.driver)
                .map(r => r.driver?.id)
              ).size}
              iconColor="purple"
            />
          </div>

          {/* Customer Rides View */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{t('customerDashboard.myRides')}</h2>
              <p className="text-gray-600 mt-1">{t('customerDashboard.ridesDescription')}</p>
            </div>
            
            <CustomerRidesView />
          </div>
        </div>
      </main>
    </div>
  );
}
