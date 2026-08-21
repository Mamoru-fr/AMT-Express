'use client';

import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';

import CustomerRidesView from '@/components/customer/CustomerRidesView';
import { AdminSidebar } from '@/components/admin/navigation/AdminSidebar';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function AdminMyRidesPage() {
    const { t } = useTranslation();

    return (
        <AdminSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><Calendar /></div>
                            <h1 className={styles.title}>{t('adminNavigation.myRides')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('adminNavigation.myRidesDescription')}</p>
                    </div>
                    <div className={styles.ridesSection}>
                        <CustomerRidesView hideHeader={true} />
                    </div>
                </div>
            </div>
        </AdminSidebar>
    );
}
