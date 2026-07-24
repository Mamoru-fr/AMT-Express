'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Calendar, AlertCircle } from 'lucide-react';

// Components
import { CustomerSidebar } from '@/components/customer/navigation/CustomerSidebar';
import { RideSearchForm } from '@/components/customer/rides/RideSearchForm';
import { RideCard } from '@/components/customer/rides/RideCard';

// Actions
import { searchAvailableRides, bookRide } from '@/lib/actions/customerRideActions';

// Styles
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function BookingPage() {
    const { t } = useTranslation();
    const router = useRouter();
    
    const [rides, setRides] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searchParams, setSearchParams] = useState({
        departure: '',
        destination: '',
        date: ''
    });

    // Load rides on page mount
    useEffect(() => {
        loadRides();
    }, []);

    const loadRides = useCallback(async (params: any = {}) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await searchAvailableRides(params);
            if (response.success) {
                setRides(response.data || []);
                setSearchParams(params);
            } else {
                setError(response.error || t('rides.searchError'));
                setRides([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('rides.searchError'));
            setRides([]);
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    const handleBook = useCallback(async (rideId: string) => {
        setIsBooking(rideId);
        try {
            const response = await bookRide(rideId);
            if (response.success) {
                // Booking successful, redirect to my rides with success param
                router.push('/rides?bookingSuccess=true');
            } else {
                setError(response.error || t('rides.bookingError'));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t('rides.bookingError'));
        } finally {
            setIsBooking(null);
        }
    }, [router, t]);

    const handleSearch = useCallback((params: any) => {
        loadRides(params);
    }, [loadRides]);

    return (
        <CustomerSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    {/* Header */}
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}>
                                <Calendar />
                            </div>
                            <h1 className={styles.title}>{t('booking.title')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('booking.subtitle')}</p>
                    </div>

                    {/* Search Form */}
                    <div className={styles.searchSection}>
                        <RideSearchForm 
                            onSearch={handleSearch} 
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Results */}
                    <div className={styles.resultsSection}>
                        {error && (
                            <div className={styles.errorBlock}>
                                <AlertCircle className={styles.errorIcon} />
                                <p className={styles.errorText}>{error}</p>
                            </div>
                        )}

                        {isLoading && rides.length === 0 ? (
                            <div className={styles.loadingBlock}>
                                <div className={styles.loadingSpinner}></div>
                                <p>{t('rides.loadingRides')}</p>
                            </div>
                        ) : rides.length === 0 ? (
                            <div className={styles.emptyBlock}>
                                <Calendar className={styles.emptyIcon} />
                                <p className={styles.emptyText}>{t('rides.noRidesFound')}</p>
                                {searchParams.departure || searchParams.destination || searchParams.date ? (
                                    <p className={styles.emptySubtext}>
                                        {t('rides.tryDifferentSearch')}
                                    </p>
                                ) : (
                                    <p className={styles.emptySubtext}>
                                        {t('rides.noAvailableRides')}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className={styles.ridesGrid}>
                                {rides.map((ride) => (
                                    <RideCard
                                        key={ride.id}
                                        ride={ride}
                                        onBook={handleBook}
                                        showBookButton={true}
                                        isBooking={isBooking === ride.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerSidebar>
    );
}
