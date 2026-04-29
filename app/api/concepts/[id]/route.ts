export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { sm2, computeStrength } from '../../../../lib/sm2';
import { Concept } from '../../../../types';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../../lib/auth';

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { quality } = await request.json();
    const id = Number(params.id);
    const userId = getUserId();

    const concept = db
      .prepare(`SELECT * FROM concepts WHERE id = ? AND COALESCE(user_id, 'anonymous') = ?`)
      .get(id, userId) as any;
    if (!concept) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const result = sm2({ ef: concept.ef, interval: concept.interval, reps: concept.reps }, quality);
    const strength = computeStrength({ ...result, nextReview: result.nextReview });

    db.prepare(`
      UPDATE concepts 
      SET ef = ?, interval = ?, reps = ?, next_review = ?, strength = ?, updated_at = datetime('now')
      WHERE id = ? AND COALESCE(user_id, 'anonymous') = ?
    `).run(result.ef, result.interval, result.reps, result.nextReview, strength, id, userId);

    db.prepare(`
      INSERT INTO sessions (user_id, session_type, subject, duration_minutes, concepts_reviewed, created_at)
      VALUES (?, 'review', ?, 1, 1, datetime('now'))
    `).run(userId, concept.topic);

    const updated = db
      .prepare(`SELECT * FROM concepts WHERE id = ? AND COALESCE(user_id, 'anonymous') = ?`)
      .get(id, userId) as Concept;
    
    return NextResponse.json(toConcept(updated));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId();
    db.prepare(`DELETE FROM concepts WHERE id = ? AND COALESCE(user_id, 'anonymous') = ?`).run(Number(params.id), userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
