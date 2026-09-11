'use client';

import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon } from 'lucide-react';

import { RoleSidebar } from '@/components/shared/RoleSidebar';
import { SettingsView } from '@/components/shared/SettingsView';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function SettingsPage() {
    const { t } = useTranslation();

    return (
        <RoleSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}><SettingsIcon /></div>
                            <h1 className={styles.title}>{t('customerNavigation.settings')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('customerNavigation.settingsDescription')}</p>
                    </div>
                    <SettingsView />
                </div>
            </div>
        </RoleSidebar>
    );
}
