'use client';

import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';

import CustomerRidesView from '@/components/customer/CustomerRidesView';
import { DriverSidebar } from '@/components/driver/navigation/DriverSidebar';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function DriverMyRidesPage() {
    const { t } = useTranslation();

    return (
        <DriverSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><Calendar /></div>
                            <h1 className={styles.title}>{t('driverNavigation.myRides')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('driverNavigation.myRidesDescription')}</p>
                    </div>
                    <div className={styles.ridesSection}>
                        <CustomerRidesView hideHeader={true} />
                    </div>
                </div>
            </div>
        </DriverSidebar>
    );
}
