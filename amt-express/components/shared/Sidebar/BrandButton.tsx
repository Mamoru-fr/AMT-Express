'use client';

import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styles from './Sidebar.module.css';

type Props = {
    collapsed: boolean;
    onClick: () => void;
    brandTitle: string;
    brandSubtitle: string;
    containerClassName?: string;
};

export function BrandButton({ collapsed, onClick, brandTitle, brandSubtitle, containerClassName = '' }: Props) {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            className={[styles.brandButton, containerClassName].filter(Boolean).join(' ')}
            onClick={onClick}
            aria-label={collapsed ? t('adminNavigation.expandNavigation') : t('adminNavigation.collapseNavigation')}
        >
            <div className={styles.brandRow}>
                <div className={styles.brandMark}>
                    <Sparkles className={styles.brandIcon} />
                    <span className={styles.brandOverlayIcon} aria-hidden="true">
                        {collapsed ? <ChevronRight className={styles.overlayChevron} /> : <ChevronLeft className={styles.overlayChevron} />}
                    </span>
                </div>
                <div className={styles.brandText}>
                    <div className={styles.brandTitle}>{t(brandTitle)}</div>
                    <div className={styles.brandSubtitle}>{t(brandSubtitle)}</div>
                </div>
            </div>
        </button>
    );
}
