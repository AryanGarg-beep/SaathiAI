'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

export default function SignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message || t('errorGeneric'));
      setLoading(false);
      return;
    }

    router.push('/verify-email');
  };

  return (
    <div className="page">
      <div className="container">
        <Header />
      </div>
      <div className="center">
        <div className="card">
          <h2 className="text-center">{t('signup')}</h2>
          {error && <div className="alert alert-error mt-3">{error}</div>}
          <form onSubmit={handleSignup} className="mt-3">
            <div className="form-group">
              <label className="label" htmlFor="name">{t('name')}</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder={t('namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="email">{t('email')}</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="password">{t('password')}</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder={t('passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? t('loading') : t('signup')}
            </button>
          </form>
          <p className="text-center mt-3 text-soft">
            {t('haveAccount')} <Link href="/login">{t('loginHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
