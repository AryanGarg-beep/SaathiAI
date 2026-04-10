'use client';

import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import LanguageToggle from './LanguageToggle';

interface HeaderProps {
  showLogout?: boolean;
}

export default function Header({ showLogout = false }: HeaderProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="header">
      <div className="header-title">{t('appName')}</div>
      <div className="header-actions">
        <LanguageToggle />
        {showLogout && (
          <button onClick={handleLogout} className="btn btn-secondary">
            {t('logout')}
          </button>
        )}
      </div>
    </header>
  );
}
