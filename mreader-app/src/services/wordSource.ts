import { buildWord } from '../utils/tokenize';
import type { Word } from '../types';
import type { SegmentMeta, WordSource } from '../types/book';

// Simple in-memory segment cache with LRU eviction.
interface CachedSegment {
  meta: SegmentMeta;
  words: string[]; // raw word strings
  lastUsed: number;
}

export interface SegmentProvider {
  loadSegment(meta: SegmentMeta): Promise<string>; // returns raw text of segment
}

export function createWordSource(segments: SegmentMeta[], provider: SegmentProvider, wpmRef: () => number, maxCached = 3): WordSource {
  const cache = new Map<string, CachedSegment>();
  const totalWords = segments.length ? segments[segments.length - 1].startWord + segments[segments.length - 1].wordCount : 0;

  function touch(id: string) {
    const c = cache.get(id);
    if (c) c.lastUsed = performance.now();
  }
  function evictIfNeeded() {
    if (cache.size <= maxCached) return;
    // evict least recently used beyond maxCached
    const entries = Array.from(cache.entries()).sort((a,b) => a[1].lastUsed - b[1].lastUsed);
    while (entries.length > maxCached) {
      const [id] = entries.shift()!;
      cache.delete(id);
    }
  }

  function segmentForIndex(i: number): SegmentMeta | null {
    if (i < 0 || i >= totalWords) return null;
    // binary search segments
    let lo = 0, hi = segments.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const seg = segments[mid];
      if (i < seg.startWord) hi = mid - 1;
      else if (i >= seg.startWord + seg.wordCount) lo = mid + 1;
      else return seg;
    }
    return null;
  }

  async function ensure(i: number): Promise<void> {
    const seg = segmentForIndex(i);
    if (!seg) return;
    if (!cache.has(seg.id)) {
      const raw = await provider.loadSegment(seg);
      const words = raw.split(/\s+/).filter(Boolean);
      cache.set(seg.id, { meta: seg, words, lastUsed: performance.now() });
      evictIfNeeded();
    } else {
      touch(seg.id);
    }
  }

  function get(i: number): Word | null {
    const seg = segmentForIndex(i);
    if (!seg) return null;
    const cached = cache.get(seg.id);
    if (!cached) return null; // caller should call ensure first; playback loop will pause if null
    const offset = i - seg.startWord;
    const raw = cached.words[offset];
    if (!raw) return null;
    return buildWord(raw, wpmRef());
  }

  function total(): number { return totalWords; }

  function prefetch(i: number) {
    const seg = segmentForIndex(i);
    if (!seg) return;
    if (!cache.has(seg.id)) {
      // fire and forget
      provider.loadSegment(seg).then(raw => {
        if (!cache.has(seg.id)) {
          cache.set(seg.id, { meta: seg, words: raw.split(/\s+/).filter(Boolean), lastUsed: performance.now() });
          evictIfNeeded();
        }
      }).catch(()=>{ /* ignore */ });
    }
  }

  return { total, get, ensure, prefetch };
}
