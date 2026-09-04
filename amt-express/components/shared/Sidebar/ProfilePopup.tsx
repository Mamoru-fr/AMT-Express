'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
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

export function ProfilePopup({ userInitial, userName, utilityItems, isOpen, onClose, buttonRef, addedclass }: Props) {
    const { t } = useTranslation();
    const [isSigningOut, setIsSigningOut] = useState(false);

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
        setIsSigningOut(true);
        try {
            await signOut();
        } catch (error) {
            console.error('Failed to sign out:', error);
        } finally {
            setIsSigningOut(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`${styles.profilePopup} ${addedclass || ''}`} role="menu" aria-label={t('adminNavigation.profileMenu')}>
            {/* Afficher les utilityItems (sauf signOut qui est géré séparément) */}
            {utilityItems.map((item, index) => {
                // Ignorer les items de type 'action' avec action='signOut' (géré plus bas)
                if (item.type === 'action' && item.action === 'signOut') {
                    return null;
                }

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
                    case 'action':
                        return null; // Les actions sont gérées séparément (ex: signOut)
                    case 'dropdown':
                        return (
                            <div key={index} className={styles.profilePopupLanguage}>
                                <LanguageDropdown variant="popup" onSelect={onClose} />
                            </div>
                        );
                    default:
                        return null;
                }
            })}
            
            {/* Bouton de déconnexion (séparé pour être toujours présent) */}
            <div className={styles.profilePopupDivider} />
            <button
                type="button"
                className={styles.profilePopupItem}
                onClick={handleSignOut}
                disabled={isSigningOut}
                role="menuitem"
            >
                <LogOut className={styles.profilePopupIcon} />
                <span>{isSigningOut ? t('common.signingOut') : t('adminNavigation.signOut')}</span>
            </button>
        </div>
    );
}
