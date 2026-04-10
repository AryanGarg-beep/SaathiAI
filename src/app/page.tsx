'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="page">
      <div className="container">
        <Header />
      </div>
      <div className="center">
        <div className="card">
          <h1>{t('appName')}</h1>
          <p className="text-soft">{t('tagline')}</p>
          <p className="mt-3">{t('landingIntro')}</p>
          <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href="/login" className="btn btn-primary btn-block">
              {t('login')}
            </Link>
            <Link href="/signup" className="btn btn-secondary btn-block">
              {t('signup')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
