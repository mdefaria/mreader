import type { Word } from '../types';

// Pivot index heuristic reused across loaders / on-demand word source.
export function computePivotIndex(len: number): number {
  if (len >= 12) return 4;
  if (len >= 9) return 3;
  if (len >= 6) return 2;
  if (len >= 3) return 1;
  return 0;
}

// Basic word normalization: collapse whitespace has already happened before calling.
export function buildWord(text: string, wpm: number): Word {
  return {
    text,
    pivotIndex: computePivotIndex(text.length),
    baseDelayMs: 60000 / wpm,
  };
}

// Legacy whole-book tokenizer (still exported for migration / single segment cases)
export function tokenizeWords(text: string, wpm: number = 300): Word[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => buildWord(word, wpm));
}
