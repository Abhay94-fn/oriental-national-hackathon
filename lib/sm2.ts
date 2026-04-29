export interface SM2Card {
  ef: number;       // Easiness Factor (min 1.3)
  interval: number; // Current interval in days
  reps: number;     // Successful repetitions
}

export interface SM2Result extends SM2Card {
  nextReview: string; // ISO date YYYY-MM-DD
}

// Quality q: 0=blackout, 1=wrong, 2=wrong but familiar, 3=hard, 4=good, 5=perfect
export function sm2(card: SM2Card, q: number): SM2Result {
  let { ef, interval, reps } = card;
  
  if (q < 3) {
    // Failed — reset repetitions, keep interval at 1
    return {
      ef: Math.max(1.3, ef - 0.8),
      interval: 1,
      reps: 0,
      nextReview: daysFromNow(1),
    };
  }
  
  // Passed — update EF
  const newEF = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  
  // Update interval
  let newInterval: number;
  if (reps === 0) newInterval = 1;
  else if (reps === 1) newInterval = 6;
  else newInterval = Math.round(interval * newEF);
  
  return {
    ef: newEF,
    interval: newInterval,
    reps: reps + 1,
    nextReview: daysFromNow(newInterval),
  };
}

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Compute memory strength (0-100) from SM-2 state
export function computeStrength(card: SM2Card & { nextReview: string }): number {
  const daysOverdue = Math.max(0,
    (new Date().getTime() - new Date(card.nextReview).getTime()) / 86400000
  );
  const baseStrength = Math.min(100, card.reps * 15 + card.ef * 10);
  return Math.max(0, Math.round(baseStrength - daysOverdue * 5));
}
