import type { Word } from '../types';

// Simple tokenizer and pivot calculator for RSVP
export function tokenizeWords(text: string, wpm: number = 300): Word[] {
  const baseDelayMs = 60000 / wpm;
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const len = word.length;
      let pivotIndex = 0;
      if (len >= 3 && len <= 5) pivotIndex = 1;
      else if (len >= 6 && len <= 8) pivotIndex = 2;
      else if (len >= 9 && len <= 11) pivotIndex = 3;
      else if (len >= 12) pivotIndex = 4;
      return {
        text: word,
        pivotIndex,
        baseDelayMs,
      };
    });
}
