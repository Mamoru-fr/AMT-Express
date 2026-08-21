import i18next from 'i18next';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import { initReactI18next } from 'react-i18next';

export const languageResources = {
    en: { translation: en },
    fr: { translation: fr },
}

export const supportedLanguages = ['en', 'fr'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

// Plugin registration only — I18nProvider handles init with the server-detected language
i18next.use(initReactI18next);

export default i18next;
