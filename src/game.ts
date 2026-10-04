// 画面に依存しないゲームのルール。ここはユニットテストで守る
export const TIME_LIMIT_MS = 60_000;
export const MAX_BONUS = 5;

export type State = { index: number; score: number; combo: number; maxCombo: number; timeLeft: number };

export function start(): State {
  return { index: 0, score: 0, combo: 0, maxCombo: 0, timeLeft: TIME_LIMIT_MS };
}

export function current(words: string[], s: State): string {
  return words[s.index % words.length];
}

export function isOver(s: State): boolean {
  return s.timeLeft <= 0;
}

export function tick(s: State, dtMs: number): State {
  return { ...s, timeLeft: Math.max(0, s.timeLeft - dtMs) };
}

export function submit(words: string[], s: State, typed: string): State {
  if (isOver(s)) return s;
  if (typed !== current(words, s)) return s.combo === 0 ? s : { ...s, combo: 0 };
  const combo = s.combo + 1;
  return {
    ...s,
    index: s.index + 1,
    score: s.score + 1 + Math.min(s.combo, MAX_BONUS),
    combo,
    maxCombo: Math.max(s.maxCombo, combo),
  };
}
