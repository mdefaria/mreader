import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import { tokenizeWords } from './utils/tokenize';
import { RsvpPlayer } from './components/RsvpPlayer';
import { SettingsModal } from './components/SettingsModal';
import type { Word } from './types';

// Fill this with your own text
// Remove default book text; will be loaded from file
const DEFAULT_WPM = 300;


type VisualMode = 'light' | 'night' | 'book';
function App() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  const [wpm, setWpm] = useState(DEFAULT_WPM);
  const [visualMode, setVisualMode] = useState<VisualMode>('light');
  const [bookText, setBookText] = useState<string | null>(null);
  // RSVP state
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const rafId = useRef<number | null>(null);
  const nextTimeRef = useRef<number>(0);
  const [showSettings, setShowSettings] = useState(false);

  // Only tokenize if bookText is loaded
  const words: Word[] = bookText ? tokenizeWords(bookText, wpm) : [];
  const currentWord = words[index] || null;

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
      setBookText(event.target?.result as string);
      setIndex(0);
    };
    reader.readAsText(file);
  };

  // Main page (no book loaded)
  if (!bookText) {
    return (
      <div className={`rsvp-app theme-${visualMode}`} style={{ position: 'relative', overflow: 'hidden' }}>
        <h1 className="rsvp-title">RSVP Reader</h1>
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
      </div>
    );
  }

  // RSVP Reader page
  return (
    <div className={`rsvp-app theme-${visualMode}`} style={{ position: 'relative', overflow: 'hidden' }}>
      <h1 className="rsvp-title">RSVP Reader</h1>
      <RsvpPlayer word={currentWord} />
      <div className="rsvp-progress">
        Word {index + 1} / {words.length}
      </div>
      {/* Gesture area: full screen, split logic for top/bottom */}
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
      {/* Play/pause indicator */}
      <div style={{ position: 'fixed', right: 16, bottom: 16, fontSize: 18, color: '#888', zIndex: 20 }}>
        {isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </div>
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
