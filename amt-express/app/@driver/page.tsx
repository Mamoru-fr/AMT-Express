'use client'

// React and Hooks
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Icons
import { Car, DollarSign, Star, Calendar, MapPin, Clock, Users, CheckCircle, X, AlertTriangle } from 'lucide-react';

// Components
import { DashboardDataCard } from '@/components/specificCards/DashboardDataCard';

// Actions & Types
import { toggleDriverAvailability, requestRideAssignment, fetchDriverDashboard } from '@/lib/actions/driverDashboardActions';
import type { DriverDashboardData } from '@/lib/services/DriverDashboardService';

// Styles
import styles from '@/components/dashboard/DriverDashboard.module.css';
import errorStyles from '../page.module.css';

export default function DriverDashboardPage() {
  const { t } = useTranslation();
  
  // State for data and loading
  const [data, setData] = useState<DriverDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Driver-specific state
  const [isAvailable, setIsAvailable] = useState(false);
  const [requestModal, setRequestModal] = useState<{ open: boolean; rideId: number | null }>({
    open: false,
    rideId: null
  });
  const [requestMessage, setRequestMessage] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Status classes mapping
  const statusClassByValue = {
    pending: styles.statusPending,
    assigned: styles.statusAssigned,
    completed: styles.statusCompleted,
    cancelled: styles.statusCancelled,
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const driverData = await fetchDriverDashboard();
        if (driverData.success) {
          setData(driverData.data);
          setIsAvailable(driverData.data.isAvailable);
          setError(null);
        } else {
          setError(driverData.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Refresh data helper
  const refreshData = async () => {
    try {
      const driverData = await fetchDriverDashboard();
      if (driverData.success) {
        setData(driverData.data);
        setIsAvailable(driverData.data.isAvailable);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  // Availability toggle handler
  const handleAvailabilityToggle = async () => {
    setLoadingAction(true);
    try {
      const newStatus = !isAvailable;
      await toggleDriverAvailability(newStatus);
      setIsAvailable(newStatus);
      await refreshData();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      alert('Failed to update availability');
    } finally {
      setLoadingAction(false);
    }
  };

  // Ride request handler
  const handleRequestRide = async (rideId: number) => {
    setLoadingAction(true);
    try {
      await requestRideAssignment(rideId, requestMessage);
      setRequestModal({ open: false, rideId: null });
      setRequestMessage('');
      await refreshData();
      alert('Ride requested successfully!');
    } catch (error) {
      console.error('Failed to request ride:', error);
      alert('Failed to request ride');
    } finally {
      setLoadingAction(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={errorStyles.homeContainer}>
        <p>Loading dashboard...</p>
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
                <AlertTriangle className={errorStyles.homeErrorIcon} />
              </div>
              <div className={errorStyles.homeTitleSection}>
                <h1 className={errorStyles.homeTitle}>Dashboard Error</h1>
                <p className={errorStyles.homeSubtitle}>
                  Something went wrong while loading your view.
                </p>
              </div>
            </div>
            <div className={errorStyles.homeErrorMessage}>
              <p className={errorStyles.homeErrorText}>
                Error loading dashboard: {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success: Render dashboard
  if (!data) return null;

  return (
    <div className={styles.driverDashboard}>
      <div className={styles.driverInner}>
        {/* Header */}
        <div className={styles.headerBlock}>
          <div>
            <h1 className={styles.title}>
              {t('driverDashboard.title', 'Driver Dashboard')}
            </h1>
            <p className={styles.subtitle}>
              {t('driverDashboard.subtitle', 'Manage your rides and availability')}
            </p>
          </div>

          {/* Availability Toggle */}
          <div className={styles.availabilityCard}>
            <span className={styles.availabilityLabel}>
              {isAvailable ? t('driverDashboard.available', 'Available') : t('driverDashboard.offline', 'Offline')}
            </span>
            <button
              onClick={handleAvailabilityToggle}
              disabled={loadingAction}
              className={`${styles.toggleTrack} ${isAvailable ? styles.toggleTrackEnabled : styles.toggleTrackDisabled} ${loadingAction ? styles.toggleTrackLoading : ''}`}
            >
              <span
                className={`${styles.toggleKnob} ${isAvailable ? styles.toggleKnobEnabled : styles.toggleKnobDisabled}`}
              />
            </button>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className={styles.kpiGrid}>
          <DashboardDataCard
            title={t('driverDashboard.totalRides', 'Total Rides')}
            data={data.stats.totalRides}
            icon={Car}
            iconColor="blue"
          />
          <DashboardDataCard
            title={t('driverDashboard.completedRides', 'Completed')}
            data={data.stats.completedRides}
            icon={CheckCircle}
            iconColor="green"
          />
          <DashboardDataCard
            title={t('driverDashboard.earnings', 'Earnings')}
            data={`€${data.stats.earnings}`}
            icon={DollarSign}
            iconColor="purple"
          />
          <DashboardDataCard
            title={t('driverDashboard.rating', 'Rating')}
            data={`${data.stats.averageRating.toFixed(1)} ⭐`}
            icon={Star}
            iconColor="yellow"
          />
        </div>

        {/* Assigned Rides */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <Calendar className={styles.panelIcon} />
            {t('driverDashboard.assignedRides', 'Your Assigned Rides')}
          </h2>

          {data.assignedRides.length === 0 ? (
            <p className={styles.emptyText}>
              {t('driverDashboard.noAssignedRides', 'No assigned rides at the moment')}
            </p>
          ) : (
            <div className={styles.rideList}>
              {data.assignedRides.map(ride => (
                <div
                  key={ride.id}
                  className={styles.rideCard}
                >
                  <div className={styles.rideCardHeader}>
                    <div>
                      <span className={styles.rideId}>
                        Ride #{ride.id}
                      </span>
                      <span
                        className={`${styles.statusBadge} ${statusClassByValue[ride.status as keyof typeof statusClassByValue] || styles.statusPending}`}
                      >
                        {ride.status}
                      </span>
                    </div>
                    <div className={styles.ridePrice}>€{ride.price}</div>
                  </div>

                  <div className={styles.rideGrid}>
                    <div className={styles.metaItem}>
                      <Clock className={styles.metaIcon} />
                      <div>
                        <div className={styles.metaHeading}>
                          {new Date(ride.departureTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className={styles.metaValue}>
                          {new Date(ride.departureTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>

                    <div className={styles.metaItem}>
                      <Users className={styles.metaIcon} />
                      <div>
                        <div className={styles.metaHeading}>Clients</div>
                        <div className={styles.metaValue}>
                          {ride.customers.map(c => c.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.routeBlock}>
                    <div className={styles.routeRow}>
                      <MapPin className={styles.routeIconFrom} />
                      <span className={styles.routeLabel}>From:</span>
                      <span className={styles.routeText}>{ride.departure}</span>
                    </div>
                    <div className={styles.routeRow}>
                      <MapPin className={styles.routeIconTo} />
                      <span className={styles.routeLabel}>To:</span>
                      <span className={styles.routeText}>{ride.destination}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Suggested Rides */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>
            <Car className={styles.panelIconSuccess} />
            {t('driverDashboard.suggestedRides', 'Available Rides')}
          </h2>

          {data.suggestedRides.length === 0 ? (
            <p className={styles.emptyText}>
              {t('driverDashboard.noSuggestedRides', 'No rides available at the moment')}
            </p>
          ) : (
            <div className={styles.suggestedGrid}>
              {data.suggestedRides.map(ride => (
                <div
                  key={ride.id}
                  className={styles.suggestedCard}
                >
                  <div className={styles.suggestedHeader}>
                    <span className={styles.suggestedRideId}>Ride #{ride.id}</span>
                    <div className={styles.suggestedPrice}>€{ride.price}</div>
                  </div>

                  <div className={styles.suggestedBody}>
                    <div className={styles.suggestedMetaRow}>
                      <Clock className={styles.suggestedMetaIcon} />
                      <span className={styles.suggestedMetaText}>
                        {new Date(ride.departureTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <div className={styles.suggestedMetaRow}>
                      <MapPin className={styles.routeIconFrom} />
                      <span className={styles.suggestedRouteText}>{ride.departure}</span>
                    </div>

                    <div className={styles.suggestedMetaRow}>
                      <MapPin className={styles.routeIconTo} />
                      <span className={styles.suggestedRouteText}>{ride.destination}</span>
                    </div>

                    {ride.customers.length > 0 && (
                      <div className={styles.suggestedMetaRow}>
                        <Users className={styles.suggestedMetaIcon} />
                        <span className={styles.suggestedCustomerText}>
                          {ride.customers.map(c => c.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setRequestModal({ open: true, rideId: ride.id })}
                    disabled={loadingAction}
                    className={styles.requestButton}
                  >
                    {t('driverDashboard.requestRide', 'Request This Ride')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Request Modal */}
        {requestModal.open && requestModal.rideId && (
          <div className={styles.modalBackdrop}>
            <div className={styles.modalCard}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>
                  {t('driverDashboard.requestRideTitle', 'Request Ride Assignment')}
                </h3>
                <button
                  onClick={() => setRequestModal({ open: false, rideId: null })}
                  className={styles.modalCloseButton}
                >
                  <X className={styles.modalCloseIcon} />
                </button>
              </div>

              <p className={styles.modalDescription}>
                {t('driverDashboard.requestMessage', 'Add an optional message for the admin:')}
              </p>

              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={t('driverDashboard.messagePlaceholder', 'I am available and ready for this ride...')}
                className={styles.modalTextarea}
                rows={4}
              />

              <div className={styles.modalActions}>
                <button
                  onClick={() => setRequestModal({ open: false, rideId: null })}
                  className={styles.modalCancelButton}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={() => handleRequestRide(requestModal.rideId!)}
                  disabled={loadingAction}
                  className={styles.modalConfirmButton}
                >
                  {t('driverDashboard.confirmRequest', 'Send Request')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

