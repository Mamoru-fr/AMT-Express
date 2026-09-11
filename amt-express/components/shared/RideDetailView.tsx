'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, User, DollarSign, Car, AlertTriangle, CheckCircle, XCircle, Loader2, Ban } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/classicComponents/Button';

import { getCustomerRideDetail, cancelBooking } from '@/lib/actions/customerRideActions';
import { RideWithRelations } from '@/content/database_types/ride';
import dashStyles from '@/components/dashboard/CustomerDashboard.module.css';
import styles from './RideDetailView.module.css';

const STATUS_ICONS: Record<string, React.ElementType> = {
    pending: Clock,
    assigned: Car,
    completed: CheckCircle,
    cancelled: XCircle,
};

export function RideDetailView() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [ride, setRide] = useState<RideWithRelations | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancelPending, startCancelTransition] = useTransition();
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const fetchRide = useCallback(async () => {
        setLoading(true);
        setError(null);
        const result = await getCustomerRideDetail(id);
        if (result.success) {
            setRide(result.data!);
        } else {
            setError(result.error || t('rideDetail.fetchError'));
        }
        setLoading(false);
    }, [id, t]);

    useEffect(() => { fetchRide(); }, [fetchRide]);

    function canCancel(ride: RideWithRelations): boolean {
        if (ride.status === 'completed' || ride.status === 'cancelled') return false;
        const ONE_HOUR_MS = 60 * 60 * 1000;
        return new Date(ride.departureTime).getTime() - Date.now() >= ONE_HOUR_MS;
    }

    function handleCancel() {
        startCancelTransition(async () => {
            const result = await cancelBooking(id);
            if (result.success) {
                setShowConfirm(false);
                router.push('/rides');
            } else {
                setCancelError(result.error || t('rideDetail.cancelError'));
                setShowConfirm(false);
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

    return (
        <>
            <Link href="/rides" className={styles.backLink}>
                <ArrowLeft className={styles.backIcon} />
                {t('rideDetail.backToRides')}
            </Link>

            {loading && (
                <div className={styles.centeredBlock}>
                    <Loader2 className={styles.spinner} />
                    <p>{t('rides.loadingRides')}</p>
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
                                {t(`ridesManagement.${ride.status}`)}
                            </span>
                        </div>
                    </div>

                    {cancelError && (
                        <div className={styles.alertError}>
                            <AlertTriangle className={styles.alertIcon} />
                            {cancelError}
                        </div>
                    )}

                    <div className={styles.card}>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <div className={styles.infoItemIcon}><MapPin /></div>
                                <div>
                                    <p className={styles.infoItemLabel}>{t('rides.departure')}</p>
                                    <p className={styles.infoItemValue}>{ride.departure}</p>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoItemIcon}><MapPin /></div>
                                <div>
                                    <p className={styles.infoItemLabel}>{t('rideDetail.destination')}</p>
                                    <p className={styles.infoItemValue}>{ride.destination}</p>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoItemIcon}><Clock /></div>
                                <div>
                                    <p className={styles.infoItemLabel}>{t('rideDetail.departure')}</p>
                                    <p className={styles.infoItemValue}>{formatDate(ride.departureTime)}</p>
                                </div>
                            </div>
                            {ride.arrivalTime && (
                                <div className={styles.infoItem}>
                                    <div className={styles.infoItemIcon}><Clock /></div>
                                    <div>
                                        <p className={styles.infoItemLabel}>{t('rideDetail.arrival')}</p>
                                        <p className={styles.infoItemValue}>{formatDate(ride.arrivalTime)}</p>
                                    </div>
                                </div>
                            )}
                            <div className={styles.infoItem}>
                                <div className={styles.infoItemIcon}><DollarSign /></div>
                                <div>
                                    <p className={styles.infoItemLabel}>{t('rides.price')}</p>
                                    <p className={styles.infoItemValue}>{formatPrice(ride.price)}</p>
                                </div>
                            </div>
                            <div className={styles.infoItem}>
                                <div className={styles.infoItemIcon}><User /></div>
                                <div>
                                    <p className={styles.infoItemLabel}>{t('rides.driver')}</p>
                                    <p className={styles.infoItemValue}>
                                        {ride.driver?.name || t('rides.notAssigned')}
                                    </p>
                                </div>
                            </div>
                            {ride.distanceKm && (
                                <div className={styles.infoItem}>
                                    <div className={styles.infoItemIcon}><Car /></div>
                                    <div>
                                        <p className={styles.infoItemLabel}>{t('rideDetail.distance')}</p>
                                        <p className={styles.infoItemValue}>{ride.distanceKm} km</p>
                                    </div>
                                </div>
                            )}
                            {ride.waitingTime > 0 && (
                                <div className={styles.infoItem}>
                                    <div className={styles.infoItemIcon}><Clock /></div>
                                    <div>
                                        <p className={styles.infoItemLabel}>{t('rideDetail.waitingTime')}</p>
                                        <p className={styles.infoItemValue}>{ride.waitingTime} min</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {ride.customerNotes && (
                            <div className={styles.notesBlock}>
                                <p className={styles.notesLabel}>{t('rideDetail.notes')}</p>
                                <p className={styles.notesValue}>{ride.customerNotes}</p>
                            </div>
                        )}
                    </div>

                    {canCancel(ride) && (
                        <div className={styles.dangerCard}>
                            <div className={styles.dangerHeader}>
                                <Ban className={styles.dangerIcon} />
                                <div>
                                    <p className={styles.dangerTitle}>{t('rideDetail.cancelTitle')}</p>
                                    <p className={styles.dangerDesc}>{t('rideDetail.cancelDesc')}</p>
                                </div>
                            </div>
                            {!showConfirm ? (
                                <Button
                                    variant="danger"
                                    onClick={() => { setShowConfirm(true); setCancelError(null); }}
                                >
                                    {t('rideDetail.cancelRide')}
                                </Button>
                            ) : (
                                <div className={styles.confirmBlock}>
                                    <p className={styles.confirmText}>{t('rideDetail.cancelConfirm')}</p>
                                    <div className={styles.confirmActions}>
                                        <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={cancelPending}>
                                            {t('customerDashboard.cancel')}
                                        </Button>
                                        <Button variant="danger" onClick={handleCancel} disabled={cancelPending} isPending={cancelPending} pendingText={t('rideDetail.confirmCancel')}>
                                            {t('rideDetail.confirmCancel')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {ride.status === 'cancelled' && (
                        <p className={styles.cancelledNote}>{t('rideDetail.alreadyCancelled')}</p>
                    )}
                </>
            )}
        </>
    );
}
