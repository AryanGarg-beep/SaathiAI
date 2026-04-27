'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import Header from '@/components/Header';

interface Profile {
  patient_name: string;
  caregiver_name: string;
  caregiver_phone: string;
  caregiver_relation: string;
  doctor_name: string;
  doctor_phone: string;
  medications: string;
  allergies: string;
  medical_conditions: string;
  blood_group: string;
  address: string;
  notes: string;
}

const EMPTY_PROFILE: Profile = {
  patient_name: '', caregiver_name: '', caregiver_phone: '', caregiver_relation: '',
  doctor_name: '', doctor_phone: '', medications: '', allergies: '',
  medical_conditions: '', blood_group: '', address: '', notes: '',
};

const LABELS: Record<keyof Profile, { en: string; hi: string; placeholder_en: string; placeholder_hi: string }> = {
  patient_name:       { en: 'Patient Name', hi: 'मरीज़ का नाम', placeholder_en: 'Full name', placeholder_hi: 'पूरा नाम' },
  caregiver_name:     { en: 'Caregiver Name', hi: 'देखभालकर्ता का नाम', placeholder_en: 'e.g. Rekha', placeholder_hi: 'जैसे रेखा' },
  caregiver_phone:    { en: 'Caregiver Phone', hi: 'देखभालकर्ता का फोन', placeholder_en: '+91 98765 43210', placeholder_hi: '+91 98765 43210' },
  caregiver_relation: { en: 'Relation', hi: 'रिश्ता', placeholder_en: 'e.g. Daughter', placeholder_hi: 'जैसे बेटी' },
  doctor_name:        { en: 'Doctor Name', hi: 'डॉक्टर का नाम', placeholder_en: 'Dr. Sharma', placeholder_hi: 'डॉ. शर्मा' },
  doctor_phone:       { en: 'Doctor Phone', hi: 'डॉक्टर का फोन', placeholder_en: '+91 98765 43210', placeholder_hi: '+91 98765 43210' },
  medications:        { en: 'Current Medications', hi: 'वर्तमान दवाइयाँ', placeholder_en: 'List medicines, one per line', placeholder_hi: 'दवाइयाँ लिखें, एक प्रति पंक्ति' },
  allergies:          { en: 'Allergies', hi: 'एलर्जी', placeholder_en: 'e.g. Penicillin, Peanuts', placeholder_hi: 'जैसे पेनिसिलिन, मूंगफली' },
  medical_conditions: { en: 'Medical Conditions', hi: 'बीमारियाँ', placeholder_en: 'e.g. Diabetes, Hypertension', placeholder_hi: 'जैसे मधुमेह, उच्च रक्तचाप' },
  blood_group:        { en: 'Blood Group', hi: 'रक्त समूह', placeholder_en: 'e.g. B+', placeholder_hi: 'जैसे B+' },
  address:            { en: 'Home Address', hi: 'घर का पता', placeholder_en: 'Full address', placeholder_hi: 'पूरा पता' },
  notes:              { en: 'Other Notes', hi: 'अन्य नोट्स', placeholder_en: 'Anything else the caregiver should know', placeholder_hi: 'कुछ और जो देखभालकर्ता को पता होना चाहिए' },
};

// Fields that get a <textarea>
const TEXTAREA_FIELDS: (keyof Profile)[] = ['medications', 'allergies', 'medical_conditions', 'address', 'notes'];

// Group fields into sections
const SECTIONS = [
  { en: 'Patient', hi: 'मरीज़', fields: ['patient_name', 'blood_group'] as (keyof Profile)[] },
  { en: 'Emergency Contacts', hi: 'आपातकालीन संपर्क', fields: ['caregiver_name', 'caregiver_phone', 'caregiver_relation', 'doctor_name', 'doctor_phone'] as (keyof Profile)[] },
  { en: 'Medical Information', hi: 'चिकित्सीय जानकारी', fields: ['medications', 'allergies', 'medical_conditions'] as (keyof Profile)[] },
  { en: 'Other', hi: 'अन्य', fields: ['address', 'notes'] as (keyof Profile)[] },
];

export default function ProfilePage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        const loaded: Profile = { ...EMPTY_PROFILE };
        for (const key of Object.keys(EMPTY_PROFILE) as (keyof Profile)[]) {
          if (data[key] != null) loaded[key] = data[key];
        }
        setProfile(loaded);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = { ...profile, user_id: user.id, updated_at: new Date().toISOString() };

    // Upsert
    const { error } = await supabase
      .from('patient_profiles')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      setMessage({ type: 'error', text: lang === 'hi' ? 'सहेजने में त्रुटि। फिर कोशिश करें।' : 'Error saving. Please try again.' });
    } else {
      setMessage({ type: 'success', text: lang === 'hi' ? 'प्रोफ़ाइल सहेज ली गई!' : 'Profile saved!' });
    }
    setSaving(false);
  };

  const updateField = (key: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="page"><div className="center"><p>{t('loading')}</p></div></div>;

  return (
    <div className="page">
      <div className="container">
        <Header showLogout />
      </div>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'var(--sp-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
          <h2 style={{ margin: 0 }}>{lang === 'hi' ? 'प्रोफ़ाइल और संपर्क' : 'Profile & Contacts'}</h2>
          <a href="/chat" style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-primary)' }}>
            ← {lang === 'hi' ? 'चैट पर वापस' : 'Back to chat'}
          </a>
        </div>

        <p className="text-soft" style={{ marginBottom: 'var(--sp-4)' }}>
          {lang === 'hi'
            ? 'यह जानकारी आपातकाल में उपयोग की जाएगी। कृपया देखभालकर्ता की मदद से भरें।'
            : 'This information is used during emergencies. Please fill with the help of a caregiver.'}
        </p>

        {message && (
          <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
            {message.text}
          </div>
        )}

        {SECTIONS.map((section) => (
          <div key={section.en} style={{ marginBottom: 'var(--sp-4)' }}>
            <h3 style={{ color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px', marginBottom: 'var(--sp-2)' }}>
              {lang === 'hi' ? section.hi : section.en}
            </h3>
            {section.fields.map((field) => {
              const label = LABELS[field];
              const isTextarea = TEXTAREA_FIELDS.includes(field);
              return (
                <div className="form-group" key={field}>
                  <label className="label">{lang === 'hi' ? label.hi : label.en}</label>
                  {isTextarea ? (
                    <textarea
                      className="input"
                      style={{ minHeight: '100px', resize: 'vertical' }}
                      placeholder={lang === 'hi' ? label.placeholder_hi : label.placeholder_en}
                      value={profile[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                    />
                  ) : (
                    <input
                      type={field.includes('phone') ? 'tel' : 'text'}
                      className="input"
                      placeholder={lang === 'hi' ? label.placeholder_hi : label.placeholder_en}
                      value={profile[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        <button onClick={handleSave} className="btn btn-primary btn-block" disabled={saving}>
          {saving
            ? t('loading')
            : lang === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
