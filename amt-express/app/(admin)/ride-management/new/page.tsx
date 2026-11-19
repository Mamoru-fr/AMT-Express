'use client';

// Page /ride-management/new : wrapper mince autour d'AddRideModal (mode page).
// Aucune logique de formulaire ici — tout vit dans le composant (anti-doublon, cf. AGENTS.md).
import { useSearchParams } from 'next/navigation';
import { RoleSidebar } from '@/components/shared/RoleSidebar';
import { AddRideModal } from '@/components/admin/rideManagement/AddRideModal';
import styles from '@/components/dashboard/CustomerDashboard.module.css';

export default function NewRidePage() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? undefined;

  return (
    <RoleSidebar>
      <div className={styles.customerDashboard}>
        <div className={styles.customerInner}>
          <AddRideModal isOpen mode="page" returnTo={returnTo} />
        </div>
      </div>
    </RoleSidebar>
  );
}
