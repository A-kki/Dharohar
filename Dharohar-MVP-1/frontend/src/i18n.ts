import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all locale files directly (no HTTP backend needed for Vite)
import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import bn from './locales/bn/translation.json';
import te from './locales/te/translation.json';
import mr from './locales/mr/translation.json';
import ta from './locales/ta/translation.json';
import gu from './locales/gu/translation.json';
import kn from './locales/kn/translation.json';
import ml from './locales/ml/translation.json';
import pa from './locales/pa/translation.json';
import or from './locales/or/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            bn: { translation: bn },
            te: { translation: te },
            mr: { translation: mr },
            ta: { translation: ta },
            gu: { translation: gu },
            kn: { translation: kn },
            ml: { translation: ml },
            pa: { translation: pa },
            or: { translation: or },
        },
        fallbackLng: 'en',
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'dharohar_lang',
        },
        interpolation: {
            escapeValue: false, // React already escapes
        },
    });

export default i18n;
