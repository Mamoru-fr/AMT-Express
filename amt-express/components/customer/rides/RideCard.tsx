'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, User, Clock, DollarSign, Car } from 'lucide-react';
import { RideWithRelations } from '@/content/database_types/ride';
import styles from './RideCard.module.css';

interface Props {
    ride: RideWithRelations;
    onBook?: (rideId: string) => void;
    showBookButton?: boolean;
    isBooking?: boolean;
}

export function RideCard({ ride, onBook, showBookButton = true, isBooking = false }: Props) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);

    const handleBookClick = async () => {
        if (onBook && ride.id) {
            setIsLoading(true);
            try {
                await onBook(ride.id);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    // Combine local loading state with external isBooking prop
    const shouldShowLoading = isLoading || isBooking;

    function formatDate(date: Date | string | null) {
        if (!date) return "-";
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatPrice(price: string | number | null) {
        if (!price) return "-";
        return `€${parseFloat(price.toString()).toFixed(2)}`;
    }

    const statusClassMap: Record<string, string> = {
        pending: styles.statusPending,
        assigned: styles.statusAssigned,
        completed: styles.statusCompleted,
        cancelled: styles.statusCancelled,
    };
    const statusClass = statusClassMap[ride.status] || styles.statusPending;

    return (
        <article className={styles.card}>
            <div className={styles.header}>
                <div className={styles.rideId}>
                    <Car className={styles.rideIcon} />
                    <span>#{ride.id}</span>
                </div>
                <div className={styles.statusBadge}>
                    <span className={`${styles.statusPill} ${statusClass}`}>
                        {ride.status}
                    </span>
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.routeSection}>
                    <div className={styles.routePoint}>
                        <MapPin className={styles.routeIconFrom} />
                        <div className={styles.routeText}>
                            <span className={styles.routeLabel}>{t('rides.departure')}</span>
                            <span className={styles.routeValue}>{ride.departure}</span>
                        </div>
                    </div>
                    <div className={styles.routeArrow}>→</div>
                    <div className={styles.routePoint}>
                        <MapPin className={styles.routeIconTo} />
                        <div className={styles.routeText}>
                            <span className={styles.routeLabel}>{t('rides.destination')}</span>
                            <span className={styles.routeValue}>{ride.destination}</span>
                        </div>
                    </div>
                </div>

                <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                        <Calendar className={styles.detailIcon} />
                        <div>
                            <span className={styles.detailLabel}>{t('rides.date')}</span>
                            <span className={styles.detailValue}>{formatDate(ride.departureTime)}</span>
                        </div>
                    </div>
                    
                    <div className={styles.detailItem}>
                        <Clock className={styles.detailIcon} />
                        <div>
                            <span className={styles.detailLabel}>{t('rides.duration')}</span>
                            <span className={styles.detailValue}>{t('rides.estimatedDuration')}</span>
                        </div>
                    </div>

                    <div className={styles.detailItem}>
                        <User className={styles.detailIcon} />
                        <div>
                            <span className={styles.detailLabel}>{t('rides.driver')}</span>
                            <span className={styles.detailValue}>
                                {ride.driver?.name || t('rides.notAssigned')}
                            </span>
                        </div>
                    </div>

                    <div className={styles.detailItem}>
                        <DollarSign className={styles.detailIcon} />
                        <div>
                            <span className={styles.detailLabel}>{t('rides.price')}</span>
                            <span className={styles.priceValue}>{formatPrice(ride.price)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {showBookButton && ride.status === 'pending' && (
                <div className={styles.footer}>
                    <button 
                        className={styles.bookButton}
                        onClick={handleBookClick}
                        disabled={shouldShowLoading}
                    >
                        {shouldShowLoading ? (
                            <span className={styles.loadingSpinner}></span>
                        ) : (
                            t('rides.bookRide')
                        )}
                    </button>
                </div>
            )}
        </article>
    );
}
