'use client'

/**
 * Recent Rides Table Component
 * Displays the 10 most recent rides with key details
 * Responsive design with different layouts for mobile and desktop
 */

import styles from "./RecentRidesTable.module.css";
import {useTranslation} from 'react-i18next';

type Ride = {
    id: string;
    departure: string;
    destination: string;
    customerName: string | null;
    driverName: string | null;
    price: string;
    status: 'pending' | 'assigned' | 'completed' | 'cancelled';
    departureTime: Date;
};

type Props = {
    rides: Ride[];  // Array of recent rides to display
};

const statusStyles = {
    completed: 'completed',
    assigned: 'assigned',
    pending: 'pending',
    cancelled: 'cancelled'
};

export function RecentRidesTable({rides}: Props) {
    const {t} = useTranslation();
    
    const getStatusText = (status: string) => {
        const statusMap: Record<string, string> = {
            pending: t('ridesManagement.pending', 'Pending'),
            assigned: t('ridesManagement.assigned', 'Assigned'),
            completed: t('ridesManagement.completed', 'Completed'),
            cancelled: t('ridesManagement.cancelled', 'Cancelled')
        };
        return statusMap[status] || status;
    };
    
    return (
        <section className={styles.card}>
            <div className={styles.header}>
                <h3 className={styles.title}>{t('recentRides.title', 'Recent Rides')}</h3>
            </div>
            <div className={styles.list}>
                {/* Show empty state if no rides available */}
                {rides.length === 0 ? (
                    <div className={styles.emptyState}>
                        {t('recentRides.noRidesFound', 'No rides found')}
                    </div>
                ) : (
                    /* Render each ride as a card-style row */
                    rides.map((ride) => (
                        <div key={ride.id} className={styles.row}>
                            <div className={styles.rowMain}>
                                <div className={styles.routeLine}>
                                    <span className={styles.rideId}>#{ride.id}</span>
                                    <div className={styles.routeText}>
                                        <p className={styles.location}>{ride.departure}</p>
                                        <span className={styles.arrow}>→</span>
                                        <p className={styles.location}>{ride.destination}</p>
                                    </div>
                                </div>
                                <div className={styles.meta}>
                                    <div className={styles.metaLine}>
                                        <span className={styles.metaText}>Client: {ride.customerName || 'N/A'}</span>
                                        {ride.driverName && <span className={styles.metaSeparator}>•</span>}
                                        {ride.driverName && <span className={styles.metaText}>Driver: {ride.driverName}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.rowAside}>
                                <span className={styles.date}>
                                    {new Date(ride.departureTime).toLocaleDateString()}
                                </span>
                                <span className={styles.price}>€{ride.price}</span>
                                <span className={`${styles.badge} ${styles[statusStyles[ride.status]]}`}>
                                    {getStatusText(ride.status)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
