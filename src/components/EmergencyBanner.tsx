'use client';

import { useLanguage } from '@/context/LanguageContext';

interface CaregiverInfo {
  caregiver_name?: string | null;
  caregiver_phone?: string | null;
  caregiver_relation?: string | null;
  doctor_name?: string | null;
  doctor_phone?: string | null;
}

interface EmergencyBannerProps {
  level: 'critical' | 'concern';
  message: string;
  caregiver?: CaregiverInfo | null;
  onDismiss: () => void;
}

export default function EmergencyBanner({ level, message, caregiver, onDismiss }: EmergencyBannerProps) {
  const { lang } = useLanguage();

  const isCritical = level === 'critical';
  const bannerStyle: React.CSSProperties = {
    padding: 'var(--sp-3) var(--sp-4)',
    borderRadius: 'var(--radius)',
    marginBottom: 'var(--sp-2)',
    border: '2px solid',
    borderColor: isCritical ? 'var(--color-error)' : '#c08520',
    background: isCritical ? '#fde8e8' : '#fff7e0',
    animation: isCritical ? 'pulse-border 1.5s ease-in-out 3' : 'none',
  };

  const callBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: isCritical ? 'var(--color-error)' : 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 'var(--fs-base)',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    marginTop: '8px',
    marginRight: '8px',
  };

  return (
    <div style={bannerStyle}>
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 0 rgba(160,32,32,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(160,32,32,0); }
        }
      `}</style>

      <p style={{ fontWeight: 600, fontSize: 'var(--fs-base)', margin: '0 0 8px', color: isCritical ? 'var(--color-error)' : '#8a5e10' }}>
        {message}
      </p>

      {/* Show caregiver contact if available */}
      {caregiver?.caregiver_phone && (
        <div style={{ marginBottom: '8px' }}>
          <a href={`tel:${caregiver.caregiver_phone}`} style={callBtnStyle}>
            📞 {lang === 'hi' ? 'कॉल करें' : 'Call'}: {caregiver.caregiver_name || (lang === 'hi' ? 'देखभालकर्ता' : 'Caregiver')}
            {caregiver.caregiver_relation ? ` (${caregiver.caregiver_relation})` : ''}
          </a>
        </div>
      )}

      {/* Show doctor contact for critical */}
      {isCritical && caregiver?.doctor_phone && (
        <div style={{ marginBottom: '8px' }}>
          <a href={`tel:${caregiver.doctor_phone}`} style={{ ...callBtnStyle, background: '#444' }}>
            🏥 {lang === 'hi' ? 'डॉक्टर को कॉल करें' : 'Call Doctor'}: {caregiver.doctor_name || (lang === 'hi' ? 'डॉक्टर' : 'Doctor')}
          </a>
        </div>
      )}

      {/* Emergency number for critical */}
      {isCritical && (
        <div style={{ marginBottom: '8px' }}>
          <a href="tel:112" style={{ ...callBtnStyle, background: '#b00' }}>
            🚨 {lang === 'hi' ? 'आपातकालीन: 112' : 'Emergency: 112'}
          </a>
        </div>
      )}

      {/* No contacts saved prompt */}
      {!caregiver?.caregiver_phone && !caregiver?.doctor_phone && (
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-soft)', margin: '8px 0' }}>
          {lang === 'hi'
            ? 'आपातकालीन संपर्क सहेजे नहीं गए हैं। कृपया प्रोफ़ाइल में जाकर संपर्क जोड़ें।'
            : 'No emergency contacts saved. Please go to Profile to add contacts.'}
        </p>
      )}

      <button
        onClick={onDismiss}
        style={{ background: 'transparent', border: 'none', color: 'var(--color-text-soft)', cursor: 'pointer', fontSize: 'var(--fs-xs)', marginTop: '4px' }}
      >
        {lang === 'hi' ? '✕ बंद करें' : '✕ Dismiss'}
      </button>
    </div>
  );
}
