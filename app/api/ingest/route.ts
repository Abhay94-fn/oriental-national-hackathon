export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { upsertEmbedding } from '../../../lib/vectorStore';

export async function POST(request: Request) {
  try {
    const { namespace, source_id, text, id } = await request.json();
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    const newId = await upsertEmbedding({ id, namespace, source_id, text });
    return NextResponse.json({ id: newId });
  } catch (e) {
    console.error('Ingest API Error', e);
    return NextResponse.json({ error: 'Failed to ingest' }, { status: 500 });
  }
}
