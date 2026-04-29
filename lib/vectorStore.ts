import db from './db';
import { embedText } from './embeddings';
import crypto from 'crypto';

export function initVectorStore() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS embeddings (
      id TEXT PRIMARY KEY,
      namespace TEXT,
      source_id TEXT,
      text TEXT,
      vector TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `).run();
}

initVectorStore();

export async function upsertEmbedding({ id, namespace = 'default', source_id, text }: { id?: string; namespace?: string; source_id?: string; text: string }) {
  const uuid = id || crypto.randomUUID();
  const vec = await embedText(text);
  const stmt = db.prepare('INSERT OR REPLACE INTO embeddings (id, namespace, source_id, text, vector) VALUES (?, ?, ?, ?, ?)');
  stmt.run(uuid, namespace, source_id || uuid, text, JSON.stringify(vec));
  return uuid;
}

function dot(a: number[], b: number[]) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
function norm(a: number[]) { return Math.sqrt(dot(a, a)); }
function cosine(a: number[], b: number[]) { const na = norm(a); const nb = norm(b); if (!na || !nb) return 0; return dot(a, b) / (na * nb); }

export async function semanticSearch(namespace: string, query: string, topK: number = 5) {
  const qvec = await embedText(query);
  const rows = db.prepare('SELECT id, source_id, text, vector FROM embeddings WHERE namespace = ?').all(namespace || 'default');
  const scored = rows.map((r: any) => {
    try {
      const vec = JSON.parse(r.vector);
      const score = cosine(qvec, vec);
      return { id: r.id, source_id: r.source_id, text: r.text, score };
    } catch (e) {
      return { id: r.id, source_id: r.source_id, text: r.text, score: -1 };
    }
  }).sort((a: any, b: any) => b.score - a.score).slice(0, topK);
  return scored;
}
