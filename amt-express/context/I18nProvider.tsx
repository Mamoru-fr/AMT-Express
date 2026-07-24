'use client'

import { useEffect, ReactNode } from 'react';
import i18next from '@/services/i18next';
import { I18nextProvider } from 'react-i18next';

type Props = {
    children: ReactNode;
};

/**
 * Provides internationalization context to the application.
 * 
 * @param children - The child components that will have access to the i18n context.
 * @returns The provider component that wraps the application with i18n context.
 */

export function I18nProvider({ children }: Props) {
    useEffect(() => {
        // Initialize i18next when component mounts
        if (!i18next.isInitialized) {
            i18next.init();
        }
        
        // Update html lang attribute when language changes
        const handleLanguageChange = () => {
            const htmlElement = document.documentElement;
            if (htmlElement) {
                htmlElement.lang = i18next.language;
            }
        };
        
        // Initial update
        handleLanguageChange();
        
        // Listen for language changes
        i18next.on('languageChanged', handleLanguageChange);
        
        return () => {
            i18next.off('languageChanged', handleLanguageChange);
        };
    }, []);

    return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
