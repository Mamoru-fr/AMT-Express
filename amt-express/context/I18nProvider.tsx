'use client'

import { useEffect, ReactNode } from 'react';
import i18next from '@/services/i18next';
import { I18nextProvider } from 'react-i18next';

type Props = {
    children: ReactNode;
};

export function I18nProvider({ children }: Props) {
    useEffect(() => {
        // Initialize i18next when component mounts
        if (!i18next.isInitialized) {
            i18next.init();
        }
    }, []);

    return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
