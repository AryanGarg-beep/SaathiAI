'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('hi');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('saathi-lang') : null;
    if (saved === 'en' || saved === 'hi') setLangState(saved);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') localStorage.setItem('saathi-lang', newLang);
  };

  const toggleLang = () => setLang(lang === 'en' ? 'hi' : 'en');

  const t = (key: TranslationKey) => translations[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
