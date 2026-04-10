import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReply, ChatMessage } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    // Require authenticated user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history, lang } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const reply = await generateReply(
      (history || []) as ChatMessage[],
      message,
      lang === 'en' ? 'en' : 'hi'
    );

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
