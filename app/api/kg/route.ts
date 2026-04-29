export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { extractAndStoreKG, queryKG } from '../../../lib/kg';

export async function POST(request: Request) {
  try {
    const { namespace, text } = await request.json();
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    const res = await extractAndStoreKG(text, namespace || 'default');
    return NextResponse.json(res);
  } catch (e) {
    console.error('KG Ingest Error', e);
    return NextResponse.json({ error: 'Failed to ingest KG' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const namespace = url.searchParams.get('namespace') || 'default';
    const q = url.searchParams.get('q') || '';
    const nodes = queryKG(namespace, q, 20);
    return NextResponse.json({ nodes });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to query KG' }, { status: 500 });
  }
}
