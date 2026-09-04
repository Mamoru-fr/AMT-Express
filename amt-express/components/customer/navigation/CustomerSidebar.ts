import {
    LayoutDashboard,
    PlusCircle,
    Calendar,
    Settings,
    User,
    HelpCircle,
    History,
} from 'lucide-react';
import { SidebarData } from '@/components/shared/Sidebar/types';

export const customerSidebarData: SidebarData = {
    navItems: [
        {
            href: '/',
            label: 'customerNavigation.dashboard',
            description: 'customerNavigation.dashboardDescription',
            icon: LayoutDashboard,
            groupId: 'general',
            priority: 1,
            match: (url) => url === '/',
            matchMode: 'exact',
        },
        {
            href: '/rides/booking',
            label: 'customerNavigation.bookRide',
            description: 'customerNavigation.bookRideDescription',
            icon: PlusCircle,
            groupId: 'rides',
            priority: 1,
            match: (url) => url.startsWith('/rides/booking'),
            matchMode: 'ancestor',
        },
        {
            href: '/rides',
            label: 'customerNavigation.myBookings',
            description: 'customerNavigation.myBookingsDescription',
            icon: Calendar,
            groupId: 'rides',
            priority: 2,
            match: (url) => url.startsWith('/rides') && !url.startsWith('/rides/booking'),
            matchMode: 'ancestor',
        },
    ],
    navGroups: [
        {
            id: 'general',
            label: 'customerNavigation.general',
            icon: LayoutDashboard,
            priority: 1,
        },
        {
            id: 'rides',
            label: 'customerNavigation.rides',
            icon: Calendar,
            priority: 2,
        },
    ],
    utilityItems: [
        {
            href: '/settings',
            label: 'customerNavigation.settings',
            icon: Settings,
            type: 'link',
        },
        {
            href: '/profile',
            label: 'customerNavigation.profile',
            icon: User,
            type: 'link',
        },
        {
            label: 'language',
            icon: User,
            type: 'dropdown',
        },
    ],
    brandTitle: 'customerNavigation.brandTitle',
    brandSubtitle: 'customerNavigation.brandSubtitle',
};
