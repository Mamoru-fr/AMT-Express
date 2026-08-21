'use client';

import { useTranslation } from 'react-i18next';
import { PlusCircle } from 'lucide-react';

import { RoleSidebar } from '@/components/shared/RoleSidebar';
import { BookingForm } from '@/components/shared/BookingForm';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function BookingPage() {
    const { t } = useTranslation();

    return (
        <RoleSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><PlusCircle /></div>
                            <h1 className={styles.title}>{t('customerNavigation.bookRide')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('customerNavigation.bookRideDescription')}</p>
                    </div>
                    <BookingForm />
                </div>
            </div>
        </RoleSidebar>
    );
}
