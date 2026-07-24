'use client';

import { useTranslation } from 'react-i18next';
import { Settings as SettingsIcon, Bell } from 'lucide-react';

// Components
import { CustomerSidebar } from '@/components/customer/navigation/CustomerSidebar';

// Styles
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function SettingsPage() {
    const { t } = useTranslation();

    return (
        <CustomerSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    {/* Header */}
                    <div className={styles.headerBlock}>
                        <div className={styles.titleRow}>
                            <div className={styles.titleIcon}>
                                <SettingsIcon />
                            </div>
                            <h1 className={styles.title}>{t('customerNavigation.settings')}</h1>
                        </div>
                        <p className={styles.subtitle}>{t('customerNavigation.settingsDescription')}</p>
                    </div>

                    {/* Settings Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Notifications Section */}
                        <div className={styles.ridesSection}>
                            <div className={styles.sectionHeader}>
                                <Bell className={styles.sectionIcon} />
                                <div className={styles.sectionText}>
                                    <h2 className={styles.sectionTitle}>{t('settings.notifications')}</h2>
                                    <p className={styles.sectionDescription}>{t('settings.notificationsDescription')}</p>
                                </div>
                            </div>
                            
                            <div className={styles.emptyBlock}>
                                <p className={styles.emptyText}>{t('settings.notificationsComingSoon')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerSidebar>
    );
}
