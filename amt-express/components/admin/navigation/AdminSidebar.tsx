'use client';

import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';
import {ChevronLeft, ChevronRight, LayoutDashboard, Menu, PlusCircle, Route, Sparkles, Settings, User} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {LanguageDropdown} from '@/components/LanguageComponents/LanguageDropdown';
import {signOut} from '@/lib/actions/AuthActions';
import {useSessionWithRole} from '@/context/SessionContext';
import styles from './AdminSidebar.module.css';

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

export function AdminSidebar({children}: Props) {
    const {t} = useTranslation();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [profilePopupOpen, setProfilePopupOpen] = useState(false);
    const profileButtonRef = useRef<HTMLDivElement>(null);
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    
    const {session} = useSessionWithRole();
    const user = session?.user;
    const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
    const userName = user?.name || t('adminNavigation.unknownUser');

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileButtonRef.current && !profileButtonRef.current.contains(event.target as Node)) {
                setProfilePopupOpen(false);
            }
        };
        
        if (profilePopupOpen) {
            // Small delay to allow popup to render before adding listener
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 50);
            
            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
        
        return () => {};
    }, [profilePopupOpen]);

    const closeMobileNav = () => {
        setMobileNavOpen(false);
    };

    const handleProfileClick = () => {
        setProfilePopupOpen(prev => !prev);
    };

    const handleSignOut = async () => {
        await signOut();
        setProfilePopupOpen(false);
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
                    <Link href="/connections" className={styles.utilityItem} onClick={closeMobileNav}>
                        <Settings className={styles.utilityIcon} />
                        <span className={styles.navText}>
                            <span className={styles.navLabel}>{t('adminNavigation.settings')}</span>
                            <span className={styles.navDescription}>{t('adminNavigation.settingsDescription')}</span>
                        </span>
                    </Link>

                    <div className={styles.profileButton} ref={profileButtonRef}>
                        <button
                            type="button"
                            className={styles.utilityItem}
                            onClick={() => {
                                handleProfileClick();
                                closeMobileNav();
                            }}
                            aria-label={t('adminNavigation.profile')}
                        >
                            <div className={styles.profileAvatar}>
                                <span className={styles.profileInitial}>{userInitial}</span>
                            </div>
                            <span className={styles.navText}>
                                <span className={styles.navLabel}>{userName}</span>
                            </span>
                        </button>
                        
                        {profilePopupOpen && (
                            <div className={styles.profilePopup} role="menu" aria-label={t('adminNavigation.profileMenu')}>
                                <Link
                                    href="/profile"
                                    className={styles.profilePopupItem}
                                    onClick={() => setProfilePopupOpen(false)}
                                    role="menuitem"
                                >
                                    <User className={styles.profilePopupIcon} />
                                    <span>{t('adminNavigation.profile')}</span>
                                </Link>
                                <div className={styles.profilePopupDivider} />
                                <div className={styles.profilePopupLanguage}>
                                    <LanguageDropdown variant="popup" />
                                </div>
                                <div className={styles.profilePopupDivider} />
                                <button
                                    type="button"
                                    className={styles.profilePopupItem}
                                    onClick={handleSignOut}
                                    role="menuitem"
                                >
                                    <span>{t('adminNavigation.signOut')}</span>
                                </button>
                            </div>
                        )}
                    </div>
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