// Garde du groupe driver : s'exécute AVANT le rendu de toute page sous (driver)/.
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSessionWithRole } from '@/lib/auth/session';

export default async function DriverLayout({ children }: { children: ReactNode }) {
  const { isDriver } = await getSessionWithRole();
  if (!isDriver) redirect('/');
  return <>{children}</>;
}
