export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { completeJSON } from '../../../lib/claude';
import { LearningPath } from '../../../types';
import db from '../../../lib/db';

import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    const { targetExam, currentLevel, weakAreas } = await request.json();

    const SYSTEM_PROMPT = `You are a master curriculum designer and AI learning path generator.
Create a detailed, phase-by-phase learning path for a student.
Target Exam: ${targetExam}
Current Level: ${currentLevel}
Weak Areas: ${weakAreas ? weakAreas.join(', ') : 'None'}

Return ONLY a valid JSON object representing the learning path, with NO markdown formatting.

Example JSON output format:
{
  "targetExam": "${targetExam}",
  "currentLevel": "${currentLevel}",
  "totalEstimatedHours": 120,
  "phases": [
    {
      "phaseName": "Phase 1: Foundation Building",
      "description": "Strengthen core concepts before moving to advanced topics.",
      "milestones": [
        {
          "title": "Mastering Basic Algebra",
          "description": "Focus on linear equations and polynomials.",
          "estimatedHours": 10,
          "resources": ["NCERT Chapter 2", "Khan Academy Algebra Basics"]
        }
      ]
    }
  ]
}
`;

    const prompt = `Generate a comprehensive learning path. Ensure the total hours are realistic and milestones are actionable.`;

    const learningPath = await completeJSON<LearningPath>(prompt, SYSTEM_PROMPT);

    // Save to DB
    db.prepare(`
      INSERT INTO learning_paths (user_id, target_exam, current_level, path_json)
      VALUES (?, ?, ?, ?)
    `).run(userId, targetExam, currentLevel, JSON.stringify(learningPath));

    return NextResponse.json(learningPath);
  } catch (error) {
     console.error('Learning Path API Error:', error);
     return NextResponse.json({ error: 'Failed to generate learning path' }, { status: 500 });
  }
}
