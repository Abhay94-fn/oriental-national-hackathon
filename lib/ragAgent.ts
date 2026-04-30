/**
 * LangChain-style RAG Agent
 *
 * Architecture:
 *   1. RETRIEVE — search the vector store for teacher-uploaded context
 *   2. AUGMENT  — prepend retrieved context to the system prompt
 *   3. GENERATE — call the LLM with the augmented prompt
 *
 * The agent exposes `ragStream()` for streaming responses (used by the
 * AI Tutor) and `ragComplete()` for blocking responses.
 */

import { searchSimilar } from './vectorStore';
import { complete, stream } from './claude';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RAGOptions {
  namespace?: string; // Usually the exam name e.g. "UPSC"
  topK?: number;
  minSimilarity?: number;
}

// ─── Retrieval helper ────────────────────────────────────────────────────────

async function retrieveContext(
  query: string,
  opts: RAGOptions
): Promise<{ context: string; hasContext: boolean }> {
  const namespace    = opts.namespace || 'global';
  const topK         = opts.topK ?? 4;
  const minSim       = opts.minSimilarity ?? 0.15;

  const chunks = await searchSimilar(query, namespace, topK);
  const relevant = chunks.filter(c => (c.similarity ?? 0) >= minSim);

  if (relevant.length === 0) return { context: '', hasContext: false };

  const context = relevant
    .map((c, i) => `[Source ${i + 1}]\n${c.text}`)
    .join('\n\n---\n\n');

  return { context, hasContext: true };
}

// ─── Augment system prompt ───────────────────────────────────────────────────

function buildAugmentedPrompt(basePrompt: string, context: string): string {
  if (!context) return basePrompt;
  return `${basePrompt}

---
RETRIEVED CURRICULUM CONTEXT (Teacher-Uploaded Materials):
Use the following knowledge from the teacher's curriculum as your PRIMARY reference when answering the student's question. If it is relevant, cite it naturally in your response.

${context}
---`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Streaming RAG response — used by the AI Tutor endpoint.
 * @param messages  Full conversation history
 * @param basePrompt  The base system prompt (without RAG context)
 * @param onChunk   Called with each streamed text delta
 * @param opts      RAG options (namespace, topK, minSimilarity)
 */
export async function ragStream(
  messages: Message[],
  basePrompt: string,
  onChunk: (text: string) => void,
  opts: RAGOptions = {}
): Promise<void> {
  // 1. RETRIEVE
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const query = lastUserMsg?.content || '';

  const { context, hasContext } = await retrieveContext(query, opts);

  // 2. AUGMENT
  const augmentedPrompt = buildAugmentedPrompt(basePrompt, context);

  // Optionally signal RAG was used via a special prefix chunk
  if (hasContext) {
    onChunk('\u200B'); // zero-width space signals RAG context was injected (invisible)
  }

  // 3. GENERATE
  await stream(messages, augmentedPrompt, onChunk);
}

/**
 * Blocking RAG response — for non-streaming endpoints.
 */
export async function ragComplete(
  messages: Message[],
  basePrompt: string,
  opts: RAGOptions = {}
): Promise<string> {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
  const query = lastUserMsg?.content || '';

  const { context } = await retrieveContext(query, opts);
  const augmentedPrompt = buildAugmentedPrompt(basePrompt, context);

  return complete(messages, augmentedPrompt);
}
