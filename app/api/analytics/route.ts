export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { Analytics, SubjectStat, DayActivity, CurvePoint } from '../../../types';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';

const DAY_MS = 1000 * 60 * 60 * 24;

function getUserId(): string {
  const token = cookies().get('abhay_session')?.value;
  const session = token ? verifySessionToken(token) : null;
  return session?.userId || 'anonymous';
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function computeConceptRetention(
  concept: { strength: number; interval: number; ef: number; next_review: string; updated_at?: string; created_at?: string },
  atMs: number
): number {
  const baseStrength = clamp(Number(concept.strength) || 0, 0, 100);
  if (baseStrength <= 0) return 0;

  const lastReviewTs = concept.updated_at || concept.created_at || new Date().toISOString();
  const lastReviewMs = new Date(lastReviewTs).getTime();
  const elapsedDays = Math.max(0, (atMs - lastReviewMs) / DAY_MS);

  const intervalDays = Math.max(1, Number(concept.interval) || 1);
  const ef = Math.max(1.3, Number(concept.ef) || 2.5);
  const halfLife = intervalDays * ef;
  const naturalDecay = Math.pow(0.5, elapsedDays / halfLife);

  const nextReviewMs = new Date(concept.next_review).getTime();
  const overdueDays = Number.isFinite(nextReviewMs) ? Math.max(0, (atMs - nextReviewMs) / DAY_MS) : 0;
  const overduePenalty = Math.exp(-0.12 * overdueDays);

  return clamp(Math.round(baseStrength * naturalDecay * overduePenalty), 0, 100);
}

export async function GET() {
  try {
    const userId = getUserId();
    const userConceptWhere = `COALESCE(user_id, 'anonymous') = ?`;
    const userSessionWhere = `COALESCE(user_id, 'anonymous') = ?`;

    const totalConcepts = (db.prepare(`SELECT COUNT(*) as c FROM concepts WHERE ${userConceptWhere}`).get(userId) as { c: number }).c;
    
    const todayStr = new Date().toISOString().slice(0, 10);
    const dueToday = (db.prepare(`SELECT COUNT(*) as c FROM concepts WHERE ${userConceptWhere} AND next_review <= ?`).get(userId, todayStr) as { c: number }).c;
    
    const masteredConcepts = (db.prepare(`SELECT COUNT(*) as c FROM concepts WHERE ${userConceptWhere} AND strength >= 80`).get(userId) as { c: number }).c;
    
    const weakConcepts = (db.prepare(`SELECT COUNT(*) as c FROM concepts WHERE ${userConceptWhere} AND strength <= 40`).get(userId) as { c: number }).c;
    
    const avgStrengthRow = db.prepare(`SELECT AVG(strength) as a FROM concepts WHERE ${userConceptWhere}`).get(userId) as { a: number | null };
    const avgStrength = avgStrengthRow.a ? Math.round(avgStrengthRow.a) : 0;

    const subjectsDb = db.prepare(`
      SELECT topic as subject, COUNT(*) as count, AVG(strength) as avgStrength, 
             SUM(CASE WHEN next_review <= ? THEN 1 ELSE 0 END) as due
      FROM concepts 
      WHERE ${userConceptWhere}
      GROUP BY topic
    `).all(todayStr, userId) as { subject: string; count: number; avgStrength: number; due: number }[];

    const subjectBreakdown: SubjectStat[] = subjectsDb.map(s => ({
      ...s,
      avgStrength: Math.round(s.avgStrength),
      due: s.due || 0
    }));

    // Weekly activity (last 7 days)
    const weeklyActivity: DayActivity[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      
      const stats = db.prepare(`
        SELECT SUM(concepts_reviewed) as cards, SUM(duration_minutes) as mins
        FROM sessions
        WHERE ${userSessionWhere} AND date(created_at) = ?
      `).get(userId, dateStr) as { cards: number | null, mins: number | null };

      weeklyActivity.push({
        date: dateStr.slice(5), // MM-DD
        cardsReviewed: stats.cards || 0,
        minutesStudied: stats.mins || 0
      });
    }

    const conceptRows = db.prepare(`
      SELECT strength, interval, ef, next_review, updated_at, created_at
      FROM concepts
      WHERE ${userConceptWhere}
    `).all(userId) as {
      strength: number;
      interval: number;
      ef: number;
      next_review: string;
      updated_at?: string;
      created_at?: string;
    }[];

    // Real-time per-student forgetting curve based on each concept's SM-2 state
    const forgettingCurveData: CurvePoint[] = [];
    for (let i = 0; i < 30; i++) {
      if (!conceptRows.length) {
        forgettingCurveData.push({ day: i, retention: 0 });
        continue;
      }

      const atMs = Date.now() + (i * DAY_MS);
      const avgRetention = Math.round(
        conceptRows.reduce((sum, concept) => sum + computeConceptRetention(concept, atMs), 0) / conceptRows.length
      );
      forgettingCurveData.push({ day: i, retention: avgRetention });
    }

    const profileRaw = db.prepare('SELECT streak FROM profile WHERE id = 1').get() as { streak: number } | undefined;
    const studyStreak = profileRaw ? profileRaw.streak : 0;

    const analytics: Analytics = {
      totalConcepts,
      dueToday,
      masteredConcepts,
      weakConcepts,
      avgStrength,
      subjectBreakdown,
      studyStreak,
      weeklyActivity,
      forgettingCurveData
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
