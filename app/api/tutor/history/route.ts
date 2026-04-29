export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../../lib/auth';
import db from '../../../../lib/db';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    // Get the most recent session_id
    const recentSession = db.prepare('SELECT session_id FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId) as any;

    if (!recentSession) {
        return NextResponse.json({ messages: [], sessionId: null });
    }

    const messages = db.prepare('SELECT role, content FROM conversations WHERE user_id = ? AND session_id = ? ORDER BY id ASC').all(userId, recentSession.session_id);

    return NextResponse.json({ messages, sessionId: recentSession.session_id });

  } catch (error) {
     console.error('Tutor History API Error:', error);
     return NextResponse.json({ error: 'Failed to fetch tutor history' }, { status: 500 });
  }
}
