export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import db from '../../../lib/db';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';

const client = new OpenAI({
    apiKey: process.env.ANTHROPIC_API_KEY || "sk-SBLTLg4CKWfTVi60meRJdA",
    baseURL: "https://api.ai.kodekloud.com/v1"
});

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    const { question, exam } = await request.json();

    const SYSTEM_PROMPT = `You are a concise AI voice assistant for an education platform.
A student is asking you a question via voice.
Explain the topic clearly as if teaching a Class 11 student.
Use simple language, short sentences, and natural speaking flow.
Avoid complex formatting and markdown completely. Make it suitable for voice narration.
Do not use meta commentary, decorative intros, or probing-question loops.
If the question is outside the student's exam syllabus, answer briefly and respectfully, then add one line on relevance.`;

    const response = await client.chat.completions.create({
        model: "claude-haiku-4-5-20251001",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: question }
        ]
    });

    const answer = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";

    const sessionId = crypto.randomUUID(); // Give it a unique session ID for voice Q&A
    db.prepare(`INSERT INTO conversations (user_id, session_id, role, content, subject) VALUES (?, ?, ?, ?, ?)`).run(userId, sessionId, 'user', question, 'Voice Assistant');
    db.prepare(`INSERT INTO conversations (user_id, session_id, role, content, subject) VALUES (?, ?, ?, ?, ?)`).run(userId, sessionId, 'assistant', answer, 'Voice Assistant');

    return NextResponse.json({ answer });
  } catch (error) {
     console.error('Voice Tutor API Error:', error);
     return NextResponse.json({ error: 'Failed to generate voice response' }, { status: 500 });
  }
}
