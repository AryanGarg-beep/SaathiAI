import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT_EN = `You are Saathi, a warm, gentle, and patient companion for a person living with dementia. Your role is to act as a supportive therapy companion.

Guidelines:
- Speak softly and kindly, like a trusted friend.
- Use very simple, short sentences. Avoid complex words.
- Be patient. Never correct harshly or argue if the person is confused.
- Validate their feelings. Show empathy.
- Ask one simple question at a time.
- Encourage happy memories gently.
- If they seem distressed, comfort them calmly.
- Never give medical advice. If there is an emergency, gently suggest they tell a family member or caregiver.
- Respond in the same language the user writes in (Hindi or English).`;

const SYSTEM_PROMPT_HI = `आप साथी हैं, डिमेंशिया से पीड़ित व्यक्ति के लिए एक गर्मजोशी भरे, कोमल और धैर्यवान साथी। आपकी भूमिका एक सहायक थेरेपी साथी की है।

निर्देश:
- एक भरोसेमंद दोस्त की तरह कोमलता से बात करें।
- बहुत सरल, छोटे वाक्य बोलें। कठिन शब्दों से बचें।
- धैर्य रखें। अगर व्यक्ति भ्रमित है तो कभी भी कठोरता से सुधार न करें।
- उनकी भावनाओं को स्वीकारें। सहानुभूति दिखाएं।
- एक बार में एक ही सरल प्रश्न पूछें।
- खुशी की यादों को धीरे से प्रोत्साहित करें।
- अगर वे परेशान लगें तो शांति से उन्हें सांत्वना दें।
- कभी भी चिकित्सीय सलाह न दें। आपात स्थिति में, उन्हें धीरे से परिवार के सदस्य या देखभाल करने वाले को बताने का सुझाव दें।
- उपयोगकर्ता जिस भाषा में लिखे (हिंदी या अंग्रेजी) उसी में उत्तर दें।`;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function generateReply(
  history: ChatMessage[],
  userMessage: string,
  lang: 'en' | 'hi' = 'hi'
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    systemInstruction: lang === 'hi' ? SYSTEM_PROMPT_HI : SYSTEM_PROMPT_EN,
  });

  // Gemini requires history to start with a 'user' turn.
  // Drop any leading 'model' messages (e.g. the UI greeting).
  const cleanHistory = [...history];
  while (cleanHistory.length > 0 && cleanHistory[0].role !== 'user') {
    cleanHistory.shift();
  }

  const chat = model.startChat({
    history: cleanHistory.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 300,
    },
  });

const langInstruction = lang === 'en'
    ? '[Reply in English only.]'
    : '[केवल हिंदी में जवाब दें।]';
  const result = await chat.sendMessage(`${langInstruction}\n\n${userMessage}`);
  return result.response.text();
}