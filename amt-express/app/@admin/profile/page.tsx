'use client';

import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';

import { AdminSidebar } from '@/components/admin/navigation/AdminSidebar';
import { ProfileSection } from '@/components/customer/settings/ProfileSection';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function AdminProfilePage() {
    const { t } = useTranslation();

    return (
        <AdminSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><User /></div>
                            <h1 className={styles.title}>{t('adminNavigation.profile')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('adminNavigation.profileDescription')}</p>
                    </div>
                    <ProfileSection showTitle={false} />
                </div>
            </div>
        </AdminSidebar>
    );
}
