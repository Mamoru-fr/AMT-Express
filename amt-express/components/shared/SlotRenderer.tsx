'use client';

import { usePathname } from 'next/navigation';

// Routes handled by shared app/ pages — slot must be suppressed to avoid double render
const SHARED_ROUTES = ['/rides', '/settings', '/profile'];

export function SlotRenderer({ slot }: { slot: React.ReactNode }) {
    const pathname = usePathname();
    const isShared = SHARED_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
    if (isShared) return null;
    return <>{slot}</>;
}
