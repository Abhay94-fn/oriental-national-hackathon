export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../../lib/auth';
import db from '../../../../lib/db';
import { addDocument, listDocuments } from '../../../../lib/vectorStore';

// ─── POST — Teacher uploads a knowledge document ────────────────────────────

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId) as any;
    if (user?.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden — Teachers only' }, { status: 403 });
    }

    const { title, content, subject, exam } = await request.json();

    if (!content || content.trim().length < 20) {
      return NextResponse.json({ error: 'Content must be at least 20 characters.' }, { status: 400 });
    }

    // Namespace by exam + subject so retrieval is scoped correctly
    const namespace = `${exam || 'global'}::${subject || 'general'}`.toLowerCase().replace(/\s+/g, '_');

    // Also index under "global" namespace so all students benefit
    const fullText = `${title ? `Title: ${title}\n\n` : ''}${content}`;
    await addDocument(fullText, namespace);
    await addDocument(fullText, 'global'); // always index globally too

    return NextResponse.json({
      success: true,
      message: `Knowledge indexed in namespace "${namespace}" and global.`,
      namespace
    });

  } catch (error) {
    console.error('Knowledge upload error:', error);
    return NextResponse.json({ error: 'Failed to index document.' }, { status: 500 });
  }
}

// ─── GET — List knowledge documents for the teacher ─────────────────────────

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;

    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(session.userId) as any;
    if (user?.role !== 'teacher') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const docs = listDocuments('global');
    // Return just the first chunk per source for preview
    const seen = new Set<string>();
    const preview = docs.filter(d => {
      if (seen.has(d.source_id)) return false;
      seen.add(d.source_id);
      return true;
    }).map(d => ({
      source_id: d.source_id,
      preview: d.text.slice(0, 150) + (d.text.length > 150 ? '…' : ''),
      created_at: d.created_at
    }));

    return NextResponse.json({ documents: preview });

  } catch (error) {
    console.error('Knowledge list error:', error);
    return NextResponse.json({ error: 'Failed to list documents.' }, { status: 500 });
  }
}
