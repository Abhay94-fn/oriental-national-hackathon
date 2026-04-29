import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || '' });

export async function embedText(text: string): Promise<number[]> {
  if (!client.apiKey) throw new Error('OPENAI_API_KEY not set');
  const res = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return (res.data?.[0]?.embedding ?? []) as number[];
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!client.apiKey) throw new Error('OPENAI_API_KEY not set');
  const res = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });
  return (res.data ?? []).map((d: any) => d.embedding) as number[][];
}
