'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

export default function LoginPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('email not confirmed')) {
        setError(t('errorEmailNotVerified'));
      } else if (authError.message.toLowerCase().includes('invalid')) {
        setError(t('errorInvalidLogin'));
      } else {
        setError(t('errorGeneric'));
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push('/chat');
      router.refresh();
    }
  };

  return (
    <div className="page">
      <div className="container">
        <Header />
      </div>
      <div className="center">
        <div className="card">
          <h2 className="text-center">{t('login')}</h2>
          {error && <div className="alert alert-error mt-3">{error}</div>}
          <form onSubmit={handleLogin} className="mt-3">
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
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? t('loading') : t('login')}
            </button>
          </form>
          <p className="text-center mt-3 text-soft">
            {t('noAccount')} <Link href="/signup">{t('signupHere')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
