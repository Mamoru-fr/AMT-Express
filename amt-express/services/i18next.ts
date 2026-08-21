import i18next from 'i18next';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import { initReactI18next } from 'react-i18next';

export const languageResources = {
    en: { translation: en },
    fr: { translation: fr },
}

// Check for saved language in localStorage (client-side only)
// Note: This runs on both server and client, but localStorage is only available on client
const getInitialLanguage = () => {
    // Default to browser language if available and supported
    if (typeof window !== 'undefined') {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
            return savedLanguage;
        }
        // Fallback to browser language
        const browserLanguage = navigator.language.split('-')[0];
        if (browserLanguage === 'fr') return 'fr';
    }
    return 'en';
};

i18next.use(initReactI18next).init({
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    debug: process.env.NODE_ENV === 'development',
    resources: languageResources,
    interpolation: {
        escapeValue: false,
    },
});

export default i18next;
