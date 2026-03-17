import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, resources } from './locales.js';

const supportedCodes = new Set(SUPPORTED_LOCALES.map((locale) => locale.code));

function resolveInitialLocale() {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const savedLocale = window.localStorage.getItem('manifesto-locale');

  if (savedLocale && supportedCodes.has(savedLocale)) {
    return savedLocale;
  }

  const browserLocale = window.navigator.language.slice(0, 2).toLowerCase();

  if (supportedCodes.has(browserLocale)) {
    return browserLocale;
  }

  return DEFAULT_LOCALE;
}

i18n.use(initReactI18next).init({
  resources,
  lng: resolveInitialLocale(),
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (language) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('manifesto-locale', language);
    document.documentElement.lang = language;
  }
});

export default i18n;
