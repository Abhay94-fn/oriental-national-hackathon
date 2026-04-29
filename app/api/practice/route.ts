export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { completeJSON } from '../../../lib/claude';
import db from '../../../lib/db';
import { Question } from '../../../types';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';

function getUserId(): string {
  const token = cookies().get('abhay_session')?.value;
  const session = token ? verifySessionToken(token) : null;
  return session?.userId || 'anonymous';
}

export async function POST(request: Request) {
  try {
    const { subject, topic, difficulty, count, exam } = await request.json();

    const SYSTEM_PROMPT = `You are a senior question paper setter for ${exam} with 20+ years experience.
Generate exam-pattern MCQs that:
- Mirror actual PYQ difficulty and style for ${exam}
- Test conceptual understanding, NOT rote memorization
- For Physics/Maths: include numerical problems with proper units
- For Chemistry: include reaction-based and conceptual questions
- Include detailed explanations with the underlying concept
- Mark questions with the IIT/NEET chapter they belong to
Return ONLY a valid JSON array, no markdown.

Example JSON output format:
[
  {
    "id": 1,
    "question": "A particle moves in a circle of radius R...",
    "options": ["A. R/2", "B. R", "C. 2R", "D. 4R"],
    "correct": "C",
    "explanation": "Centripetal force is given by mv^2/R...",
    "concept": "Circular Motion",
    "difficulty": "Hard",
    "marks": 4,
    "negativeMarking": 1,
    "pyqYear": "${exam} 2019",
    "tags": ["Mechanics", "Numericals"]
  }
]
`;

    const prompt = `
      Subject: ${subject}
      Topic Context: ${topic || 'General mixed syllabus'}
      Target Difficulty: ${difficulty}
      Number of questions required: ${count}
      Exam Format: ${exam}
    `;

    const questions = await completeJSON<Question[]>(prompt, SYSTEM_PROMPT);

    // Provide a session reference ID so the client can post results back later if needed
    // or we can just return questions directly
    return NextResponse.json(questions);
  } catch (error) {
     console.error('Practice API Error:', error);
     return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}

// Optionally, a route to save results
export async function PUT(request: Request) {
   try {
      const userId = getUserId();
      const result = await request.json();
      db.prepare(`
         INSERT INTO test_results (user_id, subject, topic, difficulty, total_questions, correct, score_pct, time_per_q_avg, weak_concepts, questions_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
         userId, result.subject, result.topic, result.difficulty, result.totalQuestions, result.correct,
         result.scorePct, result.timePerQAvg, JSON.stringify(result.weakConcepts), JSON.stringify(result.questionsJson)
      );

      // Log session
      db.prepare(`
         INSERT INTO sessions (user_id, session_type, subject, duration_minutes, concepts_reviewed, score_pct)
         VALUES (?, 'practice', ?, ?, 0, ?)
      `).run(userId, result.subject, Math.ceil((result.timePerQAvg * result.totalQuestions) / 60), result.scorePct);

      return NextResponse.json({ success: true });
   } catch (e) {
      return NextResponse.json({ error: 'Failed to save results' }, { status: 500 });
   }
}
