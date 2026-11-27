// Dispatcher du dashboard racine : une seule page pour l'URL "/",
// le rôle lu en session serveur décide du dashboard rendu.
// (Remplace l'ancien hack "return null" + slots @admin/@driver/@customer.)
import { redirect } from 'next/navigation';
import { getSessionWithRole } from '@/lib/auth/session';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import DriverDashboard from '@/components/dashboard/DriverDashboard';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';

export default async function HomePage() {
  const { isAdmin, isDriver, isCustomer } = await getSessionWithRole();

  // Priorité : admin > driver > customer (comportement historique validé)
  if (isAdmin) return <AdminDashboard />;
  if (isDriver) return <DriverDashboard />;
  if (isCustomer) return <CustomerDashboard />;

  // Non connecté (ou rôle invalide/banni) → page de connexion
  redirect('/connections');
}
