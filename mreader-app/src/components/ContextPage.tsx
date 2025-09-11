import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { Word } from '../types';

interface ContextPageProps {
  words: Word[];
  index: number;
  pageSize?: number; // optional override; otherwise auto-calculated
  onSelectIndex?: (i: number) => void;
}

// Displays a window ("page") of words with the current word highlighted.
// Simple numeric paging: floor(index / pageSize) chooses the segment.
export const ContextPage: React.FC<ContextPageProps> = ({ words, index, pageSize, onSelectIndex }) => {
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

  const { pageWords } = useMemo(() => {
    if (!words.length) return { pageWords: [] as { w: Word; i: number }[] };
    const p = Math.floor(index / effectivePageSize);
    const startIdx = p * effectivePageSize;
    const slice = words.slice(startIdx, Math.min(words.length, startIdx + effectivePageSize));
    return { pageWords: slice.map((w, offset) => ({ w, i: startIdx + offset })) };
  }, [words, index, effectivePageSize]);

  return (
    <div className="context-page" ref={containerRef} aria-label="Context page view">
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
