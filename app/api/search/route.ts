export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { semanticSearch } from '../../../lib/vectorStore';

export async function POST(request: Request) {
  try {
    const { namespace, query, top_k } = await request.json();
    if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    const results = await semanticSearch(namespace || 'default', query, top_k || 5);
    return NextResponse.json(results);
  } catch (e) {
    console.error('Search API Error', e);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
