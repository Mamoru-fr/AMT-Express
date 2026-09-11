'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { User, Settings } from 'lucide-react';
import { NavItem, NavGroup, SidebarSettings, UtilityItem } from './types';
import { signOut } from '@/lib/actions/AuthActions';
import { LanguageDropdown } from '@/components/LanguageComponents/LanguageDropdown';
import styles from './Sidebar.module.css';

type Props = {
    navItems: NavItem[];
    navGroups: NavGroup[];
    settings: SidebarSettings;
    onGroupSelect?: (groupId: string) => void;
    userInitial: string;
    userName: string;
    utilityItems: UtilityItem[];
    profileButtonRef: React.RefObject<HTMLDivElement | null>;
};

type TabItem = {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    href?: string;
    groupId?: string;
    items?: NavItem[];
};

export function BottomTabBar({ navItems, navGroups, settings, onGroupSelect, userInitial, userName, utilityItems, profileButtonRef }: Props) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    const [activeGroupPopup, setActiveGroupPopup] = useState<string | null>(null);
    const [profilePopupOpen, setProfilePopupOpen] = useState(false);
    const groupPopupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const handleProfileClick = () => setProfilePopupOpen((prev) => !prev);

    // Fermer les popups si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profilePopupOpen) {
                if (profileButtonRef.current && !profileButtonRef.current.contains(event.target as Node)) {
                    setProfilePopupOpen(false);
                }
            }
            if (activeGroupPopup) {
                const ref = groupPopupRefs.current[activeGroupPopup];
                if (ref && !ref.contains(event.target as Node)) {
                    setActiveGroupPopup(null);
                }
            }
        };

        if (profilePopupOpen || activeGroupPopup) {
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 50);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }

        return () => {};
    }, [profilePopupOpen, activeGroupPopup, profileButtonRef]);

    // Grouper les navItems par groupId
    const itemsByGroup: { [key: string]: NavItem[] } = {};
    navItems.forEach((item) => {
        if (!itemsByGroup[item.groupId]) {
            itemsByGroup[item.groupId] = [];
        }
        itemsByGroup[item.groupId].push(item);
    });

    // Générer les onglets pour la bottom tab bar
    const getTabItems = (): TabItem[] => {
        const tabItems: TabItem[] = [];

        // Triez les groupes par priorité
        const sortedGroups = [...navGroups].sort((a, b) => a.priority - b.priority);

        for (const group of sortedGroups) {
            const groupItems = itemsByGroup[group.id] || [];
            const sortedGroupItems = [...groupItems].sort((a, b) => (a.priority || 0) - (b.priority || 0));

            // Vérifier si le groupe a des éléments
            if (sortedGroupItems.length === 0) continue;

            // Si le groupe a un seul élément, l'afficher directement
            if (sortedGroupItems.length === 1) {
                const item = sortedGroupItems[0];
                tabItems.push({
                    id: `direct-${item.href}`,
                    label: item.label,
                    icon: item.icon,
                    href: item.href,
                });
            } else {
                // Sinon, créer un onglet de groupe
                tabItems.push({
                    id: `group-${group.id}`,
                    label: group.label,
                    icon: group.icon,
                    groupId: group.id,
                    items: sortedGroupItems,
                });
            }
        }

        return tabItems;
    };

    const tabItems = getTabItems();

    // Déterminer si un onglet est actif
    const isTabActive = (tab: TabItem): boolean => {
        if (tab.href) {
            return currentUrl === tab.href || currentUrl.startsWith(`${tab.href}/`);
        }
        if (tab.groupId && tab.items) {
            return tab.items.some((item) => {
                const match = item.match || ((url: string) => url === item.href);
                return match(currentUrl);
            });
        }
        return false;
    };

    // Fermer les popups si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeGroupPopup) {
                const ref = groupPopupRefs.current[activeGroupPopup];
                if (ref && !ref.contains(event.target as Node)) {
                    setActiveGroupPopup(null);
                }
            }
        };

        if (activeGroupPopup) {
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 50);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }

        return () => {};
    }, [activeGroupPopup]);

    // Style de la bottom tab bar
    const bottomTabBarStyle = settings.bottomTabBarStyle === 'iconsOnly' ?
        `${styles.bottomTabBar} ${styles.bottomTabBarIconsOnly}` :
        styles.bottomTabBar;

    // Séparer les onglets en gauche et droite pour laisser le bouton de profil au centre
    const leftTabs = tabItems.slice(0, Math.floor(tabItems.length / 2));
    const rightTabs = tabItems.slice(Math.floor(tabItems.length / 2));

    return (
        <div className={bottomTabBarStyle}>
            {/* Onglets de gauche */}
            {leftTabs.map((tab) => (
                <div key={tab.id} style={{ position: 'relative' }}>
                    {tab.href ? (
                        <Link
                            href={tab.href}
                            className={[
                                styles.bottomTabItem,
                                isTabActive(tab) ? styles.bottomTabItemActive : '',
                            ].filter(Boolean).join(' ')}
                        >
                            <tab.icon className={styles.bottomTabIcon} />
                            <span className={styles.bottomTabLabel}>{t(tab.label)}</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setActiveGroupPopup((prev) => (prev === tab.id ? null : tab.id));
                                onGroupSelect?.(tab.groupId || '');
                            }}
                            className={[
                                styles.bottomTabItem,
                                isTabActive(tab) ? styles.bottomTabItemActive : '',
                            ].filter(Boolean).join(' ')}
                            aria-label={t(tab.label)}
                        >
                            <tab.icon className={styles.bottomTabIcon} />
                            <span className={styles.bottomTabLabel}>{t(tab.label)}</span>
                        </button>
                    )}
                    {activeGroupPopup === tab.id && tab.items && (
                        <div
                            className={styles.bottomTabNavGroupPopup}
                            ref={(el) => {
                                groupPopupRefs.current[tab.id] = el;
                            }}
                            role="menu"
                        >
                            {tab.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setActiveGroupPopup(null)}
                                        className={styles.navGroupPopupItem}
                                        role="menuitem"
                                    >
                                        <Icon className={styles.navGroupPopupIcon} />
                                        <span className={styles.navGroupPopupLabel}>{t(item.label)}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}

            {/* Bouton de profil au centre */}
            <div
                ref={profileButtonRef}
                style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}
            >
                <button
                    type="button"
                    className={[styles.bottomTabItem, styles.bottomTabProfileItem].filter(Boolean).join(' ')}
                    onClick={handleProfileClick}
                    aria-label={t('adminNavigation.profile')}
                    style={{ padding: 0 }}
                >
                    <div className={styles.profileAvatarBottomTab}>
                        <span className={styles.profileInitialBottomTab}>{userInitial}</span>
                    </div>
                </button>
                {profilePopupOpen && (
                    <div
                        className={styles.bottomTabProfilePopup}
                        role="menu"
                    >
                        {utilityItems.map((item, index) => {
                            switch (item.type) {
                                case 'link':
                                    return (
                                        <Link
                                            key={item.href || index}
                                            href={item.href || '#'}
                                            className={styles.navGroupPopupItem}
                                            onClick={() => setProfilePopupOpen(false)}
                                            role="menuitem"
                                        >
                                            <item.icon className={styles.navGroupPopupIcon} />
                                            <span className={styles.navGroupPopupLabel}>{t(item.label)}</span>
                                        </Link>
                                    );
                                case 'dropdown':
                                    return (
                                        <div key={index} className={styles.profilePopupLanguage}>
                                            <LanguageDropdown variant="popup" />
                                        </div>
                                    );
                                default:
                                    return null;
                            }
                        })}
                        <div className={styles.profilePopupDivider} />
                        <button
                            type="button"
                            className={styles.navGroupPopupItem}
                            onClick={async () => {
                                await signOut();
                                setProfilePopupOpen(false);
                            }}
                            role="menuitem"
                        >
                            <span className={styles.navGroupPopupLabel}>{t('adminNavigation.signOut')}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Onglets de droite */}
            {rightTabs.map((tab) => (
                <div key={tab.id} style={{ position: 'relative' }}>
                    {tab.href ? (
                        <Link
                            href={tab.href}
                            className={[
                                styles.bottomTabItem,
                                isTabActive(tab) ? styles.bottomTabItemActive : '',
                            ].filter(Boolean).join(' ')}
                        >
                            <tab.icon className={styles.bottomTabIcon} />
                            <span className={styles.bottomTabLabel}>{t(tab.label)}</span>
                        </Link>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setActiveGroupPopup((prev) => (prev === tab.id ? null : tab.id));
                                onGroupSelect?.(tab.groupId || '');
                            }}
                            className={[
                                styles.bottomTabItem,
                                isTabActive(tab) ? styles.bottomTabItemActive : '',
                            ].filter(Boolean).join(' ')}
                            aria-label={t(tab.label)}
                        >
                            <tab.icon className={styles.bottomTabIcon} />
                            <span className={styles.bottomTabLabel}>{t(tab.label)}</span>
                        </button>
                    )}
                    {activeGroupPopup === tab.id && tab.items && (
                        <div
                            className={styles.bottomTabNavGroupPopup}
                            ref={(el) => {
                                groupPopupRefs.current[tab.id] = el;
                            }}
                            role="menu"
                        >
                            {tab.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setActiveGroupPopup(null)}
                                        className={styles.navGroupPopupItem}
                                        role="menuitem"
                                    >
                                        <Icon className={styles.navGroupPopupIcon} />
                                        <span className={styles.navGroupPopupLabel}>{t(item.label)}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            ))}

            {/* Popup pour les groupes de profil */}
        </div>
    );
}
