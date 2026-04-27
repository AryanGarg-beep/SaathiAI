// Emergency intent detection for patient safety
// Runs client-side BEFORE sending to Gemini — zero latency

export type EmergencyLevel = 'critical' | 'concern' | 'none';

export interface EmergencyResult {
  level: EmergencyLevel;
  matchedKeywords: string[];
}

// ── Critical: needs immediate medical attention ──
const CRITICAL_EN = [
  'chest pain', 'heart attack', 'cant breathe', 'cannot breathe',
  'can\'t breathe', 'difficulty breathing', 'choking', 'seizure',
  'stroke', 'unconscious', 'fainted', 'collapsed', 'bleeding heavily',
  'head injury', 'fell down', 'fall down', 'broken bone', 'fracture',
  'poison', 'overdose', 'suicidal', 'want to die', 'kill myself',
  'hurt myself', 'burning pain', 'severe pain', 'blood',
  'not waking up', 'stopped breathing', 'heart hurts',
];

const CRITICAL_HI = [
  'सीने में दर्द', 'छाती में दर्द', 'दिल का दौरा', 'सांस नहीं आ रही',
  'सांस लेने में तकलीफ', 'गला घुट रहा', 'दौरा पड़ रहा', 'मिर्गी',
  'बेहोश', 'गिर गया', 'गिर गयी', 'गिर पड़ा', 'गिर पड़ी',
  'खून बह रहा', 'सिर पर चोट', 'हड्डी टूट गई', 'फ्रैक्चर',
  'जहर', 'ज़हर', 'मरना चाहता हूं', 'मरना चाहती हूं', 'जीना नहीं चाहता',
  'खुद को नुकसान', 'बहुत तेज दर्द', 'खून', 'जल रहा है',
  'उठ नहीं रहा', 'सांस रुक गई', 'दिल में दर्द',
];

// ── Concern: should monitor, gently suggest caregiver ──
const CONCERN_EN = [
  'dizzy', 'dizziness', 'nausea', 'vomiting', 'fever', 'high temperature',
  'confused', 'lost', 'don\'t know where i am', 'forgot my medicine',
  'forgot medicine', 'headache', 'stomach pain', 'weak', 'tired',
  'can\'t sleep', 'not eating', 'not drinking', 'shaking', 'trembling',
  'swollen', 'rash', 'itching', 'blurry vision', 'can\'t see',
  'feeling very bad', 'something is wrong', 'not feeling well',
  'scared', 'frightened', 'anxious', 'panic', 'lonely', 'alone',
  'nobody here', 'no one here', 'help me',
];

const CONCERN_HI = [
  'चक्कर आ रहा', 'जी मिचला रहा', 'उल्टी', 'बुखार', 'तेज बुखार',
  'भ्रमित', 'रास्ता भूल गया', 'पता नहीं कहाँ हूँ', 'दवाई भूल गया',
  'दवाई भूल गई', 'सिरदर्द', 'सिर दर्द', 'पेट दर्द', 'पेट में दर्द',
  'कमजोरी', 'थकान', 'नींद नहीं आ रही', 'खाना नहीं खा रहा',
  'पानी नहीं पी रहा', 'कांप रहा', 'सूजन', 'खुजली', 'धुंधला दिख रहा',
  'दिख नहीं रहा', 'बहुत बुरा लग रहा', 'तबीयत ठीक नहीं',
  'डर लग रहा', 'घबराहट', 'अकेला', 'अकेली', 'कोई नहीं है',
  'मदद करो', 'मदद चाहिए',
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[।,.!?;:'"()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectEmergency(message: string): EmergencyResult {
  const normalized = normalize(message);
  const matchedKeywords: string[] = [];

  // Check critical first
  for (const keyword of [...CRITICAL_EN, ...CRITICAL_HI]) {
    if (normalized.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }
  if (matchedKeywords.length > 0) {
    return { level: 'critical', matchedKeywords };
  }

  // Check concern
  for (const keyword of [...CONCERN_EN, ...CONCERN_HI]) {
    if (normalized.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }
  if (matchedKeywords.length > 0) {
    return { level: 'concern', matchedKeywords };
  }

  return { level: 'none', matchedKeywords: [] };
}

// Emergency messages shown to user
export function getEmergencyMessage(level: EmergencyLevel, lang: 'en' | 'hi'): string {
  if (level === 'critical') {
    return lang === 'hi'
      ? '⚠️ यह एक आपातकालीन स्थिति हो सकती है। कृपया तुरंत अपने देखभाल करने वाले या डॉक्टर से संपर्क करें। अगर स्थिति गंभीर है, तो 112 पर कॉल करें।'
      : '⚠️ This may be an emergency. Please contact your caregiver or doctor immediately. If the situation is serious, call 112.';
  }
  if (level === 'concern') {
    return lang === 'hi'
      ? '💛 आपकी तबीयत ठीक नहीं लग रही। अगर यह बना रहे, तो कृपया अपने देखभाल करने वाले को बताएं।'
      : '💛 You don\'t seem to be feeling well. If this continues, please let your caregiver know.';
  }
  return '';
}
