// Switching to OpenAI-compatible fetch to support KodeKloud proxy
const API_KEY = process.env.ANTHROPIC_API_KEY || 'sk-9-GlN_uS0ogQ5MooJwkOew';
const BASE_URL = 'https://api.ai.kodekloud.com/v1/chat/completions';
export const MODEL = 'claude-sonnet-4-6';

export async function complete(
  messages: { role: 'user' | 'assistant'; content: string }[],
  system: string,
  maxTokens: number = 2000
): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        ...messages
      ],
      max_tokens: maxTokens
    })
  });

  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function stream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  system: string,
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        ...messages
      ],
      stream: true
    })
  });

  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder("utf-8");

  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const parsed = JSON.parse(line.slice(6));
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) onChunk(delta);
        } catch (e) {}
      }
    }
  }
}

export async function completeJSON<T>(
  prompt: string,
  system: string
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });
      
      if (!res.ok) {
        if (res.status === 400 && attempt < 2) continue; // Try again
        throw new Error(`API Error: ${res.status}`);
      }
      
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const clean = content.replace(/```json\n?|```[\w]*\n?|```/g, '').trim();
      return JSON.parse(clean) as T;
    } catch (e) {
      if (attempt === 2) throw new Error('Failed to parse AI JSON response after 3 attempts');
    }
  }
  throw new Error('unreachable');
}
