'use client';

import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';

import { RoleSidebar } from '@/components/shared/RoleSidebar';
import CustomerRidesView from '@/components/customer/CustomerRidesView';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function RidesPage() {
    const { t } = useTranslation();

    return (
        <RoleSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><Calendar /></div>
                            <h1 className={styles.title}>{t('customerNavigation.myBookings')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('customerNavigation.myBookingsDescription')}</p>
                    </div>
                    <CustomerRidesView hideHeader={true} />
                </div>
            </div>
        </RoleSidebar>
    );
}
