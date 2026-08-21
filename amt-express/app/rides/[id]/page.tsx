'use client';

import { RoleSidebar } from '@/components/shared/RoleSidebar';
import { RideDetailView } from '@/components/shared/RideDetailView';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function RideDetailPage() {
    return (
        <RoleSidebar>
            <div className={styles.customerDashboard}>
                <div className={styles.customerInner}>
                    <RideDetailView />
                </div>
            </div>
        </RoleSidebar>
    );
}
