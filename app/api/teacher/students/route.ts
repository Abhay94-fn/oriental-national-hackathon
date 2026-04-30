export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../../lib/auth';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify if teacher
    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId) as any;
    if (user?.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all students and their stats
    const students = db.prepare(`
      SELECT 
        u.id, u.name, u.email, u.exam, u.created_at,
        (SELECT COUNT(*) FROM test_results WHERE user_id = u.id) as tests_taken,
        (SELECT AVG(score_pct) FROM test_results WHERE user_id = u.id) as avg_score,
        (SELECT COUNT(*) FROM generated_notes WHERE user_id = u.id) as notes_generated
      FROM users u
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `).all();

    return NextResponse.json({ students });

  } catch (error) {
     console.error('Teacher Students API Error:', error);
     return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
