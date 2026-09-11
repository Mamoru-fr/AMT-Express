'use client';

import {useEffect, useRef} from 'react';
import {ChevronDown} from 'lucide-react';

// Hooks Imports
// i18n translation hook
import {useTranslation} from 'react-i18next';
import styles from './LanguageDropdown.module.css';

// Data Imports
import languageList from '@/services/languageList.json';

type Props = {
    className?: string;
    variant?: 'floating' | 'sidebar' | 'popup';
};

export function LanguageDropdown({className, variant = 'floating'}: Props) {
    const {t, i18n} = useTranslation();

    // Initialize language from localStorage on first load
    // Use a flag to prevent multiple initializations
    const initializedRef = useRef(false);
    
    useEffect(() => {
        if (!initializedRef.current) {
            initializedRef.current = true;
            const savedLanguage = localStorage.getItem('preferredLanguage');
            if (savedLanguage) {
                i18n.changeLanguage(savedLanguage);
            }
        }
    }, [i18n]);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const languageCode = e.target.value;
        i18n.changeLanguage(languageCode);
        localStorage.setItem('preferredLanguage', languageCode);
        // Cookie allows the server to SSR with the correct language
        document.cookie = `preferredLanguage=${languageCode};path=/;max-age=31536000;SameSite=Lax`;
    };

    return (
        <div className={[styles.root, styles[variant], className].filter(Boolean).join(' ')}>
            {(variant === 'sidebar' || variant === 'popup') && <div className={styles.label}>{t('languageDropdown.language', 'Language')}</div>}

            <div className={styles.control}>
                <select
                    className={styles.select}
                    value={i18n.language}
                    onChange={handleLanguageChange}
                    aria-label={t('languageDropdown.languageSelector', 'Language selector')}
                >
                    {Object.entries(languageList).map(([code, lang]) => (
                        <option key={code} value={code}>
                            {lang.flag} {lang.abbreviation}
                        </option>
                    ))}
                </select>
                <ChevronDown className={styles.chevron} />
            </div>
        </div>
    );
}