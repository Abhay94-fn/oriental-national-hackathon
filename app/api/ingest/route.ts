export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { addDocument } from '../../../lib/vectorStore';

export async function POST(request: Request) {
  try {
    const { namespace, source_id, text } = await request.json();
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    await addDocument(text, namespace || 'global', source_id);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Ingest API Error', e);
    return NextResponse.json({ error: 'Failed to ingest' }, { status: 500 });
  }
}
