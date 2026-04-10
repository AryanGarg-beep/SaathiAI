'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { speak, stopSpeaking, isSpeechSupported } from '@/lib/speech';
import Header from '@/components/Header';

interface Msg {
  role: 'user' | 'model';
  text: string;
}

export default function ChatPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Require auth
  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
    };
    check();
  }, [router]);

  // Load sound preference
  useEffect(() => {
    const saved = localStorage.getItem('saathi-sound');
    if (saved === 'off') setSoundOn(false);
  }, []);

  // Greeting updates with language
  useEffect(() => {
    const greeting = t('chatGreeting');
    setMessages([{ role: 'model', text: greeting }]);
    if (soundOn) speak(greeting, lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Stop any speech when leaving the page
  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Speech recognition setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [lang]);

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    // Stop any bot speech before listening
    stopSpeaking();
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setInput('');
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    }
  };

  const toggleSound = () => {
    const newVal = !soundOn;
    setSoundOn(newVal);
    localStorage.setItem('saathi-sound', newVal ? 'on' : 'off');
    if (!newVal) stopSpeaking();
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    }
    stopSpeaking();

    const userMsg: Msg = { role: 'user', text: input.trim() };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.text,
          history: messages,
          lang,
        }),
      });
      const data = await res.json();
      const replyText = data.reply || t('errorGeneric');
      setMessages([...newHistory, { role: 'model', text: replyText }]);
      if (soundOn && data.reply) speak(replyText, lang);
    } catch {
      const errText = t('errorGeneric');
      setMessages([...newHistory, { role: 'model', text: errText }]);
      if (soundOn) speak(errText, lang);
    } finally {
      setLoading(false);
    }
  };

  const replayMessage = (text: string) => {
    speak(text, lang);
  };

  return (
    <div className="page">
      <div className="container">
        <Header showLogout />
      </div>
      <div className="chat-wrapper">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
          {isSpeechSupported() && (
            <button
              type="button"
              onClick={toggleSound}
              className="lang-toggle"
              aria-label={soundOn ? t('muteOff') : t('muteOn')}
            >
              {soundOn ? `🔊 ${t('muteOff')}` : `🔇 ${t('muteOn')}`}
            </button>
          )}
        </div>
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'msg-user' : 'msg-bot'}`}>
              <div>{m.text}</div>
              {m.role === 'model' && isSpeechSupported() && (
                <button
                  type="button"
                  onClick={() => replayMessage(m.text)}
                  aria-label={t('speakMessage')}
                  title={t('speakMessage')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.25rem',
                    marginTop: '0.25rem',
                    padding: 0,
                  }}
                >
                  🔊
                </button>
              )}
            </div>
          ))}
          {loading && <div className="msg msg-bot">...</div>}
          {listening && <div className="msg msg-bot">{t('listening')}</div>}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="chat-input-row">
          <input
            className="input"
            placeholder={t('chatPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          {micSupported && (
            <button
              type="button"
              onClick={toggleMic}
              className={`btn ${listening ? 'btn-primary' : 'btn-secondary'}`}
              disabled={loading}
              aria-label={listening ? t('micStop') : t('micStart')}
              title={listening ? t('micStop') : t('micStart')}
            >
              {listening ? '⏹' : '🎤'}
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !input.trim()}
          >
            {t('send')}
          </button>
        </form>
        {!micSupported && (
          <p className="text-soft text-center mt-2">{t('micNotSupported')}</p>
        )}
      </div>
    </div>
  );
}