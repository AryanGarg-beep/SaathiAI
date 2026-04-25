'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (resetError) { setError(t('errorGeneric')); setLoading(false); return; }
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container"><Header /></div>
      <div className="center">
        <div className="card">
          <h2 className="text-center">{t('forgotPasswordTitle')}</h2>
          {sent ? (
            <>
              <div className="alert alert-success mt-3">{t('resetLinkSent')}</div>
              <Link href="/login" className="btn btn-primary btn-block mt-3">{t('verifyEmailBack')}</Link>
            </>
          ) : (
            <>
              <p className="text-soft mt-3 text-center">{t('forgotPasswordMessage')}</p>
              {error && <div className="alert alert-error mt-3">{error}</div>}
              <form onSubmit={handleSubmit} className="mt-3">
                <div className="form-group">
                  <label className="label" htmlFor="email">{t('email')}</label>
                  <input id="email" type="email" className="input" placeholder={t('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? t('loading') : t('sendResetLink')}
                </button>
              </form>
              <p className="text-center mt-3 text-soft">
                <Link href="/login">{t('loginHere')}</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
