'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/Header';

export default function VerifyEmailPage() {
  const { t } = useLanguage();

  return (
    <div className="page">
      <div className="container">
        <Header />
      </div>
      <div className="center">
        <div className="card">
          <h2 className="text-center">{t('verifyEmailTitle')}</h2>
          <div className="alert alert-info mt-3">
            <p>{t('verifyEmailMessage')}</p>
          </div>
          <Link href="/login" className="btn btn-primary btn-block mt-3">
            {t('verifyEmailBack')}
          </Link>
        </div>
      </div>
    </div>
  );
}
