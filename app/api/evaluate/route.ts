export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { completeJSON } from '../../../lib/claude';
import { EvaluationResult } from '../../../types';
import db from '../../../lib/db';

import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    const { subject, question, answer } = await request.json();

    const SYSTEM_PROMPT = `You are an expert strict examiner for ${subject}.
Your task is to evaluate a student's answer to a given question.
Provide a score out of 100, constructive feedback, specific areas of improvement, and a model answer.
Return ONLY a valid JSON object, no markdown.

Example JSON output format:
{
  "score": 85,
  "feedback": "Good understanding of the concept, but lacks specific examples.",
  "improvements": ["Include real-world examples", "Use correct terminology"],
  "modelAnswer": "The ideal answer would be..."
}
`;

    const prompt = `
Question: ${question}
Student's Answer: ${answer}

Evaluate the answer.
`;

    const evaluation = await completeJSON<EvaluationResult>(prompt, SYSTEM_PROMPT);

    // Save to DB
    db.prepare(`
      INSERT INTO evaluations (user_id, subject, question, student_answer, score, feedback)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, subject, question, answer, evaluation.score, evaluation.feedback);

    return NextResponse.json(evaluation);
  } catch (error) {
     console.error('Evaluate API Error:', error);
     return NextResponse.json({ error: 'Failed to evaluate answer' }, { status: 500 });
  }
}
