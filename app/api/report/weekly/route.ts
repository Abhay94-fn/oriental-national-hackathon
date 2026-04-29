export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../../lib/auth';
import db from '../../../../lib/db';
import { complete } from '../../../../lib/claude';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    // Get the latest report
    const latestReport = db.prepare('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
    
    return NextResponse.json({ report: latestReport || null });
  } catch (error) {
     console.error('Weekly Report API Error:', error);
     return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    // Aggregate data for the last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString();

    const evaluations = db.prepare('SELECT subject, score, feedback FROM evaluations WHERE user_id = ? AND created_at > ?').all(userId, weekAgoStr) as any[];
    const conversations = db.prepare('SELECT subject, content FROM conversations WHERE user_id = ? AND role = "user" AND created_at > ?').all(userId, weekAgoStr) as any[];

    // Build the context string
    const evalData = evaluations.map(e => `Evaluated in ${e.subject}: Scored ${e.score}/100. Feedback: ${e.feedback}`).join('\n');
    const chatTopics = conversations.map(c => `Asked about: ${c.subject} - "${c.content}"`).slice(0, 15).join('\n'); // limit to 15 questions

    const SYSTEM_PROMPT = `You are an expert AI Mentor and Learning Coach.
Analyze the student's activity over the past week and generate a "Weekly Learning Report".
Highlight improvements, identify weak areas based on their scores and questions asked, and provide actionable advice.
Use professional, encouraging language and Markdown formatting.
Keep it concise but insightful. Format with headers like "Weekly Progress", "Areas to Improve", and "Action Plan".`;

    const prompt = `
Student Data from the past 7 days:
---
Evaluations:
${evalData || 'No evaluations taken this week.'}

---
Questions Asked to AI Tutor:
${chatTopics || 'No questions asked this week.'}

Please generate the personalized weekly report.`;

    const reportMarkdown = await complete([{ role: 'user', content: prompt }], SYSTEM_PROMPT);

    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO reports (user_id, week_start, week_end, report_markdown)
      VALUES (?, ?, ?, ?)
    `).run(userId, weekAgoStr, now, reportMarkdown);

    // Fetch the newly inserted report
    const newReport = db.prepare('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);

    return NextResponse.json({ report: newReport });
  } catch (error) {
     console.error('Generate Weekly Report Error:', error);
     return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
