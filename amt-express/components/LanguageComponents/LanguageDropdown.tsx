'use client';

// React Imports
import {useState, useEffect} from 'react';

// Hooks Imports
// i18n translation hook
import {useTranslation} from 'react-i18next';

// Utils
import {cn} from '@/utils/cn';

// Data Imports
import languageList from '@/services/languageList.json';

type Props = {
    className?: string;
};

export function LanguageDropdown({className}: Props) {
    const {i18n} = useTranslation();
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        // Set initial language from localStorage or default to 'en'
        i18n.changeLanguage(localStorage.getItem('preferredLanguage') || 'en');
        // Set initial width
        setWindowWidth(window.innerWidth);

        // Update width on resize
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const languageCode = e.target.value;
        i18n.changeLanguage(languageCode);
        localStorage.setItem('preferredLanguage', languageCode);
    };

    return (
        <div 
            className={cn(
                "fixed left-6 md:left-7 lg:left-8",
                "w-25 md:w-30 lg:w-32.5",
                "h-12.5",
                "z-1000",
                className
            )}
            style={{bottom: 10}}
        >
            <select
                className={cn(
                    "w-full h-full max-h-12.5",
                    "px-3 py-2.5 md:px-4 md:py-3",
                    "text-xs md:text-sm lg:text-base font-semibold",
                    "border-2 border-gray-300",
                    "rounded-xl md:rounded-4xl",
                    "bg-white/95 backdrop-blur-[10px]",
                    "outline-none cursor-pointer",
                    "shadow-[0_6px_20px_rgba(0,0,0,0.25)]",
                    "transition-all duration-300",
                    "hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]",
                )}
                value={i18n.language}
                onChange={handleLanguageChange}
            >
                {Object.entries(languageList).map(([code, lang]) => (
                    <option key={code} value={code}>
                        {lang.flag} {lang.abbreviation}
                    </option>
                ))}
            </select>
        </div>
    );
}