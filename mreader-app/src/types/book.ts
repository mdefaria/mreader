// Types for segmented book loading & on-demand word access.
import type { Word } from './index';

export type SegmentMeta = {
  id: string;
  label?: string; // chapter title or page label
  startWord: number; // global start word index
  wordCount: number; // number of words in this segment
};

export type BookMeta = {
  id: string;
  title: string;
  author?: string;
  format: 'epub' | 'pdf';
  segments: SegmentMeta[];
  totalWords: number;
  createdAt: number;
  updatedAt: number;
  version: number; // schema version
};

export interface WordSource {
  total(): number;
  get(i: number): Word | null; // null if out of range
  ensure(i: number): Promise<void>; // ensure segment for i is loaded
  prefetch?(i: number): void; // optional predictive fetch
  dispose?(): void;
}

export type LoaderProgress = {
  loadedSegments: number;
  totalSegments?: number; // may be undefined for streaming PDF until first pass
  phase: 'initial' | 'parsing' | 'ready' | 'error';
  message?: string;
};

export interface LoadResult {
  bookMeta: BookMeta;
  wordSource: WordSource;
  initialIndex: number;
  progress$: (cb: (p: LoaderProgress) => void) => () => void; // subscribe/unsubscribe
}

export type LoaderErrorCode = 'FORMAT_UNSUPPORTED' | 'PARSE_FAILED' | 'ENCRYPTED' | 'EMPTY';

export class LoaderError extends Error {
  code: LoaderErrorCode;
  constructor(code: LoaderErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
