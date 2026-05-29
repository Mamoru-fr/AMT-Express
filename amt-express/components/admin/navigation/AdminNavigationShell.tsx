'use client';

import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';
import {ChevronLeft, ChevronRight, LayoutDashboard, Menu, PlusCircle, Route, Sparkles, Settings2, HelpCircle} from 'lucide-react';
import {useState} from 'react';
import {LanguageDropdown} from '@/components/LanguageComponents/LanguageDropdown';
import styles from './AdminNavigationShell.module.css';

type NavItem = {
    href: string;
    label: string;
    description: string;
    icon: React.ComponentType<{className?: string}>;
    match: (url: string) => boolean;
    matchMode: 'exact' | 'ancestor';
};

const navItems: NavItem[] = [
    {
        href: '/',
        label: 'Dashboard',
        description: 'Overview',
        icon: LayoutDashboard,
        match: (url) => url === '/',
        matchMode: 'exact',
    },
    {
        href: '/admin/ride-management',
        label: 'Ride Management',
        description: 'Manage rides',
        icon: Route,
        match: (url) => url.startsWith('/admin/ride-management'),
        matchMode: 'ancestor',
    },
    {
        href: '/admin/ride-management/new',
        label: 'New Ride',
        description: 'Create a ride',
        icon: PlusCircle,
        match: (url) => url.startsWith('/admin/ride-management/new'),
        matchMode: 'exact',
    },
];

type Props = {
    children: React.ReactNode;
};

export function AdminNavigationShell({children}: Props) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [collapsed, setCollapsed] = useState(false);
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    return (
        <div className={collapsed ? `${styles.shell} ${styles.shellCollapsed}` : styles.shell} data-collapsed={collapsed ? 'true' : 'false'}>
            <aside className={styles.sidebar}>
                <button
                    type="button"
                    className={styles.brandButton}
                    onClick={() => setCollapsed(previous => !previous)}
                    aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
                >
                    <div className={styles.brandRow}>
                        <div className={styles.brandMark}>
                            <Sparkles className={styles.brandIcon} />
                            <span className={styles.brandOverlayIcon} aria-hidden="true">
                                {collapsed ? <ChevronRight className={styles.overlayChevron} /> : <ChevronLeft className={styles.overlayChevron} />}
                            </span>
                        </div>
                    <div className={styles.brandText}>
                        <div className={styles.brandTitle}>AMT Express</div>
                        <div className={styles.brandSubtitle}>Workspace</div>
                    </div>
                    </div>
                </button>

                <div className={styles.sectionLabel}>Navigation</div>

                <nav className={styles.nav} aria-label="Admin navigation">
                    {navItems.map((item) => {
                        const active = item.match(currentUrl);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={
                                    active
                                        ? item.matchMode === 'exact'
                                            ? `${styles.navItem} ${styles.navItemActive}`
                                            : `${styles.navItem} ${styles.navItemActiveSubtle}`
                                        : styles.navItem
                                }
                                aria-current={active ? (item.matchMode === 'exact' ? 'page' : 'location') : undefined}
                            >
                                <span className={styles.navIconWrap}>
                                    <Icon className={styles.navIcon} />
                                </span>
                                <span className={styles.navText}>
                                    <span className={styles.navLabel}>{item.label}</span>
                                    <span className={styles.navDescription}>{item.description}</span>
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.bottomSection}>
                    <LanguageDropdown variant="sidebar" className={styles.languageBlock} />

                    <Link href="/connections" className={styles.utilityItem}>
                        <Settings2 className={styles.utilityIcon} />
                        <span className={styles.navText}>
                            <span className={styles.navLabel}>Settings</span>
                            <span className={styles.navDescription}>Connection area</span>
                        </span>
                    </Link>

                    <Link href="/connections" className={styles.utilityItem}>
                        <HelpCircle className={styles.utilityIcon} />
                        <span className={styles.navText}>
                            <span className={styles.navLabel}>Help</span>
                            <span className={styles.navDescription}>Get support</span>
                        </span>
                    </Link>
                </div>

                <button
                    type="button"
                    className={styles.mobileToggle}
                    onClick={() => setCollapsed(previous => !previous)}
                >
                    <Menu className={styles.mobileToggleIcon} />
                    <span>{collapsed ? 'Open navigation' : 'Collapse navigation'}</span>
                </button>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}