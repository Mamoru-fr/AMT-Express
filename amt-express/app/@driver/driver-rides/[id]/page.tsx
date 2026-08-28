'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, MapPin, Clock, Users, DollarSign, Car,
    AlertTriangle, CheckCircle, XCircle, Loader2, Send,
} from 'lucide-react';

import { DriverSidebar } from '@/components/driver/navigation/DriverSidebar';
import { LivingRide } from '@/components/driver/LivingRide';
import { getDriverRideDetail, requestRideAssignment } from '@/lib/actions/driverDashboardActions';
import type { RideWithRelations } from '@/content/database_types/ride';
import dashStyles from '@/components/dashboard/CustomerDashboard.module.css';
import styles from '@/components/shared/RideDetailView.module.css';

const STATUS_ICONS: Record<string, React.ElementType> = {
    pending: Clock,
    assigned: Car,
    completed: CheckCircle,
    cancelled: XCircle,
};

export default function DriverRideDetailPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();

    const [ride, setRide] = useState<RideWithRelations | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [requestPending, startRequestTransition] = useTransition();
    const [requestMessage, setRequestMessage] = useState('');
    const [requestFeedback, setRequestFeedback] = useState<{ ok: boolean; text: string } | null>(null);

    const fetchRide = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await getDriverRideDetail(id);
        if (result.success) {
            setRide(result.data!);
        } else {
            setError(result.error || 'Failed to load ride');
        }
        setLoading(false);
    }, [id]);

    // Silent refresh — updates ride data without triggering the loading state
    const silentRefresh = useCallback(async () => {
        const result = await getDriverRideDetail(id);
        if (result.success) setRide(result.data!);
    }, [id]);

    useEffect(() => { fetchRide(); }, [fetchRide]);

    function handleRequest() {
        startRequestTransition(async () => {
            const result = await requestRideAssignment(id, requestMessage || undefined);
            if (result.success) {
                setRequestFeedback({ ok: true, text: t('driverRides.requestSuccess', 'Request sent successfully!') });
                setRequestMessage('');
                await fetchRide();
            } else {
                setRequestFeedback({ ok: false, text: result.error || t('driverRides.requestFailed', 'Request failed.') });
            }
        });
    }

    function formatDate(date: Date | string | null) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString(undefined, {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    }

    function formatPrice(price: string | number | null) {
        if (!price) return '-';
        return `€${parseFloat(price.toString()).toFixed(2)}`;
    }

    const StatusIcon = ride ? (STATUS_ICONS[ride.status] ?? Clock) : Clock;
    const isAvailable = ride?.status === 'pending' && !ride?.driverId;

    // LivingRide activates 1 hour before departure for assigned rides
    const isLivingRideActive = ride?.status === 'assigned' &&
        (new Date(ride.departureTime).getTime() - Date.now()) <= 60 * 60 * 1000;

    return (
        <DriverSidebar>
            <div className={dashStyles.customerDashboard}>
                <div className={dashStyles.customerInner}>
                    <Link href="/driver-rides" className={styles.backLink}>
                        <ArrowLeft className={styles.backIcon} />
                        {t('driverRides.backToRides', 'Back to my rides')}
                    </Link>

                    {loading && (
                        <div className={styles.centeredBlock}>
                            <Loader2 className={styles.spinner} />
                            <p>{t('driverRides.loading', 'Loading...')}</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className={styles.errorBlock}>
                            <AlertTriangle className={styles.errorIcon} />
                            <p>{error}</p>
                        </div>
                    )}

                    {ride && !loading && (
                        <>
                            {/* Header */}
                            <div className={dashStyles.headerBlock}>
                                <div className={dashStyles.titleRow}>
                                    <div className={dashStyles.titleIcon}><Car /></div>
                                    <h1 className={dashStyles.title}>
                                        {t('rideDetail.title', { id: ride.id.slice(0, 8) })}
                                    </h1>
                                </div>
                                <div className={styles.statusRow}>
                                    <span className={`${styles.statusBadge} ${styles[`status_${ride.status}`]}`}>
                                        <StatusIcon className={styles.statusIcon} />
                                        {t(`ridesManagement.${ride.status}`, ride.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Feedback banner */}
                            {requestFeedback && (
                                <div className={requestFeedback.ok ? styles.alertSuccess : styles.alertError}>
                                    {requestFeedback.ok
                                        ? <CheckCircle className={styles.alertIcon} />
                                        : <AlertTriangle className={styles.alertIcon} />}
                                    {requestFeedback.text}
                                </div>
                            )}

                            {/* Ride info card */}
                            <div className={styles.card}>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <div className={styles.infoItemIcon}><MapPin /></div>
                                        <div>
                                            <p className={styles.infoItemLabel}>{t('rides.departure', 'From')}</p>
                                            <p className={styles.infoItemValue}>{ride.departure}</p>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <div className={styles.infoItemIcon}><MapPin /></div>
                                        <div>
                                            <p className={styles.infoItemLabel}>{t('rideDetail.destination', 'To')}</p>
                                            <p className={styles.infoItemValue}>{ride.destination}</p>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <div className={styles.infoItemIcon}><Clock /></div>
                                        <div>
                                            <p className={styles.infoItemLabel}>{t('rideDetail.departure', 'Departure')}</p>
                                            <p className={styles.infoItemValue}>{formatDate(ride.departureTime)}</p>
                                        </div>
                                    </div>
                                    {ride.arrivalTime && (
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoItemIcon}><Clock /></div>
                                            <div>
                                                <p className={styles.infoItemLabel}>{t('rideDetail.arrival', 'Arrival')}</p>
                                                <p className={styles.infoItemValue}>{formatDate(ride.arrivalTime)}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className={styles.infoItem}>
                                        <div className={styles.infoItemIcon}><DollarSign /></div>
                                        <div>
                                            <p className={styles.infoItemLabel}>{t('rides.price', 'Price')}</p>
                                            <p className={styles.infoItemValue}>{formatPrice(ride.price)}</p>
                                        </div>
                                    </div>
                                    {ride.distanceKm && (
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoItemIcon}><Car /></div>
                                            <div>
                                                <p className={styles.infoItemLabel}>{t('rideDetail.distance', 'Distance')}</p>
                                                <p className={styles.infoItemValue}>{ride.distanceKm} km</p>
                                            </div>
                                        </div>
                                    )}
                                    {ride.waitingTime > 0 && (
                                        <div className={styles.infoItem}>
                                            <div className={styles.infoItemIcon}><Clock /></div>
                                            <div>
                                                <p className={styles.infoItemLabel}>{t('rideDetail.waitingTime', 'Waiting time')}</p>
                                                <p className={styles.infoItemValue}>{ride.waitingTime} min</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Customers */}
                                {ride.customers.length > 0 && (
                                    <div className={styles.notesBlock}>
                                        <p className={styles.notesLabel}>
                                            <Users style={{ display: 'inline', width: '0.875rem', height: '0.875rem', marginRight: '0.375rem', verticalAlign: 'middle' }} />
                                            {t('driverRides.table.customers', 'Customers')}
                                        </p>
                                        <ul style={{ margin: '0.375rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            {ride.customers.map(c => (
                                                <li key={c.id} className={styles.notesValue}>{c.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {ride.customerNotes && (
                                    <div className={styles.notesBlock}>
                                        <p className={styles.notesLabel}>{t('rideDetail.notes', 'Notes')}</p>
                                        <p className={styles.notesValue}>{ride.customerNotes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Request action — only for available rides */}
                            {isAvailable && (
                                <div className={styles.dangerCard} style={{ borderColor: 'var(--app-surface-border)' }}>
                                    <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700, color: 'var(--app-title-color)' }}>
                                        {t('driverRides.requestRideTitle', 'Request this ride')}
                                    </h3>
                                    <textarea
                                        value={requestMessage}
                                        onChange={e => setRequestMessage(e.target.value)}
                                        placeholder={t('driverDashboard.messagePlaceholder', 'Optional message for the admin...')}
                                        rows={3}
                                        style={{
                                            width: '100%', padding: '0.75rem', borderRadius: '0.5rem',
                                            border: '1px solid var(--app-surface-border)', fontSize: '0.875rem',
                                            background: 'var(--app-surface-subtle)', color: 'var(--app-text-color)',
                                            resize: 'vertical', boxSizing: 'border-box', marginBottom: '0.75rem',
                                        }}
                                    />
                                    <button
                                        onClick={handleRequest}
                                        disabled={requestPending}
                                        style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                            padding: '0.625rem 1.25rem', background: 'var(--app-primary)',
                                            color: 'var(--app-primary-text)', border: 'none', borderRadius: '0.5rem',
                                            fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                                            opacity: requestPending ? 0.6 : 1,
                                        }}
                                    >
                                        {requestPending
                                            ? <Loader2 className={styles.btnSpinner} />
                                            : <Send style={{ width: '1rem', height: '1rem' }} />}
                                        {t('driverDashboard.confirmRequest', 'Send Request')}
                                    </button>
                                </div>
                            )}

                            {/* Living Ride — assigned + within 1 hour of departure */}
                            {isLivingRideActive && (
                                <LivingRide ride={ride} onUpdate={silentRefresh} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </DriverSidebar>
    );
}
