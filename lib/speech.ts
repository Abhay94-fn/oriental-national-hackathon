export type NarratorPreference = 'female' | 'male' | 'neutral';

const languagePrefixMap: Record<string, string> = {
  English: 'en',
  Hinglish: 'en',
  Hindi: 'hi',
  Tamil: 'ta',
  Telugu: 'te',
  Bengali: 'bn',
  Marathi: 'mr',
  Gujarati: 'gu',
};

const premiumHints = ['google', 'natural', 'neural', 'premium', 'enhanced'];
const femaleHints = ['female', 'woman', 'girl', 'samantha', 'aria', 'zira', 'veena'];
const maleHints = ['male', 'man', 'boy', 'daniel', 'alex', 'david', 'rishi'];

export function resolveNarrationLang(language: string): string {
  if (language === 'Hindi') return 'hi-IN';
  if (language === 'Tamil') return 'ta-IN';
  if (language === 'Telugu') return 'te-IN';
  if (language === 'Bengali') return 'bn-IN';
  if (language === 'Marathi') return 'mr-IN';
  if (language === 'Gujarati') return 'gu-IN';
  return 'en-IN';
}

export function pickNarratorVoice(
  voices: SpeechSynthesisVoice[],
  language: string,
  narrator: NarratorPreference
): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  const targetPrefix = languagePrefixMap[language] || 'en';
  const preferredLangVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().includes(targetPrefix)
  );
  const pool = preferredLangVoices.length ? preferredLangVoices : voices;

  const scored = pool.map((voice) => {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let score = 0;

    if (lang.includes(`${targetPrefix}-`)) score += 20;
    if (premiumHints.some((hint) => name.includes(hint))) score += 15;

    if (narrator === 'female') {
      if (femaleHints.some((hint) => name.includes(hint))) score += 25;
      if (maleHints.some((hint) => name.includes(hint))) score -= 10;
    }

    if (narrator === 'male') {
      if (maleHints.some((hint) => name.includes(hint))) score += 25;
      if (femaleHints.some((hint) => name.includes(hint))) score -= 10;
    }

    return { voice, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.voice || null;
}
