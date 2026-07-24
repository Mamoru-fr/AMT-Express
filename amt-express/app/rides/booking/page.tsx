'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();
    
    const [rides, setRides] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load initial filter values from URL
    const getInitialParams = () => ({
        departure: searchParams.get('departure') || '',
        destination: searchParams.get('destination') || '',
        date: searchParams.get('date') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || ''
    });

    // Load rides on page mount
    useEffect(() => {
        loadRides(getInitialParams());
    }, []);

    // Check for booking success message
    useEffect(() => {
        if (searchParams.get('bookingSuccess') === 'true') {
            setSuccess(t('rides.bookingSuccess'));
            // Clear the success param after showing
            const timer = setTimeout(() => setSuccess(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, t]);

    const loadRides = useCallback(async (params: any = {}) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await searchAvailableRides(params);
            if (response.success) {
                setRides(response.data || []);
                
                // Update URL with current filters
                const urlParams = new URLSearchParams();
                if (params.departure) urlParams.set('departure', params.departure);
                if (params.destination) urlParams.set('destination', params.destination);
                if (params.date) urlParams.set('date', params.date);
                if (params.minPrice) urlParams.set('minPrice', params.minPrice);
                if (params.maxPrice) urlParams.set('maxPrice', params.maxPrice);
                
                // Use router.replace to update URL without reload
                const newUrl = `/rides/booking${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
                if (newUrl !== window.location.pathname + window.location.search) {
                    window.history.replaceState({}, '', newUrl);
                }
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
        // Show confirmation dialog
        if (!confirm(t('rides.confirmBooking'))) {
            return;
        }
        
        setIsBooking(rideId);
        try {
            const response = await bookRide(rideId);
            if (response.success) {
                setError(null);
                // Redirect to my bookings with success param
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
        setSuccess(null);
        loadRides(params);
    }, [loadRides]);

    const handleClear = useCallback(() => {
        setSuccess(null);
        loadRides({});
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

                    {/* Success Message */}
                    {success && (
                        <div className={styles.successBlock}>
                            <p className={styles.successText}>{success}</p>
                        </div>
                    )}

                    {/* Search Form */}
                    <div className={styles.searchSection}>
                        <RideSearchForm 
                            onSearch={handleSearch}
                            onClear={handleClear}
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
                                <p className={styles.emptySubtext}>
                                    {t('rides.noAvailableRides')}
                                </p>
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
