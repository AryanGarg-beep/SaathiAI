import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateReply, ChatMessage } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  // Load messages for a conversation
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const conversationId = request.nextUrl.searchParams.get('conversation_id');
  if (!conversationId) return NextResponse.json({ error: 'Missing conversation_id' }, { status: 400 });

  const { data, error } = await supabase
    .from('messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, conversation_id, lang } = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }
    if (!conversation_id) {
      return NextResponse.json({ error: 'Missing conversation_id' }, { status: 400 });
    }

    // Load existing messages for this conversation as Gemini history
    const { data: existingMsgs } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true });

    const history: ChatMessage[] = (existingMsgs || []).map((m) => ({
      role: m.role as 'user' | 'model',
      text: m.content,
    }));

    // Generate reply
    const reply = await generateReply(
      history,
      message,
      lang === 'en' ? 'en' : 'hi'
    );

    // Save user message + bot reply
    await supabase.from('messages').insert([
      { conversation_id, role: 'user', content: message },
      { conversation_id, role: 'model', content: reply },
    ]);

    // Auto-title: if this is the first user message, set conversation title
    if (!existingMsgs || existingMsgs.length === 0) {
      // Use first ~40 chars of user message as title
      const title = message.length > 40 ? message.slice(0, 40) + '…' : message;
      await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', conversation_id);
    } else {
      // Just update timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
