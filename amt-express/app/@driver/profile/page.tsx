'use client';

import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';

import { DriverSidebar } from '@/components/driver/navigation/DriverSidebar';
import { ProfileSection } from '@/components/customer/settings/ProfileSection';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function DriverProfilePage() {
    const { t } = useTranslation();

    return (
        <DriverSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><User /></div>
                            <h1 className={styles.title}>{t('driverNavigation.profile')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('driverNavigation.profileDescription')}</p>
                    </div>
                    <ProfileSection showTitle={false} />
                </div>
            </div>
        </DriverSidebar>
    );
}
