'use client'

import { useEffect, ReactNode } from 'react';
import i18next, { languageResources, supportedLanguages } from '@/services/i18next';
import { I18nextProvider } from 'react-i18next';

type Props = {
    children: ReactNode;
    initialLanguage?: string;
};

export function I18nProvider({ children, initialLanguage = 'en' }: Props) {
    if (!i18next.isInitialized) {
        // initImmediate: false makes init synchronous so children render with the right language
        i18next.init({
            lng: initialLanguage,
            fallbackLng: 'en',
            compatibilityJSON: 'v4',
            initImmediate: false,
            resources: languageResources,
            interpolation: { escapeValue: false },
        });
    }

    useEffect(() => {
        // On client, prefer localStorage over the server cookie (user's explicit choice)
        const saved = localStorage.getItem('preferredLanguage');
        if (saved && supportedLanguages.includes(saved as never) && saved !== i18next.language) {
            i18next.changeLanguage(saved);
        }

        const handleLanguageChange = () => {
            document.documentElement.lang = i18next.language;
        };
        handleLanguageChange();
        i18next.on('languageChanged', handleLanguageChange);
        return () => { i18next.off('languageChanged', handleLanguageChange); };
    }, []);

    return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
