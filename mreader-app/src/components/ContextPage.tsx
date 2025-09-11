import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { Word } from '../types';
import type { WordSource, SegmentMeta } from '../types/book';

interface ContextPageProps {
  wordSource: WordSource | null;
  index: number;
  pageSize?: number; // optional override
  onSelectIndex?: (i: number) => void;
  segment?: SegmentMeta | null;
  label?: string;
}

// Displays a window ("page") of words with the current word highlighted.
// Fetches words on demand from a WordSource rather than holding whole array.
export const ContextPage: React.FC<ContextPageProps> = ({ wordSource, index, pageSize, onSelectIndex, segment, label }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [autoSize, setAutoSize] = useState(200);

  // Auto-calculate a target page size so that one page roughly fills the viewport
  useEffect(() => {
    if (pageSize) return; // explicit override
    const el = containerRef.current;
    if (!el) return;
    let frame = 0;
    const compute = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sampleChar = document.createElement('span');
      sampleChar.textContent = '0';
      sampleChar.style.visibility = 'hidden';
      el.appendChild(sampleChar);
      const charWidth = sampleChar.getBoundingClientRect().width || 8; // fallback
      const style = getComputedStyle(el);
      const fontSize = parseFloat(style.fontSize) || 16;
      const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.6;
      el.removeChild(sampleChar);
  const widthCh = rect.width / (charWidth || 1);
  const avgCharsPerWord = 5.2; // heuristic
  // Aggressively increase words per line and lines to fill more space
  const wordsPerLine = widthCh / avgCharsPerWord * 1.25; // 25% more words per line
  const lines = Math.floor(rect.height / lineHeight) + 3; // add more lines buffer
  const estimate = Math.max(200, Math.min(1600, Math.round(wordsPerLine * lines * 1.15)));
  setAutoSize(estimate);
    };
    compute();
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(compute);
    });
    resizeObserver.observe(el);
    window.addEventListener('orientationchange', compute);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', compute);
      cancelAnimationFrame(frame);
    };
  }, [pageSize]);

  const effectivePageSize = pageSize || autoSize;

  const { pageWords, pageIndex, totalPages } = useMemo(() => {
    if (!wordSource) return { pageWords: [] as { w: Word; i: number }[], pageIndex: 0, totalPages: 0 };
    if (segment) {
      const segStart = segment.startWord;
      const rel = Math.max(0, index - segStart);
      const segWords: { w: Word; i: number }[] = [];
      for (let i = segStart; i < segStart + segment.wordCount; i++) {
        const w = wordSource.get(i);
        if (w) segWords.push({ w, i });
      }
      const wordsPerPage = effectivePageSize;
      const totalPages = Math.max(1, Math.ceil(segWords.length / wordsPerPage));
      const pageIndex = Math.min(totalPages - 1, Math.floor(rel / wordsPerPage));
      const pageStart = pageIndex * wordsPerPage;
      const slice = segWords.slice(pageStart, pageStart + wordsPerPage);
      return { pageWords: slice, pageIndex, totalPages };
    }
    // Fallback legacy whole-book paging
    const total = wordSource.total();
    if (!total) return { pageWords: [] as { w: Word; i: number }[], pageIndex: 0, totalPages: 0 };
    const p = Math.floor(index / effectivePageSize);
    const startIdx = p * effectivePageSize;
    const end = Math.min(total, startIdx + effectivePageSize);
    const rows: { w: Word; i: number }[] = [];
    for (let i = startIdx; i < end; i++) {
      const w = wordSource.get(i);
      if (w) rows.push({ w, i });
    }
    return { pageWords: rows, pageIndex: p, totalPages: Math.ceil(total / effectivePageSize) };
  }, [wordSource, index, effectivePageSize, segment]);

  return (
    <div className="context-page" ref={containerRef} aria-label="Context page view" style={{ position: 'relative' }}>
      {label && (
        <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 8 }} aria-label="Segment label">{label} {segment && (
          <span style={{ fontWeight: 400, fontSize: 12 }}>• Page {pageIndex + 1}/{totalPages}</span>
        )}</div>
      )}
      {pageWords.map(({ w, i }) => {
        const isCurrent = i === index;
        return (
          <span
            key={i}
            className={`context-word${isCurrent ? ' context-word-current' : ''}`}
            onClick={() => onSelectIndex?.(i)}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
