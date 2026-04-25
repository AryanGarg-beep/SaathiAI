'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { speak, stopSpeaking, isSpeechSupported } from '@/lib/speech';
import Sidebar, { Conversation } from '@/components/Sidebar';
import LanguageToggle from '@/components/LanguageToggle';

interface Msg {
  role: 'user' | 'model';
  text: string;
}

export default function ChatPage() {
  const { t, lang } = useLanguage();
  const router = useRouter();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [soundOn, setSoundOn] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // ── Auth check ──
  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setPageReady(true);
    };
    check();
  }, [router]);

  // ── Load conversations ──
  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/conversations');
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations || []);
    }
  }, []);

  useEffect(() => {
    if (pageReady) loadConversations();
  }, [pageReady, loadConversations]);

  // ── Load messages when active conversation changes ──
  const loadMessages = useCallback(async (convoId: string) => {
    const res = await fetch(`/api/chat?conversation_id=${convoId}`);
    if (res.ok) {
      const data = await res.json();
      const msgs: Msg[] = (data.messages || []).map((m: any) => ({
        role: m.role,
        text: m.content,
      }));
      // Add greeting if empty
      if (msgs.length === 0) {
        setMessages([{ role: 'model', text: t('chatGreeting') }]);
      } else {
        setMessages(msgs);
      }
    }
  }, [t]);

  useEffect(() => {
    if (activeConvoId) loadMessages(activeConvoId);
  }, [activeConvoId, loadMessages]);

  // ── Sound preference ──
  useEffect(() => {
    const saved = localStorage.getItem('saathi-sound');
    if (saved === 'off') setSoundOn(false);
  }, []);

  // ── Auto-scroll ──
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Cleanup speech on unmount ──
  useEffect(() => () => stopSpeaking(), []);

  // ── Speech recognition ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setMicSupported(false); return; }

    const recognition = new SR();
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
    return () => { recognition.stop(); };
  }, [lang]);

  // ── Handlers ──

  const handleNewChat = async () => {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: lang === 'hi' ? 'नई बातचीत' : 'New conversation' }),
    });
    if (res.ok) {
      const data = await res.json();
      await loadConversations();
      setActiveConvoId(data.conversation.id);
      setMessages([{ role: 'model', text: t('chatGreeting') }]);
    }
  };

  const handleSelectConvo = (id: string) => {
    setActiveConvoId(id);
  };

  const handleDeleteConvo = async (id: string) => {
    await fetch('/api/conversations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (activeConvoId === id) {
      setActiveConvoId(null);
      setMessages([]);
    }
    await loadConversations();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    stopSpeaking();
    if (listening) { recognitionRef.current.stop(); setListening(false); }
    else { setInput(''); try { recognitionRef.current.start(); setListening(true); } catch { setListening(false); } }
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
    if (listening) { recognitionRef.current?.stop(); setListening(false); }
    stopSpeaking();

    // Auto-create conversation if none active
    let convoId = activeConvoId;
    if (!convoId) {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: lang === 'hi' ? 'नई बातचीत' : 'New conversation' }),
      });
      if (!res.ok) return;
      const data = await res.json();
      convoId = data.conversation.id;
      setActiveConvoId(convoId);
      await loadConversations();
    }

    const userMsg: Msg = { role: 'user', text: input.trim() };
    const newHistory = [...messages.filter(m => !(messages.length === 1 && m.role === 'model' && m.text === t('chatGreeting'))), userMsg];
    // If the only message was the greeting (not from DB), remove it before showing
    if (messages.length === 1 && messages[0].role === 'model' && messages[0].text === t('chatGreeting')) {
      setMessages([userMsg]);
    } else {
      setMessages([...messages, userMsg]);
    }
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text, conversation_id: convoId, lang }),
      });
      const data = await res.json();
      const replyText = data.reply || t('errorGeneric');

      // Reload messages from DB to stay in sync
      await loadMessages(convoId!);
      await loadConversations(); // refresh title if auto-titled

      if (soundOn && data.reply) speak(replyText, lang);
    } catch {
      setMessages((prev) => [...prev, { role: 'model', text: t('errorGeneric') }]);
      if (soundOn) speak(t('errorGeneric'), lang);
    } finally {
      setLoading(false);
    }
  };

  const replayMessage = (text: string) => speak(text, lang);

  if (!pageReady) return null;

  return (
    <div className="chat-layout">
      <Sidebar
        conversations={conversations}
        activeId={activeConvoId}
        onSelect={handleSelectConvo}
        onNew={handleNewChat}
        onDelete={handleDeleteConvo}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="chat-main">
        {/* Top bar */}
        <div className="chat-main-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)} aria-label="Menu">
              ☰
            </button>
            <span className="header-title">{t('chatTitle')}</span>
          </div>
          <div className="header-actions">
            {isSpeechSupported() && (
              <button type="button" onClick={toggleSound} className="lang-toggle" aria-label={soundOn ? t('muteOff') : t('muteOn')}>
                {soundOn ? '🔊' : '🔇'}
              </button>
            )}
            <LanguageToggle />
            <button onClick={handleLogout} className="btn btn-secondary btn-small">{t('logout')}</button>
          </div>
        </div>

        {/* Chat body */}
        <div className="chat-main-body">
          {!activeConvoId ? (
            <div className="center" style={{ flex: 1 }}>
              <div className="card">
                <h2>{t('appName')}</h2>
                <p className="text-soft">{t('tagline')}</p>
                <p className="mt-3">{t('landingIntro')}</p>
                <button onClick={handleNewChat} className="btn btn-primary btn-block mt-4">
                  {t('newChat')}
                </button>
              </div>
            </div>
          ) : (
            <>
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
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', marginTop: '0.25rem', padding: 0 }}
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
                <input className="input" placeholder={t('chatPlaceholder')} value={input} onChange={(e) => setInput(e.target.value)} disabled={loading} />
                {micSupported && (
                  <button type="button" onClick={toggleMic} className={`btn ${listening ? 'btn-primary' : 'btn-secondary'}`} disabled={loading} aria-label={listening ? t('micStop') : t('micStart')}>
                    {listening ? '⏹' : '🎤'}
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
                  {t('send')}
                </button>
              </form>
              {!micSupported && <p className="text-soft text-center mt-2">{t('micNotSupported')}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
