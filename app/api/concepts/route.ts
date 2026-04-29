export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { Concept } from '../../../types';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';

function getUserId(): string {
  const token = cookies().get('abhay_session')?.value;
  const session = token ? verifySessionToken(token) : null;
  return session?.userId || 'anonymous';
}

function toConcept(c: any): Concept {
  return {
    id: c.id,
    topic: c.topic,
    subtopic: c.subtopic,
    summary: c.summary,
    tags: JSON.parse(c.tags || '[]'),
    source: c.source,
    ef: c.ef,
    interval: c.interval,
    reps: c.reps,
    nextReview: c.next_review,
    strength: c.strength,
    createdAt: c.created_at,
    updatedAt: c.updated_at
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const due = searchParams.get('due');
  const todayStr = new Date().toISOString().slice(0, 10);
  const userId = getUserId();

  try {
    let concepts;
    if (due === 'true') {
      concepts = db
        .prepare(`
          SELECT *
          FROM concepts
          WHERE COALESCE(user_id, 'anonymous') = ? AND next_review <= ?
          ORDER BY next_review ASC
        `)
        .all(userId, todayStr);
    } else {
      concepts = db
        .prepare(`
          SELECT *
          FROM concepts
          WHERE COALESCE(user_id, 'anonymous') = ?
          ORDER BY id DESC
        `)
        .all(userId);
    }

    return NextResponse.json(concepts.map(toConcept));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, subtopic, summary, tags = [] } = body;
    const todayStr = new Date().toISOString().slice(0, 10);
    const userId = getUserId();

    const info = db.prepare(`
      INSERT INTO concepts (user_id, topic, subtopic, summary, tags, ef, interval, reps, next_review, strength)
      VALUES (?, ?, ?, ?, ?, 2.5, 1, 0, ?, 10)
    `).run(userId, topic, subtopic, summary, JSON.stringify(tags), todayStr);

    const newConcept = db
      .prepare(`SELECT * FROM concepts WHERE id = ? AND COALESCE(user_id, 'anonymous') = ?`)
      .get(info.lastInsertRowid, userId) as Concept;
    
    return NextResponse.json(toConcept(newConcept), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
