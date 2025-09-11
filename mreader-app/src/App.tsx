import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import { tokenizeWords } from './utils/tokenize';
import { RsvpPlayer } from './components/RsvpPlayer';
import { ContextPage } from './components/ContextPage';
import { SettingsModal } from './components/SettingsModal';
import type { Word, VisualMode } from './types';
import { loadState, saveState, addBook, listBooks, getBook, updateBookIndex } from './services/persistence';

// Fill this with your own text
// Remove default book text; will be loaded from file
const DEFAULT_WPM = 300;


function App() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  // Hydrate persisted state asynchronously (IndexedDB)
  type PersistSnapshot = { loaded: boolean; wpm?: number; visualMode?: VisualMode; bookText?: string | null; index?: number };
  const persisted = useRef<PersistSnapshot>({ loaded: false });
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [visualMode, setVisualMode] = useState<VisualMode>('light');
  const [bookText, setBookText] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<string | undefined>(undefined);
  const [library, setLibrary] = useState<Array<{ id: string; title: string; size: number; updatedAt: number }>>([]);
  // RSVP state
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafId = useRef<number | null>(null);
  const nextTimeRef = useRef<number>(0);
  const [showSettings, setShowSettings] = useState(false);

  // Only tokenize if bookText is loaded
  const words: Word[] = useMemo(() => (bookText ? tokenizeWords(bookText, wpm) : []), [bookText, wpm]);
  // Clamp index if book changed or WPM retokenized length shrank
  useEffect(() => {
    if (index >= words.length && words.length > 0) {
      setIndex(0);
    }
  }, [words.length, index]);
  const currentWord = words[index] || null;
  // Load persisted state once on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await loadState();
      if (cancelled) return;
      persisted.current = { loaded: true, ...s } as PersistSnapshot;
      if (typeof s.wpm === 'number') setWpm(s.wpm);
      if (s.visualMode) setVisualMode(s.visualMode);
      // v2 keeps activeBookId only
      if (typeof s.activeBookId === 'string') {
        const id = s.activeBookId;
        setActiveBookId(id);
        const book = await getBook(id);
        if (book) {
          setBookText(book.text);
          setIndex(Math.max(0, book.index || 0));
        }
      }
      // load library list
      const books = await listBooks();
      setLibrary(books.map(b => ({ id: b.id, title: b.title, size: b.size, updatedAt: b.updatedAt })));
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
        if (next >= words.length) {
          setIsPlaying(false);
          return i;
        }
        nextTimeRef.current = now + words[next].baseDelayMs;
        return next;
      });
    }
    rafId.current = requestAnimationFrame(loop);
  }, [isPlaying, words]);

  useEffect(() => {
    if (isPlaying) {
      nextTimeRef.current = performance.now() + (words[index]?.baseDelayMs || 0);
      rafId.current = requestAnimationFrame(loop);
    } else if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isPlaying, index, words, loop]);

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
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const title = file.name || 'Untitled';
      (async () => {
        const book = await addBook(title, text);
        setActiveBookId(book.id);
        setBookText(book.text);
        setIndex(0);
        saveState({ activeBookId: book.id });
        const books = await listBooks();
        setLibrary(books.map(b => ({ id: b.id, title: b.title, size: b.size, updatedAt: b.updatedAt })));
      })();
    };
    reader.readAsText(file);
  };

  // Persist settings when they change
  useEffect(() => {
    saveState({ wpm, visualMode });
  }, [wpm, visualMode]);

  // Persist activeBookId when it changes
  useEffect(() => {
    if (activeBookId) saveState({ activeBookId });
  }, [activeBookId]);

  // Persist index only when not actively playing to avoid excessive writes
  const lastSavedIndexRef = useRef(index);
  useEffect(() => {
    if (isPlaying) return; // skip while playing
    if (index !== lastSavedIndexRef.current) {
      if (activeBookId) {
        updateBookIndex(activeBookId, index);
      }
      lastSavedIndexRef.current = index;
    }
  }, [index, isPlaying, activeBookId]);

  // Save index on tab hide (best-effort)
  useEffect(() => {
    const handler = () => {
      if (activeBookId) updateBookIndex(activeBookId, index);
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [index, activeBookId]);

  // Main page (no book loaded)
  if (!bookText) {
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
          accept=".txt"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <button className="load-book-btn" style={{ marginTop: 40 }} onClick={openFileDialog}>
          Load Book
        </button>
        {library.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 8 }}>Resume Reading</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {library.map(b => (
                <button
                  key={b.id}
                  onClick={async () => {
                    setActiveBookId(b.id);
                    saveState({ activeBookId: b.id });
                    const book = await getBook(b.id);
                    if (book) {
                      setBookText(book.text);
                      setIndex(Math.max(0, Math.min(book.index || 0, tokenizeWords(book.text, wpm).length - 1)));
                    }
                  }}
                  style={{
                    padding: '12px 10px',
                    textAlign: 'left',
                    background: 'var(--card-bg, #fff)',
                    borderRadius: 8,
                    border: '1px solid var(--card-border, #ddd)',
                    cursor: 'pointer',
                    color: 'inherit',
                    boxShadow: '0 1px 4px 0 #0002',
                    transition: 'background 0.2s',
                  }}
                  title={b.title}
                >
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'inherit' }}>{b.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.7, color: 'inherit' }}>{Math.round(b.size / 1024)} KB • {new Date(b.updatedAt).toLocaleDateString()}</div>
                </button>
              ))}
            </div>
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
        <RsvpPlayer word={currentWord} />
      ) : (
        <div className="context-wrapper">
          <ContextPage words={words} index={index} onSelectIndex={(i) => setIndex(i)} />
        </div>
      )}
      {/* Library / back button */}
      <div style={{ position: 'fixed', left: 12, top: 12, zIndex: 30 }}>
        <button
          onClick={() => {
            setIsPlaying(false);
            if (activeBookId) updateBookIndex(activeBookId, index);
            // Keep activeBookId so resume grid highlights latest; clear text to show library
            setBookText(null);
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
