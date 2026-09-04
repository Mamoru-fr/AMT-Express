'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu, Sparkles, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSessionWithRole } from '@/context/SessionContext';
import {
    NavItem as NavItemType,
    NavGroup,
    UtilityItem,
    SidebarSettings,
    SidebarData,
} from './types';
import { BrandButton } from './BrandButton';
import { SidebarNavItem } from './NavItem';
import { BottomTabBar } from './BottomTabBar';
import { ProfilePopup } from './ProfilePopup';
import styles from './Sidebar.module.css';

type Props = {
    children: React.ReactNode;
    sidebarData: SidebarData;
    settings: SidebarSettings;
    isMobile?: boolean;
    forceBottomTabBar?: boolean;
};

export function SidebarShell({ children, sidebarData, settings, forceBottomTabBar = false }: Props) {
    const { t } = useTranslation();
    const { session } = useSessionWithRole();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    const [collapsed, setCollapsed] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [profilePopupOpen, setProfilePopupOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const profileButtonRef = useRef<HTMLDivElement>(null);

    const user = session?.user;
    const userInitial = user?.name?.charAt(0).toUpperCase() || 'U';
    const userName = user?.name || t('adminNavigation.unknownUser');

    // Détecter si on est sur mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth <= 820);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => window.removeEventListener('resize', checkIfMobile);
    }, []);

    // Fermer la sidebar mobile si l'URL change
    useEffect(() => {
        if (mobileNavOpen) {
            setMobileNavOpen(false);
        }
    }, [currentUrl]);

    // Fermer les popups si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileButtonRef.current && !profileButtonRef.current.contains(event.target as Node)) {
                setProfilePopupOpen(false);
            }
        };

        if (profilePopupOpen) {
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

    const closeMobileNav = () => setMobileNavOpen(false);
    const handleProfileClick = () => setProfilePopupOpen((prev) => !prev);

    // Grouper les navItems par groupId
    const itemsByGroup: { [key: string]: NavItemType[] } = {};
    sidebarData.navItems.forEach((item) => {
        if (!itemsByGroup[item.groupId]) {
            itemsByGroup[item.groupId] = [];
        }
        itemsByGroup[item.groupId].push(item);
    });

    // Filtrer les groupes qui ont au moins un navItem
    const activeNavGroups = sidebarData.navGroups.filter(
        (group) => itemsByGroup[group.id] && itemsByGroup[group.id].length > 0
    );

    // Déterminer si on affiche la sidebar ou la bottom tab bar
    const showBottomTabBar = forceBottomTabBar || isMobile;

    // Class pour le shell
    const shellClassName = [
        styles.shell,
        collapsed ? styles.shellCollapsed : '',
        mobileNavOpen ? styles.shellMobileOpen : '',
        showBottomTabBar ? styles.hideSidebarOnMobile : '',
        forceBottomTabBar ? styles.forceBottomTabBar : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={shellClassName}
            data-collapsed={collapsed ? 'true' : 'false'}
            data-mobile-open={mobileNavOpen ? 'true' : 'false'}
        >
            {/* Ajouter la Bottom Tab Bar pour mobile ou si forcé */}
            {showBottomTabBar && (
                <BottomTabBar
                    navItems={sidebarData.navItems}
                    navGroups={sidebarData.navGroups}
                    settings={settings}
                    userInitial={userInitial}
                    userName={userName}
                    utilityItems={sidebarData.utilityItems}
                    profileButtonRef={profileButtonRef}
                />
            )}

            {/* Bouton pour ouvrir la sidebar sur mobile (si on n'a pas forcé la bottom tab bar) */}
            {!forceBottomTabBar && (
                <button
                    type="button"
                    className={styles.mobileLauncher}
                    onClick={() => setMobileNavOpen((previous) => !previous)}
                    aria-label={mobileNavOpen ? t('adminNavigation.closeNavigation') : t('adminNavigation.openNavigation')}
                    aria-expanded={mobileNavOpen}
                >
                    <Sparkles className={styles.mobileLauncherIcon} />
                </button>
            )}

            <button
                type="button"
                className={styles.mobileBackdrop}
                aria-label={t('adminNavigation.closeNavigation')}
                onClick={closeMobileNav}
            />

            {/* Sidebar (masquée sur mobile si on affiche la bottom tab bar) */}
            <aside className={styles.sidebar}>
                <BrandButton
                    collapsed={collapsed}
                    onClick={() => {
                        if (isMobile) {
                            setMobileNavOpen((previous) => !previous);
                            return;
                        }
                        setCollapsed((previous) => !previous);
                    }}
                    brandTitle={sidebarData.brandTitle}
                    brandSubtitle={sidebarData.brandSubtitle}
                />

                <div className={styles.sectionLabel}>{t('adminNavigation.navigation')}</div>

                <nav className={styles.nav} aria-label={t('adminNavigation.navigation')}>
                    {sidebarData.navItems.map((item) => (
                        <SidebarNavItem key={item.href} item={item} onClick={closeMobileNav} />
                    ))}
                </nav>

                <div className={styles.bottomSection}>
                    {/* Lien vers les paramètres */}
                    <Link
                        href="/settings"
                        className={styles.utilityItem}
                        onClick={closeMobileNav}
                    >
                        <Settings className={styles.utilityIcon} />
                        <span className={styles.navText}>
                            <span className={styles.navLabel}>{t('adminNavigation.settings')}</span>
                            <span className={styles.navDescription}>{t('adminNavigation.settingsDescription')}</span>
                        </span>
                    </Link>

                    {/* Bouton de profil avec popup */}
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

                        <ProfilePopup
                            userInitial={userInitial}
                            userName={userName}
                            utilityItems={sidebarData.utilityItems}
                            isOpen={profilePopupOpen}
                            onClose={() => setProfilePopupOpen(false)}
                            buttonRef={profileButtonRef}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.mobileToggle}
                    onClick={() => setMobileNavOpen((previous) => !previous)}
                >
                    <Menu className={styles.mobileToggleIcon} />
                    <span>{collapsed ? t('adminNavigation.openNavigation') : t('adminNavigation.collapseNavigation')}</span>
                </button>
            </aside>

            <main className={styles.main}>{children}</main>
        </div>
    );
}
