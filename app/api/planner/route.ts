export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { completeJSON } from '../../../lib/claude';
import db from '../../../lib/db';
import { StudyPlan } from '../../../types';

const SYSTEM_PROMPT = `You are an elite IIT/NEET/UPSC coach with 20 years experience. 
Generate a scientifically-structured study plan that:
- Prioritizes weak areas while maintaining strong areas
- Interleaves subjects to reduce cognitive fatigue (Pomodoro-aligned)
- Schedules harder topics in morning sessions, revision in evenings
- Includes mandatory breaks and a weekly mock test
Return ONLY valid compact JSON, no markdown, no explanation.

Example valid JSON output shape:
{
  "summary": "Focus week on weak areas",
  "weeklyHours": 42,
  "examCountdown": 90,
  "days": [
    {
      "day": "Monday",
      "date": "2024-10-14",
      "theme": "Physics Mastery",
      "totalHours": 6,
      "sessions": [
        {
          "time": "9:00–11:00 AM",
          "subject": "Physics",
          "topic": "Thermodynamics",
          "type": "Learn",
          "priority": "High",
          "resources": ["NCERT", "HC Verma"],
          "description": "Deep dive into First Law",
          "pomodoroCount": 4
        }
      ],
      "target": "Master 1st Law",
      "motiveTip": "Start strong!",
      "completionPct": 0
    }
  ],
  "tipsForWeek": ["Tip 1", "Tip 2"],
  "weeklyTarget": "Complete Thermo"
}`;

export async function POST(request: Request) {
  try {
    const { examDate, dailyHours, weakAreas, exam, existingConcepts } = await request.json();

    const today = new Date();
    const currentDayStr = today.toISOString().slice(0, 10);
    const countdown = Math.ceil((new Date(examDate).getTime() - today.getTime()) / 86400000);

    const prompt = `
      Student Profile:
      - Exam: ${exam}
      - Exam Date: ${examDate} (${countdown} days left)
      - Daily Capacity: ${dailyHours} hours
      - Weak Areas: ${weakAreas.join(', ')}
      - Current Knowledge Base Context: ${existingConcepts.length} concepts captured.
      - Start Date for Plan: ${currentDayStr}

      Generate the 3-day study plan matching the JSON type structure specified.
      Distribute the daily capacity across appropriate sessions.
    `;

    const planData = await completeJSON<StudyPlan>(prompt, SYSTEM_PROMPT);

    // Save plan to DB
    const info = db.prepare(`
      INSERT INTO plans (exam, exam_date, daily_hours, weak_areas, plan_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(exam, examDate, dailyHours, weakAreas.join(','), JSON.stringify(planData));

    // Also attach DB ID if needed, but not strictly necessary for UI
    return NextResponse.json(planData);
  } catch (error) {
    console.error('Planner API Error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}

export async function GET() {
   try {
      const planRow = db.prepare('SELECT plan_json FROM plans ORDER BY id DESC LIMIT 1').get() as { plan_json: string } | undefined;
      if (planRow) {
         return NextResponse.json(JSON.parse(planRow.plan_json));
      }
      return NextResponse.json(null);
   } catch(e) {
      return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 });
   }
}
