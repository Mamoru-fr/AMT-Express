'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ClipboardList } from 'lucide-react';

import { useSessionWithRole } from '@/context/SessionContext';
import { RoleSidebar } from '@/components/shared/RoleSidebar';
import DriverRidesView from '@/components/driver/DriverRidesView';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function DriverCoursesPage() {
    const { t } = useTranslation();
    const { isDriver, isAuthenticated } = useSessionWithRole();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated && !isDriver) router.replace('/');
    }, [isAuthenticated, isDriver, router]);

    if (!isDriver) return null;

    return (
        <RoleSidebar>
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
        </RoleSidebar>
    );
}
