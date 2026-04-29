export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';
import db from '../../../lib/db';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    const { title, type, url, description } = await request.json();

    db.prepare(`
      INSERT INTO saved_resources (user_id, title, type, url, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, title, type, url, description);

    return NextResponse.json({ success: true });
  } catch (error) {
     console.error('Bookmarks API Error:', error);
     return NextResponse.json({ error: 'Failed to save bookmark' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    const userId = session?.userId || 'anonymous';

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
       return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    db.prepare('DELETE FROM saved_resources WHERE id = ? AND user_id = ?').run(id, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
     console.error('Bookmarks API Error:', error);
     return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
  }
}
