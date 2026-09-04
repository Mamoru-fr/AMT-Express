'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { NavItem as NavItemType } from './types';
import styles from './Sidebar.module.css';

type Props = {
    item: NavItemType;
    onClick?: () => void;
    className?: string;
};

export function SidebarNavItem({ item, onClick, className = '' }: Props) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

    const Icon = item.icon;
    const active = item.match ? item.match(currentUrl) : false;

    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={[
                styles.navItem,
                active
                    ? item.matchMode === 'exact'
                        ? `${styles.navItemActive}`
                        : `${styles.navItemActiveSubtle}`
                    : '',
                className,
            ].filter(Boolean).join(' ')}
            aria-current={active ? (item.matchMode === 'exact' ? 'page' : 'location') : undefined}
        >
            <span className={styles.navIconWrap}>
                <Icon className={styles.navIcon} />
            </span>
            <span className={styles.navText}>
                <span className={styles.navLabel}>{t(item.label)}</span>
                {item.description && (
                    <span className={styles.navDescription}>{t(item.description)}</span>
                )}
            </span>
        </Link>
    );
}
