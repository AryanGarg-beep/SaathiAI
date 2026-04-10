export function speak(text: string, lang: 'en' | 'hi' = 'hi') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // Stop anything currently speaking
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
  utterance.rate = 0.9; // slightly slower — gentler for elderly listeners
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to pick a matching voice if available
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find((v) => v.lang.startsWith(lang === 'hi' ? 'hi' : 'en'));
  if (match) utterance.voice = match;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}