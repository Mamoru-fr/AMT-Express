'use client';

import { useTranslation } from 'react-i18next';
import { ClipboardList } from 'lucide-react';

import { DriverSidebar } from '@/components/driver/navigation/DriverSidebar';
import DriverRidesView from '@/components/driver/DriverRidesView';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function DriverCoursesPage() {
    const { t } = useTranslation();

    return (
        <DriverSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><ClipboardList /></div>
                            <h1 className={styles.title}>{t('driverNavigation.myCourses')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('driverNavigation.myCoursesDescription')}</p>
                    </div>
                    <DriverRidesView />
                </div>
            </div>
        </DriverSidebar>
    );
}
