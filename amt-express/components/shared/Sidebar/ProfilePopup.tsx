'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageDropdown } from '@/components/LanguageComponents/LanguageDropdown';
import { signOut } from '@/lib/actions/AuthActions';
import { UtilityItem } from './types';
import styles from './Sidebar.module.css';

type Props = {
    addedclass?: string;
    buttonRef: React.RefObject<HTMLDivElement | null>;
    isOpen: boolean;
    onClose: () => void;
    userInitial: string;
    userName: string;
    utilityItems: UtilityItem[];
};

export function ProfilePopup({ userInitial, userName,utilityItems, isOpen, onClose, buttonRef, addedclass }: Props) {
    const { t } = useTranslation();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            const timer = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 50);

            return () => {
                clearTimeout(timer);
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }

        return () => {};
    }, [isOpen, onClose, buttonRef]);

    const handleSignOut = async () => {
        await signOut();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={`${styles.profilePopup} ${addedclass || ''}`} role="menu" aria-label={t('adminNavigation.profileMenu')}>
            {utilityItems.map((item, index) => {
                switch (item.type) {
                    case 'link':
                        return (
                            <Link
                                key={item.href || index}
                                href={item.href || '#'}
                                className={styles.profilePopupItem}
                                onClick={onClose}
                                role="menuitem"
                            >
                                <item.icon className={styles.profilePopupIcon} />
                                <span>{t(item.label)}</span>
                            </Link>
                        );
                    case 'button':
                        return (
                            <button
                                key={index}
                                type="button"
                                className={styles.profilePopupItem}
                                onClick={item.action || onClose}
                                role="menuitem"
                            >
                                <item.icon className={styles.profilePopupIcon} />
                                <span>{t(item.label)}</span>
                            </button>
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
                className={styles.profilePopupItem}
                onClick={handleSignOut}
                role="menuitem"
            >
                <span>{t('adminNavigation.signOut')}</span>
            </button>
        </div>
    );
}
