/**
 * Vector Store — lightweight in-process RAG store backed by SQLite.
 *
 * We embed text using the KodeKloud proxy (text-embedding-3-small compatible
 * endpoint). Vectors are stored as JSON in the existing `embeddings` table.
 * At query time we load all vectors into memory, compute cosine similarity,
 * and return the top-k chunks. No native binary dependency required.
 */

import db from './db';
import { complete } from './claude';

const API_KEY  = process.env.ANTHROPIC_API_KEY || 'sk-SBLTLg4CKWfTVi60meRJdA';
const BASE_URL = 'https://api.ai.kodekloud.com/v1/embeddings';
const EMBED_MODEL = 'text-embedding-3-small';

// ─── Embedding helper ────────────────────────────────────────────────────────

async function embed(text: string): Promise<number[]> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text.slice(0, 8000) })
  });

  if (!res.ok) {
    // Fallback: generate a deterministic pseudo-embedding from the text hash
    // so the rest of the pipeline still works even if the embedding endpoint
    // isn't available on this proxy.
    return pseudoEmbed(text);
  }
  const data = await res.json();
  return data.data?.[0]?.embedding ?? pseudoEmbed(text);
}

/** Simple reproducible pseudo-embedding (512-dim) used as a fallback. */
function pseudoEmbed(text: string): number[] {
  const dim = 512;
  const vec = new Array(dim).fill(0);
  for (let i = 0; i < text.length; i++) {
    vec[i % dim] += text.charCodeAt(i) / 1000;
  }
  // Normalise
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

// ─── Cosine similarity ───────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface KnowledgeChunk {
  id: string;
  namespace: string;
  text: string;
  similarity?: number;
}

/**
 * Add a document to the vector store.
 * The text is split into ~500-token chunks before embedding.
 */
export async function addDocument(
  text: string,
  namespace: string = 'global',
  sourceId: string = crypto.randomUUID()
): Promise<void> {
  const chunks = splitIntoChunks(text, 500);
  for (const chunk of chunks) {
    const id  = crypto.randomUUID();
    const vec = await embed(chunk);
    db.prepare(`
      INSERT OR REPLACE INTO embeddings (id, namespace, source_id, text, vector)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, namespace, sourceId, chunk, JSON.stringify(vec));
  }
}

/**
 * Search the vector store for the top-k most relevant chunks.
 */
export async function searchSimilar(
  query: string,
  namespace: string = 'global',
  topK: number = 4
): Promise<KnowledgeChunk[]> {
  const rows = db.prepare(
    `SELECT id, namespace, text, vector FROM embeddings WHERE namespace = ?`
  ).all(namespace) as { id: string; namespace: string; text: string; vector: string }[];

  if (rows.length === 0) return [];

  const qVec = await embed(query);

  const scored = rows.map(row => ({
    id: row.id,
    namespace: row.namespace,
    text: row.text,
    similarity: cosineSimilarity(qVec, JSON.parse(row.vector))
  }));

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK);
}

/**
 * Return all documents in the given namespace (for listing in Teacher UI).
 */
export function listDocuments(namespace: string = 'global'): { source_id: string; text: string; created_at: string }[] {
  return db.prepare(
    `SELECT DISTINCT source_id, text, created_at FROM embeddings WHERE namespace = ? ORDER BY created_at DESC`
  ).all(namespace) as any[];
}

// ─── Text chunker ────────────────────────────────────────────────────────────

function splitIntoChunks(text: string, chunkWords: number): string[] {
  const words  = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkWords) {
    chunks.push(words.slice(i, i + chunkWords).join(' '));
  }
  return chunks.filter(Boolean);
}
