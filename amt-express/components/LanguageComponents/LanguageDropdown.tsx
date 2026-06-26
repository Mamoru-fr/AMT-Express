'use client';

import {useEffect} from 'react';
import {ChevronDown} from 'lucide-react';

// Hooks Imports
// i18n translation hook
import {useTranslation} from 'react-i18next';
import styles from './LanguageDropdown.module.css';

// Data Imports
import languageList from '@/services/languageList.json';

type Props = {
    className?: string;
    variant?: 'floating' | 'sidebar';
};

export function LanguageDropdown({className, variant = 'floating'}: Props) {
    const {t, i18n} = useTranslation();

    useEffect(() => {
        i18n.changeLanguage(localStorage.getItem('preferredLanguage') || 'en');
    }, []);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const languageCode = e.target.value;
        i18n.changeLanguage(languageCode);
        localStorage.setItem('preferredLanguage', languageCode);
    };

    return (
        <div className={[styles.root, styles[variant], className].filter(Boolean).join(' ')}>
            {variant === 'sidebar' && <div className={styles.label}>{t('languageDropdown.language', 'Language')}</div>}

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