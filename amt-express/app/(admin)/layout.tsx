// Garde du groupe admin : s'exécute AVANT le rendu de toute page sous (admin)/.
// Un utilisateur sans rôle admin est redirigé sans qu'aucune page ne soit rendue.
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSessionWithRole } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin } = await getSessionWithRole();
  if (!isAdmin) redirect('/');
  return <>{children}</>;
}
