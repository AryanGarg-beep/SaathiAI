'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage();
  return (
    <button onClick={toggleLang} className="lang-toggle" aria-label="Change language">
      {lang === 'en' ? 'हिंदी' : 'English'}
    </button>
  );
}
