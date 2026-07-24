'use client';

import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';

// Components
import CustomerRidesView from '@/components/customer/CustomerRidesView';
import { CustomerSidebar } from '@/components/customer/navigation/CustomerSidebar';

// Styles
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function MyRidesPage() {
    const { t } = useTranslation();

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
                            <h1 className={styles.title}>{t('customerNavigation.myBookings')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('customerNavigation.myBookingsDescription')}</p>
                    </div>

                    {/* Rides Content */}
                    <div className={styles.ridesSection}>
                        <CustomerRidesView hideHeader={true} />
                    </div>
                </div>
            </div>
        </CustomerSidebar>
    );
}
