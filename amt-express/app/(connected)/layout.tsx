// Garde du groupe (connected) : pages communes à tous les rôles authentifiés
// (settings, profile). Un visiteur non connecté est renvoyé vers la connexion.
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSessionWithRole } from '@/lib/auth/session';

export default async function ConnectedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = await getSessionWithRole();
  if (!isAuthenticated) redirect('/connections');
  return <>{children}</>;
}
