'use client';

import { usePathname } from 'next/navigation';

// Routes partagées entre tous les rôles (affichées en dehors des slots)
// Ces routes doivent masquer le slot actif pour éviter un double rendu
const SHARED_ROUTES = [
  '/rides',
  '/rides/booking',
  '/rides/',
  '/settings',
  '/settings/',
  '/profile',
  '/profile/',
];

export function SlotRenderer({ slot }: { slot: React.ReactNode }) {
    const pathname = usePathname();
    
    // Vérifier si l'URL fait partie des routes partagées
    const isShared = SHARED_ROUTES.some(r => {
      if (pathname === r) return true;
      if (pathname.startsWith(r + '/')) return true;
      if (pathname.includes(r)) return true; // Cas comme /rides/booking
      return false;
    });
    
    // Si c'est une route partagée, on ne rend pas le slot
    if (isShared) return null;
    
    // Sinon, on rend le slot (admin, driver ou customer)
    return <>{slot}</>;
}
