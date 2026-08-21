'use client';

import { CustomerSidebar } from '@/components/customer/navigation/CustomerSidebar';
import { DriverSidebar } from '@/components/driver/navigation/DriverSidebar';
import { AdminSidebar } from '@/components/admin/navigation/AdminSidebar';
import { useSessionWithRole } from '@/context/SessionContext';

type Props = { children: React.ReactNode };

export function RoleSidebar({ children }: Props) {
    const { isAdmin, isDriver } = useSessionWithRole();
    const Sidebar = isAdmin ? AdminSidebar : isDriver ? DriverSidebar : CustomerSidebar;
    return <Sidebar>{children}</Sidebar>;
}
