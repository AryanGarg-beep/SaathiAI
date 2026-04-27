'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import LanguageToggle from '@/components/LanguageToggle';

export default function LoginPage() {
  const { t, lang } = useLanguage();
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
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes('email not confirmed')) setError(t('errorEmailNotVerified'));
      else if (msg.includes('invalid')) setError(t('errorInvalidLogin'));
      else setError(t('errorGeneric'));
      setLoading(false);
      return;
    }
    if (data.user) { router.push('/chat'); router.refresh(); }
  };

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>

      {/* Nav bar */}
      <nav className="header" style={{ margin: 'var(--sp-3)', maxWidth: '960px', marginLeft: 'auto', marginRight: 'auto' }}>
        <div className="header-title">{t('appName')}</div>
        <LanguageToggle />
      </nav>

      {/* Hero + Login */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--sp-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-5)', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>

        {/* Left: Hero text */}
        <div style={{ flex: '1 1 320px', maxWidth: '440px' }}>
          <h1 style={{ fontSize: 'var(--fs-2xl)', lineHeight: 1.15, marginBottom: 'var(--sp-2)' }}>
            {lang === 'hi' ? 'साथी AI' : 'Saathi AI'}
          </h1>
          <p style={{ fontSize: 'var(--fs-lg)', color: 'var(--color-primary)', fontWeight: 600, marginBottom: 'var(--sp-3)' }}>
            {t('tagline')}
          </p>
          <p style={{ fontSize: 'var(--fs-base)', marginBottom: 'var(--sp-3)', color: 'var(--color-text)' }}>
            {t('landingIntro')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {(lang === 'hi' ? [
              { icon: '💬', text: 'हिंदी और अंग्रेज़ी दोनों में बात करें' },
              { icon: '🎤', text: 'बोलकर या लिखकर — जो आसान लगे' },
              { icon: '🔊', text: 'साथी के जवाब सुनें, ज़ोर से पढ़कर' },
              { icon: '🧠', text: 'खुशी की यादें याद करने में मदद' },
              { icon: '🔒', text: 'आपकी बातचीत पूरी तरह निजी और सुरक्षित' },
            ] : [
              { icon: '💬', text: 'Chat in both Hindi and English' },
              { icon: '🎤', text: 'Speak or type — whatever feels easier' },
              { icon: '🔊', text: 'Listen to replies read aloud' },
              { icon: '🧠', text: 'Gentle help remembering happy memories' },
              { icon: '🔒', text: 'Your conversations are completely private' },
            ]).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'var(--fs-sm)' }}>
                <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login card */}
        <div className="card" style={{ flex: '0 0 auto' }}>
          <h2 className="text-center">{t('login')}</h2>
          {error && <div className="alert alert-error mt-3">{error}</div>}
          <form onSubmit={handleLogin} className="mt-3">
            <div className="form-group">
              <label className="label" htmlFor="email">{t('email')}</label>
              <input id="email" type="email" className="input" placeholder={t('emailPlaceholder')} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="password">{t('password')}</label>
              <input id="password" type="password" className="input" placeholder={t('passwordPlaceholder')} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <div className="text-center mt-2" style={{ marginBottom: '1rem' }}>
              <Link href="/forgot-password" className="link-plain">{t('forgotPassword')}</Link>
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

      {/* What is Saathi section */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: 'var(--sp-3) var(--sp-3) var(--sp-6)' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-5)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: 'var(--sp-3)' }}>
            {lang === 'hi' ? 'साथी क्या है?' : 'What is Saathi?'}
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto var(--sp-3)', color: 'var(--color-text-soft)' }}>
            {lang === 'hi'
              ? 'साथी AI डिमेंशिया से पीड़ित व्यक्तियों के लिए बनाया गया एक कोमल, धैर्यवान साथी है। यह एक दोस्त की तरह बात करता है — सुनता है, सहानुभूति दिखाता है, और खुशी की यादें याद करने में मदद करता है। साथी डॉक्टर नहीं है, बल्कि हर दिन भावनात्मक साथ देने वाला एक भरोसेमंद दोस्त है।'
              : 'Saathi AI is a gentle, patient companion built for people living with dementia. It talks like a friend — it listens, shows empathy, and gently helps recall happy memories. Saathi is not a doctor, but a trusted friend that offers emotional support every day.'
            }
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-3)', justifyContent: 'center' }}>
            {(lang === 'hi' ? [
              { title: 'सरल', desc: 'बड़े बटन, आसान शब्द, कोई जटिलता नहीं' },
              { title: 'सुरक्षित', desc: 'आपकी बातचीत निजी है, कोई और नहीं देख सकता' },
              { title: 'धैर्यवान', desc: 'कभी जल्दबाज़ी नहीं, कभी सुधार नहीं, बस साथ' },
            ] : [
              { title: 'Simple', desc: 'Big buttons, easy words, no complexity' },
              { title: 'Private', desc: 'Your conversations are yours alone — nobody else can see them' },
              { title: 'Patient', desc: 'Never rushes, never corrects — just companionship' },
            ]).map((card, i) => (
              <div key={i} style={{ flex: '1 1 180px', maxWidth: '220px', background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: 'var(--sp-3)', textAlign: 'center' }}>
                <h3 style={{ fontSize: 'var(--fs-base)', color: 'var(--color-primary)', marginBottom: '6px' }}>{card.title}</h3>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-soft)', margin: 0 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}