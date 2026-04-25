'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) { setError(t('passwordMismatch')); return; }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) { setError(t('errorGeneric')); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container"><Header /></div>
      <div className="center">
        <div className="card">
          <h2 className="text-center">{t('forgotPasswordTitle')}</h2>
          {success ? (
            <>
              <div className="alert alert-success mt-3">{t('passwordResetSuccess')}</div>
              <Link href="/login" className="btn btn-primary btn-block mt-3">{t('login')}</Link>
            </>
          ) : (
            <>
              {error && <div className="alert alert-error mt-3">{error}</div>}
              <form onSubmit={handleSubmit} className="mt-3">
                <div className="form-group">
                  <label className="label" htmlFor="password">{t('newPassword')}</label>
                  <input id="password" type="password" className="input" placeholder={t('newPasswordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="confirm">{t('confirmPassword')}</label>
                  <input id="confirm" type="password" className="input" placeholder={t('confirmPasswordPlaceholder')} value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={6} />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? t('loading') : t('resetPassword')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
