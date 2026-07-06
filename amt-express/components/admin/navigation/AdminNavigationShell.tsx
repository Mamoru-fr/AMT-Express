'use client';

import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';
import {ChevronLeft, ChevronRight, LayoutDashboard, Menu, PlusCircle, Route, Sparkles, Settings2, HelpCircle} from 'lucide-react';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
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

type Props = {
    children: React.ReactNode;
};

export function AdminNavigationShell({children}: Props) {
    const {t} = useTranslation();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    const navItems: NavItem[] = [
        {
            href: '/',
            label: t('adminNavigation.dashboard'),
            description: t('adminNavigation.dashboardDescription'),
            icon: LayoutDashboard,
            match: (url) => url === '/',
            matchMode: 'exact',
        },
        {
            href: '/ride-management',
            label: t('adminNavigation.rideManagement'),
            description: t('adminNavigation.rideManagementDescription'),
            icon: Route,
            match: (url) => url.startsWith('/ride-management'),
            matchMode: 'ancestor',
        },
        {
            href: '/ride-management/new',
            label: t('adminNavigation.newRide'),
            description: t('adminNavigation.newRideDescription'),
            icon: PlusCircle,
            match: (url) => url.startsWith('/ride-management/new'),
            matchMode: 'exact',
        },
    ];

    useEffect(() => {
        // Only close mobile nav if it's currently open to avoid unnecessary state updates
        if (mobileNavOpen) {
            setMobileNavOpen(false);
        }
    }, [currentUrl, mobileNavOpen]);

    const closeMobileNav = () => {
        setMobileNavOpen(false);
    };

    return (
        <div
            className={[
                styles.shell,
                collapsed ? styles.shellCollapsed : '',
                mobileNavOpen ? styles.shellMobileOpen : '',
            ].filter(Boolean).join(' ')}
            data-collapsed={collapsed ? 'true' : 'false'}
            data-mobile-open={mobileNavOpen ? 'true' : 'false'}
        >
            <button
                type="button"
                className={styles.mobileLauncher}
                onClick={() => setMobileNavOpen(previous => !previous)}
                aria-label={mobileNavOpen ? t('adminNavigation.closeNavigation') : t('adminNavigation.openNavigation')}
                aria-expanded={mobileNavOpen}
            >
                <Sparkles className={styles.mobileLauncherIcon} />
            </button>

            <button
                type="button"
                className={styles.mobileBackdrop}
                aria-label={t('adminNavigation.closeNavigation')}
                onClick={closeMobileNav}
            />

            <aside className={styles.sidebar}>
                <button
                    type="button"
                    className={styles.brandButton}
                    onClick={() => {
                        if (window.innerWidth <= 820) {
                            setMobileNavOpen(previous => !previous);
                            return;
                        }

                        setCollapsed(previous => !previous);
                    }}
                    aria-label={mobileNavOpen ? t('adminNavigation.closeNavigation') : collapsed ? t('adminNavigation.expandNavigation') : t('adminNavigation.collapseNavigation')}
                >
                    <div className={styles.brandRow}>
                        <div className={styles.brandMark}>
                            <Sparkles className={styles.brandIcon} />
                            <span className={styles.brandOverlayIcon} aria-hidden="true">
                                {collapsed ? <ChevronRight className={styles.overlayChevron} /> : <ChevronLeft className={styles.overlayChevron} />}
                            </span>
                        </div>
                    <div className={styles.brandText}>
                        <div className={styles.brandTitle}>{t('adminNavigation.brandTitle')}</div>
                        <div className={styles.brandSubtitle}>{t('adminNavigation.brandSubtitle')}</div>
                    </div>
                    </div>
                </button>

                <div className={styles.sectionLabel}>{t('adminNavigation.navigation')}</div>

                <nav className={styles.nav} aria-label={t('adminNavigation.navigation')}>
                    {navItems.map((item) => {
                        const active = item.match(currentUrl);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeMobileNav}
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

                    <Link href="/connections" className={styles.utilityItem} onClick={closeMobileNav}>
                        <Settings2 className={styles.utilityIcon} />
                        <span className={styles.navText}>
                            <span className={styles.navLabel}>{t('adminNavigation.settings')}</span>
                            <span className={styles.navDescription}>{t('adminNavigation.settingsDescription')}</span>
                        </span>
                    </Link>

                    <Link href="/connections" className={styles.utilityItem} onClick={closeMobileNav}>
                        <HelpCircle className={styles.utilityIcon} />
                        <span className={styles.navText}>
                            <span className={styles.navLabel}>{t('adminNavigation.help')}</span>
                            <span className={styles.navDescription}>{t('adminNavigation.helpDescription')}</span>
                        </span>
                    </Link>
                </div>

                <button
                    type="button"
                    className={styles.mobileToggle}
                    onClick={() => setMobileNavOpen(previous => !previous)}
                >
                    <Menu className={styles.mobileToggleIcon} />
                    <span>{collapsed ? t('adminNavigation.openNavigation') : t('adminNavigation.collapseNavigation')}</span>
                </button>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}