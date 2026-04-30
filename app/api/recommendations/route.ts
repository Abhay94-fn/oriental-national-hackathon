export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { completeJSON } from '../../../lib/claude';
import { Recommendation } from '../../../types';

export async function POST(request: Request) {
  try {
    const { targetExam, weakAreas, currentLevel } = await request.json();

    const SYSTEM_PROMPT = `You are an expert AI Education Counselor.
Your task is to recommend study resources based on a student's profile.
Generate a structured list of recommendations including courses, projects, tutorials, and YouTube videos.
If the goal is a broad question like "How can I get a seat in IIT?", output a proper step-by-step path using real, accurate, and high-quality URLs (e.g., official JEE websites, NTA, IIT portals, Coursera, or top YouTube tutorials). Do NOT use generic placeholder links; use realistic links.
Resources should specifically target their weak areas or help them achieve their target exam goals.
Return ONLY a valid JSON array, no markdown.

Example JSON output format:
[
  {
    "id": "rec-1",
    "title": "CS50's Introduction to Computer Science",
    "description": "An excellent starting point to strengthen your fundamentals.",
    "type": "Course",
    "difficulty": "Beginner",
    "link": "https://pll.harvard.edu/course/cs50-introduction-computer-science",
    "reason": "Addresses your weak area in basic algorithms."
  }
]
`;

    const prompt = `
      Target Exam / Goal: ${targetExam}
      Current Level: ${currentLevel || 'Beginner'}
      Weak Areas: ${weakAreas ? weakAreas.join(', ') : 'None specified'}
      
      Please provide 5-6 highly relevant recommendations.
    `;

    const recommendations = await completeJSON<Recommendation[]>(prompt, SYSTEM_PROMPT);

    return NextResponse.json(recommendations);
  } catch (error) {
     console.error('Recommendations API Error:', error);
     return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
