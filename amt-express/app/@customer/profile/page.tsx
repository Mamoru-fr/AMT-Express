'use client';

import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import { CustomerSidebar } from '@/components/customer/navigation/CustomerSidebar';
import { ProfileSection } from '@/components/customer/settings/ProfileSection';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function ProfilePage() {
    const { t } = useTranslation();

    return (
        <CustomerSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><User /></div>
                            <h1 className={styles.title}>{t('customerNavigation.profile')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('customerNavigation.profileDescription')}</p>
                    </div>

                    <ProfileSection showTitle={false} />
                </div>
            </div>
        </CustomerSidebar>
    );
}
