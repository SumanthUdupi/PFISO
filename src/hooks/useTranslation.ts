import { useState, useEffect } from 'react';
import { t, Locale } from '../utils/i18n';

export const useTranslation = () => {
    const [_, setTick] = useState(0);

    useEffect(() => {
        const handleLanguageChange = () => setTick(t => t + 1);
        window.addEventListener('language-change', handleLanguageChange);
        return () => window.removeEventListener('language-change', handleLanguageChange);
    }, []);

    return { t };
};
