import {
    LayoutDashboard,
    Route,
    PlusCircle,
    Calendar,
    Settings,
    User,
} from 'lucide-react';
import { SidebarData } from '@/components/shared/Sidebar/types';

export const adminSidebarData: SidebarData = {
    navItems: [
        {
            href: '/',
            label: 'adminNavigation.dashboard',
            description: 'adminNavigation.dashboardDescription',
            icon: LayoutDashboard,
            groupId: 'general',
            priority: 1,
            match: (url) => url === '/',
            matchMode: 'exact',
        },
        {
            href: '/ride-management',
            label: 'adminNavigation.rideManagement',
            description: 'adminNavigation.rideManagementDescription',
            icon: Route,
            groupId: 'rides',
            priority: 1,
            match: (url) => url.startsWith('/ride-management'),
            matchMode: 'ancestor',
        },
        {
            href: '/ride-management/new',
            label: 'adminNavigation.newRide',
            description: 'adminNavigation.newRideDescription',
            icon: PlusCircle,
            groupId: 'rides',
            priority: 2,
            match: (url) => url.startsWith('/ride-management/new'),
            matchMode: 'exact',
        },
        {
            href: '/rides/booking',
            label: 'adminNavigation.bookRide',
            description: 'adminNavigation.bookRideDescription',
            icon: PlusCircle,
            groupId: 'rides',
            priority: 3,
            match: (url) => url.startsWith('/rides/booking'),
            matchMode: 'ancestor',
        },
        {
            href: '/rides',
            label: 'adminNavigation.myRides',
            description: 'adminNavigation.myRidesDescription',
            icon: Calendar,
            groupId: 'rides',
            priority: 4,
            match: (url) => url.startsWith('/rides') && !url.startsWith('/rides/booking'),
            matchMode: 'ancestor',
        },
    ],
    navGroups: [
        {
            id: 'general',
            label: 'adminNavigation.general',
            icon: LayoutDashboard,
            priority: 1,
        },
        {
            id: 'rides',
            label: 'adminNavigation.rides',
            icon: Route,
            priority: 2,
        },
    ],
    utilityItems: [
        {
            href: '/connections',
            label: 'adminNavigation.settings',
            icon: Settings,
            type: 'link',
        },
        {
            href: '/profile',
            label: 'adminNavigation.profile',
            icon: User,
            type: 'link',
        },
        {
            label: 'language',
            icon: User,
            type: 'dropdown',
        },
    ],
    brandTitle: 'adminNavigation.brandTitle',
    brandSubtitle: 'adminNavigation.brandSubtitle',
};
