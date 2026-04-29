export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { complete } from '../../../lib/claude';
import db from '../../../lib/db';

import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    const { topic, subject, exam } = await request.json();

    const SYSTEM_PROMPT = `You are an expert professor for ${exam}. 
Your task is to generate comprehensive, highly structured, and easy-to-read study notes for a given topic.
Use Markdown formatting extensively.
Include the following sections:
- **Core Concepts:** The fundamental ideas explained simply.
- **Key Formulas / Syntax:** Any important mathematical formulas, chemical equations, or code syntax.
- **Important Definitions:** Precise definitions of key terms.
- **Common Pitfalls:** Mistakes students usually make.
- **Exam Relevance:** How this topic is usually tested in ${exam}.
- **Quick Mnemonics (if applicable):** Memory aids.

Keep the tone academic but accessible. Use bullet points and bold text for readability.`;

    const prompt = `Please generate study notes for:
Subject: ${subject}
Topic: ${topic}`;

    const notesMarkdown = await complete([{ role: 'user', content: prompt }], SYSTEM_PROMPT);

    // Optionally save to DB (we'll save it to generated_notes)
    try {
        db.prepare(`
          INSERT INTO generated_notes (user_id, topic, subtopic, summary, source)
          VALUES (?, ?, ?, ?, ?)
        `).run(userId, subject, topic, notesMarkdown, 'ai_generated');
    } catch (dbErr) {
        console.error('Failed to save note to DB', dbErr);
    }

    return NextResponse.json({ markdown: notesMarkdown });
  } catch (error) {
     console.error('Notes API Error:', error);
     return NextResponse.json({ error: 'Failed to generate notes' }, { status: 500 });
  }
}
