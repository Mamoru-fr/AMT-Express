'use client';

import { useState, useEffect } from 'react';
import { useSessionWithRole } from '@/context/SessionContext';
import { SidebarShell, SidebarSettings } from './Sidebar';
import { adminSidebarData } from '@/components/admin/navigation/AdminSidebar';
import { driverSidebarData } from '@/components/driver/navigation/DriverSidebar';
import { customerSidebarData } from '@/components/customer/navigation/CustomerSidebar';

type Props = {
    children: React.ReactNode;
    forceBottomTabBar?: boolean;
};

// Valeurs par défaut pour les paramètres
const defaultSettings: SidebarSettings = {
    bottomTabBarStyle: 'iconsOnly', // Par défaut: icônes seulement
};

export function RoleSidebar({ children, forceBottomTabBar = false }: Props) {
    const { isAdmin, isDriver } = useSessionWithRole();
    const [settings, setSettings] = useState<SidebarSettings>(defaultSettings);

    // Charger les paramètres depuis localStorage si disponibles
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('sidebarSettings');
            if (savedSettings) {
                try {
                    setSettings(JSON.parse(savedSettings));
                } catch (e) {
                    console.error('Failed to parse sidebar settings', e);
                }
            }
        }
    }, []);

    // Déterminer les données de la sidebar en fonction du rôle
    const getSidebarData = () => {
        if (isAdmin) return adminSidebarData;
        if (isDriver) return driverSidebarData;
        return customerSidebarData;
    };

    const sidebarData = getSidebarData();

    return (
        <SidebarShell
            sidebarData={sidebarData}
            settings={settings}
            forceBottomTabBar={forceBottomTabBar}
        >
            {children}
        </SidebarShell>
    );
}

// Exporter les données des sidebars pour une utilisation externe si nécessaire
export { adminSidebarData, driverSidebarData, customerSidebarData };
