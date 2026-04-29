import { completeJSON } from './claude';
import db from './db';
import crypto from 'crypto';

export function initKG() {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS kg_nodes (
      id TEXT PRIMARY KEY,
      namespace TEXT,
      label TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `).run();
  db.prepare(`
    CREATE TABLE IF NOT EXISTS kg_edges (
      id TEXT PRIMARY KEY,
      namespace TEXT,
      source_node TEXT NOT NULL,
      target_node TEXT NOT NULL,
      relation TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `).run();
}

initKG();

export async function extractAndStoreKG(text: string, namespace = 'default') {
  const SYSTEM_PROMPT = `Extract concept nodes and directed relations from the input text. Return ONLY a JSON object with two arrays: \"nodes\" and \"edges\". Each node: {id, label, metadata}. Each edge: {id, source, target, relation, metadata}.`;
  const prompt = `Text:\n${text}\nReturn nodes and edges.`;
  const parsed = await completeJSON<any>(prompt, SYSTEM_PROMPT);
  const insertNode = db.prepare('INSERT OR REPLACE INTO kg_nodes (id, namespace, label, metadata) VALUES (?, ?, ?, ?)');
  const insertEdge = db.prepare('INSERT OR REPLACE INTO kg_edges (id, namespace, source_node, target_node, relation, metadata) VALUES (?, ?, ?, ?, ?, ?)');
  const nodes = Array.isArray(parsed?.nodes) ? parsed.nodes : [];
  const edges = Array.isArray(parsed?.edges) ? parsed.edges : [];
  for (const n of nodes) {
    const id = n.id || crypto.randomUUID();
    insertNode.run(id, namespace, n.label || n.name || '', JSON.stringify(n.metadata || {}));
  }
  for (const e of edges) {
    const id = e.id || crypto.randomUUID();
    insertEdge.run(id, namespace, e.source, e.target, e.relation || '', JSON.stringify(e.metadata || {}));
  }
  return { nodesCount: nodes.length, edgesCount: edges.length };
}

export function queryKG(namespace: string, term: string, limit = 10) {
  const rows = db.prepare('SELECT * FROM kg_nodes WHERE namespace = ? AND label LIKE ? LIMIT ?').all(namespace, `%${term}%`, limit);
  return rows;
}
