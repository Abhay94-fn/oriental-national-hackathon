export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { ragStream } from '../../../lib/ragAgent';
import db from '../../../lib/db';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    const { messages, subject, language, exam, sessionId, mode } = await request.json();

    const currentSessionId = sessionId || crypto.randomUUID();
    const targetExam = exam || 'Indian competitive exams';
    const isMentorMode = mode === 'mentor';

    const SYSTEM_PROMPT = isMentorMode ?
`You are an AI Mentor for students preparing for the ${targetExam}.
Current Topic: ${subject}
Language: ${language || 'English'}

STRICT CONSTRAINTS (MENTOR MODE):
1. Respond in clear ${language || 'English'} only. For Hinglish, mix naturally.
2. Give a concise explanation first, then ask at most ONE guiding question.
3. Do not start with fluff (no "I appreciate..." or long corrections).
4. Do not use markdown headers, separators, or decorative blocks.
5. Keep each reply practical and short (around 80-140 words).
6. If a question is outside ${targetExam} syllabus, answer briefly without scolding, then add one line on exam relevance.` :
`You are a helpful AI Tutor for students preparing for the ${targetExam}.
Current Topic: ${subject}
Language: ${language || 'English'}

STRICT CONSTRAINTS:
1. Respond in clear ${language || 'English'} only. For Hinglish, mix naturally.
2. Give direct, concise answers first; avoid long meta commentary.
3. Do not use markdown headers, separators, or decorative blocks.
4. Keep responses practical, cohesive, and short (around 80-140 words).
5. If a question is outside ${targetExam} syllabus, still answer briefly and respectfully, then add one short line on relevance.`;

    const userMessage = messages[messages.length - 1];
    if (userMessage.role === 'user') {
      db.prepare(`INSERT INTO conversations (user_id, session_id, role, content, subject) VALUES (?, ?, ?, ?, ?)`)
        .run(userId, currentSessionId, 'user', userMessage.content, subject || 'General');
    }

    // RAG namespace matches how teachers upload (exam::subject)
    const ragNamespace = `${targetExam}::${subject || 'general'}`.toLowerCase().replace(/\s+/g, '_');

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponse = '';
        try {
          // RAG Pipeline: Retrieve → Augment → Generate
          await ragStream(
            messages,
            SYSTEM_PROMPT,
            (text) => {
              fullResponse += text;
              controller.enqueue(encoder.encode(text));
            },
            {
              namespace: ragNamespace,
              topK: 4,
              minSimilarity: 0.15
            }
          );
          controller.close();
          db.prepare(`INSERT INTO conversations (user_id, session_id, role, content, subject) VALUES (?, ?, ?, ?, ?)`)
            .run(userId, currentSessionId, 'assistant', fullResponse, subject || 'General');
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Session-Id': currentSessionId
      }
    });

  } catch (error) {
    console.error('Tutor API Error:', error);
    return NextResponse.json({ error: 'Failed to stream response' }, { status: 500 });
  }
}
