import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import { RsvpPlayer } from './components/RsvpPlayer';
import { ContextPage } from './components/ContextPage';
import { SettingsModal } from './components/SettingsModal';
import type { VisualMode, Word } from './types';
import { loadState, saveState, clearState } from './services/persistence';
import type { WordSource, LoadResult, LoaderProgress, SegmentMeta } from './types/book';
import { loadEpub } from './services/loaders/epubLoader';
import { loadPdf } from './services/loaders/pdfLoader';

// Fill this with your own text
// Remove default book text; will be loaded from file
const DEFAULT_WPM = 300;


function App() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  // Hydrate persisted state asynchronously (IndexedDB)
  type PersistSnapshot = { loaded: boolean; wpm?: number; visualMode?: VisualMode; activeBookId?: string };
  const persisted = useRef<PersistSnapshot>({ loaded: false });
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [visualMode, setVisualMode] = useState<VisualMode>('light');
  const [wordSource, setWordSource] = useState<WordSource | null>(null);
  const [totalWords, setTotalWords] = useState(0);
  const [loadProgress, setLoadProgress] = useState<LoaderProgress | null>(null);
  const loadUnsubRef = useRef<() => void | null>(null);
  const [segments, setSegments] = useState<SegmentMeta[]>([]);
  const [segmentIndex, setSegmentIndex] = useState(0);
  // RSVP state
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafId = useRef<number | null>(null);
  const nextTimeRef = useRef<number>(0);
  const [showSettings, setShowSettings] = useState(false);
  const currentWord: Word | null = wordSource ? wordSource.get(index) : null;
  const activeSegment: SegmentMeta | null = segments[segmentIndex] || null;
  // Load persisted state once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await loadState();
      if (cancelled) return;
      persisted.current = { loaded: true, ...s } as PersistSnapshot;
  if (typeof s.wpm === 'number') setWpm(s.wpm);
  if (s.visualMode) setVisualMode(s.visualMode);
  // Phase 1: clear any legacy state (txt model)
  await clearState();
    })();
    return () => { cancelled = true; };
  }, []);

  // Play/pause loop
  const loop = useCallback(() => {
    if (!isPlaying) return;
    const now = performance.now();
    if (now >= nextTimeRef.current) {
      setIndex(i => {
        const next = i + 1;
        if (next >= totalWords) {
          setIsPlaying(false);
          return i;
        }
        if (wordSource) {
          const w = wordSource.get(next);
          if (!w) {
            // load segment then resume
            wordSource.ensure(next).then(() => {
              if (isPlaying) {
                const after = wordSource.get(next);
                if (after) nextTimeRef.current = performance.now() + (60000 / wpm);
              }
            });
            setIsPlaying(false);
            return i;
          } else {
            nextTimeRef.current = now + (60000 / wpm);
          }
        }
        if (activeSegment && next >= activeSegment.startWord + activeSegment.wordCount) {
          // move to next segment if available
          setSegmentIndex(s => Math.min(s + 1, segments.length - 1));
        }
        return next;
      });
    }
    rafId.current = requestAnimationFrame(loop);
  }, [isPlaying, totalWords, wordSource, activeSegment, segments.length, wpm]);

  useEffect(() => {
    if (isPlaying) {
      nextTimeRef.current = performance.now() + (60000 / wpm);
      rafId.current = requestAnimationFrame(loop);
    } else if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isPlaying, index, wordSource, loop, wpm]);

  // Adjust schedule immediately when wpm changes mid-playback
  useEffect(() => {
    if (isPlaying) {
      // Recompute next fire time relative to now to reflect new speed
      nextTimeRef.current = performance.now() + (60000 / wpm);
    }
  }, [wpm, isPlaying]);

  // Gesture area handler (only active in reader)
  const handleGesture = (e: React.MouseEvent | React.TouchEvent) => {
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    if (y > rect.top + rect.height / 2) {
      setIsPlaying(p => !p);
    } else {
      setIsPlaying(false);
      setShowSettings(true);
    }
  };

  // File input handler
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsPlaying(false);
    setIndex(0);
    if (loadUnsubRef.current) loadUnsubRef.current();
    setLoadProgress({ phase: 'initial', loadedSegments: 0, message: 'Preparing...' });
    const lower = file.name.toLowerCase();
    const ext = lower.endsWith('.epub') ? 'epub' : lower.endsWith('.pdf') ? 'pdf' : '';
    const loaderPromise: Promise<LoadResult> = ext === 'epub' ? loadEpub(file) : ext === 'pdf' ? loadPdf(file) : Promise.reject(new Error('Unsupported file type'));
    loaderPromise.then(result => {
      setWordSource(result.wordSource);
      setTotalWords(result.bookMeta.totalWords);
      setIndex(result.initialIndex || 0);
      loadUnsubRef.current = result.progress$((p) => setLoadProgress(p));
      setLoadProgress({ phase: 'ready', loadedSegments: result.bookMeta.segments.length, totalSegments: result.bookMeta.segments.length, message: 'Ready' });
      setSegments(result.bookMeta.segments);
      setSegmentIndex(0);
    }).catch(err => {
      setLoadProgress({ phase: 'error', loadedSegments: 0, message: err?.message || 'Failed to load book' });
      setWordSource(null);
      setTotalWords(0);
      setSegments([]);
      setSegmentIndex(0);
    });
  };

  // Persist settings when they change
  useEffect(() => {
    saveState({ wpm, visualMode });
  }, [wpm, visualMode]);

  // (Phase 2) Persist segmented model: skipped in initial implementation.

  // Main page (no book loaded)
  if (!wordSource) {
    return (
      <div className={`rsvp-app theme-${visualMode}`} style={{ position: 'relative', overflow: 'hidden' }}>
        <h1 className="rsvp-title">MReader</h1>
        {/* Settings button */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 20 }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '6px 12px',
              fontSize: 15,
              borderRadius: 6,
              background: '#00000033',
              color: '#fff',
              border: '1px solid #ffffff33',
              cursor: 'pointer',
            }}
            aria-label="Open settings"
          >
            ⚙️ Settings
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".epub,.pdf"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <button className="load-book-btn" style={{ marginTop: 40 }} onClick={openFileDialog}>
          Load EPUB / PDF
        </button>
        {loadProgress && loadProgress.phase !== 'ready' && loadProgress.phase !== 'error' && (
          <div style={{ marginTop: 24, fontSize: 14, opacity: 0.8 }}>
            {loadProgress.message || 'Loading...'}
          </div>
        )}
        {loadProgress && loadProgress.phase === 'error' && (
          <div style={{ marginTop: 24, fontSize: 14, color: 'tomato' }}>
            {loadProgress.message}
          </div>
        )}
        {/* Settings modal (reused) */}
        {showSettings && (
          <SettingsModal
            wpm={wpm}
            setWpm={setWpm}
            visualMode={visualMode}
            setVisualMode={setVisualMode}
            onClose={() => setShowSettings(false)}
          />
        )}
      </div>
    );
  }

  // RSVP Reader page (hybrid: RSVP while playing; context page while paused)
  return (
    <div className={`rsvp-app theme-${visualMode} ${!isPlaying ? 'is-paused' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {isPlaying ? (
        <RsvpPlayer word={currentWord as Word} />
      ) : (
        <div className="context-wrapper">
          <ContextPage wordSource={wordSource} index={index} onSelectIndex={(i) => setIndex(i)} />
        </div>
      )}
      {/* Library / back button */}
      <div style={{ position: 'fixed', left: 12, top: 12, zIndex: 30 }}>
        <button
          onClick={() => {
            setIsPlaying(false);
            setWordSource(null);
            setTotalWords(0);
            if (loadUnsubRef.current) loadUnsubRef.current();
            setLoadProgress(null);
            setSegments([]);
            setSegmentIndex(0);
          }}
          style={{
            padding: '6px 10px',
            fontSize: 14,
            borderRadius: 6,
            background: '#00000055',
            color: '#fff',
            border: '1px solid #ffffff33',
            cursor: 'pointer'
          }}
          aria-label="Return to library"
        >
          Library
        </button>
      </div>
      {!isPlaying && activeSegment && (
        <>
          <button
            aria-label="Previous segment"
            disabled={segmentIndex === 0}
            onClick={() => {
              if (segmentIndex === 0) return;
              const prevSeg = segments[segmentIndex - 1];
              setSegmentIndex(segmentIndex - 1);
              setIndex(prevSeg.startWord);
            }}
            style={{ position:'fixed', left: 8, top: '50%', transform:'translateY(-50%)', padding:'10px 12px', borderRadius:'50%', opacity: segmentIndex===0?0.3:0.9, background:'rgba(0,0,0,0.4)', color:'#fff', border:'1px solid #ffffff33', cursor: segmentIndex===0?'default':'pointer', zIndex:40 }}
          >◀</button>
          <button
            aria-label="Next segment"
            disabled={segmentIndex >= segments.length - 1}
            onClick={() => {
              if (segmentIndex >= segments.length - 1) return;
              const nextSeg = segments[segmentIndex + 1];
              setSegmentIndex(segmentIndex + 1);
              setIndex(nextSeg.startWord);
              wordSource?.prefetch?.(nextSeg.startWord + 1);
            }}
            style={{ position:'fixed', right: 8, top: '50%', transform:'translateY(-50%)', padding:'10px 12px', borderRadius:'50%', opacity: segmentIndex>=segments.length-1?0.3:0.9, background:'rgba(0,0,0,0.4)', color:'#fff', border:'1px solid #ffffff33', cursor: segmentIndex>=segments.length-1?'default':'pointer', zIndex:40 }}
          >▶</button>
        </>
      )}
      {isPlaying && (
        <div
          className="rsvp-gesture-area"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 10,
            cursor: 'pointer',
            background: 'transparent',
          }}
          onClick={handleGesture}
          onTouchStart={handleGesture}
          aria-label="Tap top for settings, bottom for play/pause"
        />
      )}
      {/* Play/pause indicator (clickable when paused) */}
      <button
        onClick={() => setIsPlaying(p => !p)}
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          fontSize: 16,
          padding: '8px 14px',
          borderRadius: 20,
          background: 'rgba(0,0,0,0.35)',
          color: '#fff',
          border: '1px solid #ffffff33',
          cursor: 'pointer',
          zIndex: 25
        }}
        aria-label={isPlaying ? 'Pause playback' : 'Start RSVP playback'}
      >
        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>
      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          wpm={wpm}
          setWpm={setWpm}
          visualMode={visualMode}
          setVisualMode={setVisualMode}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
