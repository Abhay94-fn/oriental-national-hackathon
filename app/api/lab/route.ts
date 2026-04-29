export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { completeJSON } from '../../../lib/claude';
import { getVideoMetadata, getTranscript } from '../../../lib/youtube';
import db from '../../../lib/db';
import { LabNotes } from '../../../types';

export async function POST(request: Request) {
  try {
    const { url, language, exam } = await request.json();

    const metadata = await getVideoMetadata(url);
    const transcriptText = await getTranscript(url, metadata.id);

    // If no transcript, we use title + desc
    const contentToProcess = transcriptText || `Title: ${metadata.title}\nDescription: ${metadata.description}`;

    if (!contentToProcess.trim()) {
       return NextResponse.json({ error: 'No content could be extracted from this video.' }, { status: 400 });
    }

    const targetExam = exam || 'Indian competitive exams';
    const SYSTEM_PROMPT = `You are an expert educational content analyst for Indian competitive exams.
Analyze the provided YouTube transcript/content and generate structured study notes.
The student is preparing for ${targetExam}. 
Output language: ${language}

Make the notes:
- Exam-focused (highlight what's tested in ${targetExam})
- Structured for active recall (not passive reading)
- Include memory hooks and mnemonics where applicable
Return ONLY valid compact JSON, no markdown.

Example JSON shape:
{
  "title": "",
  "subject": "",
  "estimatedStudyTime": "",
  "examRelevance": "High",
  "keyPoints": [],
  "concepts": [{"name": "", "explanation": "", "formula": "", "difficulty": "Medium", "examWeight": "", "mnemonic": ""}],
  "summary": "",
  "mindMap": [{"node": "", "children": []}],
  "practiceQuestions": [{"question": "", "hint": "", "answer": ""}],
  "keyFormulas": [],
  "importantForExam": "",
  "relatedTopics": [],
  "ncertReference": ""
}
`;

    // Process first chunk if transcript is too long to save tokens
    const maxChars = 20000;
    const truncatedContent = contentToProcess.length > maxChars ? contentToProcess.substring(0, maxChars) + '...' : contentToProcess;

    const data = await completeJSON<LabNotes>(`Video Content: ${truncatedContent}`, SYSTEM_PROMPT);

    // Override title with actual video title if model hallucinated
    data.title = metadata.title || data.title;

    // Save to DB
    const info = db.prepare(`
      INSERT INTO lab_notes (youtube_url, video_id, title, subject, language, notes_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(url, metadata.id, data.title, data.subject, language, JSON.stringify(data));

    return NextResponse.json({ ...data, videoId: metadata.id, dbId: info.lastInsertRowid });

  } catch (error) {
    console.error('Lab API Error:', error);
    return NextResponse.json({ error: 'Failed to process video' }, { status: 500 });
  }
}
