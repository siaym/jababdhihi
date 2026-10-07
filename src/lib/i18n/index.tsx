'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import bnDict from './dictionaries/bn.json';
import enDict from './dictionaries/en.json';

export type Locale = 'bn' | 'en';

type Dictionaries = typeof bnDict;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (keyPath: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const dictionaries: Record<Locale, Dictionaries> = {
  bn: bnDict,
  en: enDict,
};

export function I18nProvider({
  children,
  defaultLocale = 'bn',
}: {
  children: React.ReactNode;
  defaultLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // Check saved preference from localStorage
    const saved = localStorage.getItem('civic_locale') as Locale | null;
    if (saved && (saved === 'bn' || saved === 'en')) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('civic_locale', newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (keyPath: string): string => {
    const keys = keyPath.split('.');
    let current: any = dictionaries[locale];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English dictionary if missing in Bengali
        let fallback: any = dictionaries.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return keyPath;
          }
        }
        return typeof fallback === 'string' ? fallback : keyPath;
      }
    }

    return typeof current === 'string' ? current : keyPath;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
