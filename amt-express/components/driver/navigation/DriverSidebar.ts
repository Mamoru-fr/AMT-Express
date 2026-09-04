import {
    LayoutDashboard,
    PlusCircle,
    Calendar,
    Settings,
    User,
    ClipboardList,
} from 'lucide-react';
import { SidebarData } from '@/components/shared/Sidebar/types';

export const driverSidebarData: SidebarData = {
    navItems: [
        {
            href: '/',
            label: 'driverNavigation.dashboard',
            description: 'driverNavigation.dashboardDescription',
            icon: LayoutDashboard,
            groupId: 'general',
            priority: 1,
            match: (url) => url === '/',
            matchMode: 'exact',
        },
        {
            href: '/rides/booking',
            label: 'driverNavigation.bookRide',
            description: 'driverNavigation.bookRideDescription',
            icon: PlusCircle,
            groupId: 'rides',
            priority: 1,
            match: (url) => url.startsWith('/rides/booking'),
            matchMode: 'ancestor',
        },
        {
            href: '/rides',
            label: 'driverNavigation.myRides',
            description: 'driverNavigation.myRidesDescription',
            icon: Calendar,
            groupId: 'rides',
            priority: 2,
            match: (url) => url.startsWith('/rides') && !url.startsWith('/rides/booking'),
            matchMode: 'ancestor',
        },
        {
            href: '/driver-rides',
            label: 'driverNavigation.myCourses',
            description: 'driverNavigation.myCoursesDescription',
            icon: ClipboardList,
            groupId: 'rides',
            priority: 3,
            match: (url) => url.startsWith('/driver-rides'),
            matchMode: 'ancestor',
        },
    ],
    navGroups: [
        {
            id: 'general',
            label: 'driverNavigation.general',
            icon: LayoutDashboard,
            priority: 1,
        },
        {
            id: 'rides',
            label: 'driverNavigation.rides',
            icon: ClipboardList,
            priority: 2,
        },
    ],
    utilityItems: [
        {
            href: '/settings',
            label: 'driverNavigation.settings',
            icon: Settings,
            type: 'link',
        },
        {
            href: '/profile',
            label: 'driverNavigation.profile',
            icon: User,
            type: 'link',
        },
        {
            label: 'language',
            icon: User,
            type: 'dropdown',
        },
    ],
    brandTitle: 'driverNavigation.brandTitle',
    brandSubtitle: 'driverNavigation.brandSubtitle',
};
