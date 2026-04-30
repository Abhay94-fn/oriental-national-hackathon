// Switching to OpenAI-compatible fetch to support KodeKloud proxy
const BASE_URL = 'https://api.ai.kodekloud.com/v1/chat/completions';

const PROVIDERS = [
  { model: 'claude-opus-4-7', key: 'sk-SyrCd_d0u54Xde4s87kmSw' },
  { model: 'google/gemini-3.1-pro-preview', key: 'sk-2VQz2J1ghKscbZrvO8_wZA' },
  { model: 'minimax/minimax-m2.5', key: 'sk-9-GlN_uS0ogQ5MooJwkOew' },
  { model: 'claude-haiku-4-5-20251001', key: process.env.ANTHROPIC_API_KEY || 'sk-SBLTLg4CKWfTVi60meRJdA' }
];

async function fetchWithFallback(bodyBuilder: (model: string) => any, stream: boolean = false) {
  let lastError: Error | null = null;
  
  for (const provider of PROVIDERS) {
    try {
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.key}`
        },
        body: JSON.stringify({
          model: provider.model,
          ...bodyBuilder(provider.model),
          stream
        })
      });

      if (!res.ok) {
        throw new Error(`API Error with ${provider.model}: ${res.status}`);
      }
      
      return res;
    } catch (e: any) {
      lastError = e;
      console.warn(`Provider failed: ${provider.model}`, e.message);
      continue; // Try next provider
    }
  }
  
  throw lastError || new Error('All providers failed');
}

export async function complete(
  messages: { role: 'user' | 'assistant'; content: string }[],
  system: string,
  maxTokens: number = 2000
): Promise<string> {
  const res = await fetchWithFallback(() => ({
    messages: [
      { role: 'system', content: system },
      ...messages
    ],
    max_tokens: maxTokens
  }));

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export async function stream(
  messages: { role: 'user' | 'assistant'; content: string }[],
  system: string,
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetchWithFallback(() => ({
    messages: [
      { role: 'system', content: system },
      ...messages
    ]
  }), true);
  
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
      const res = await fetchWithFallback((model) => {
        // Some models might not support response_format: { type: 'json_object' }
        // If they throw 400, the fallback logic will automatically try the next model.
        return {
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        };
      });
      
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const clean = content.replace(/```json\n?|```[\w]*\n?|```/g, '').trim();
      return JSON.parse(clean) as T;
    } catch (e) {
      if (attempt === 2) throw new Error('Failed to parse AI JSON response after 3 attempts. Last error: ' + (e as Error).message);
    }
  }
  throw new Error('unreachable');
}
