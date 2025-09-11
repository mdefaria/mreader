import React from 'react';
import type { VisualMode } from '../types';

interface SettingsModalProps {
  wpm: number;
  setWpm: (wpm: number) => void;
  visualMode: VisualMode;
  setVisualMode: (mode: VisualMode) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ wpm, setWpm, visualMode, setVisualMode, onClose }) => {
  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <h2>Settings</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontWeight: 500, marginRight: 8 }}>Visual Mode:</label>
          <div className="visual-mode-switch">
            <label>
              <input type="radio" name="visual-mode" value="light" checked={visualMode === 'light'} onChange={() => setVisualMode('light')} />
              Light
            </label>
            <label>
              <input type="radio" name="visual-mode" value="night" checked={visualMode === 'night'} onChange={() => setVisualMode('night')} />
              Night
            </label>
            <label>
              <input type="radio" name="visual-mode" value="book" checked={visualMode === 'book'} onChange={() => setVisualMode('book')} />
              Book
            </label>
          </div>
        </div>
        <label htmlFor="wpm-slider">Words Per Minute (WPM):</label>
        <input
          id="wpm-slider"
          type="range"
          min={100}
          max={1000}
          step={10}
          value={wpm}
          onChange={e => setWpm(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <input
          type="number"
          min={100}
          max={1000}
          step={10}
          value={wpm}
          onChange={e => setWpm(Number(e.target.value))}
          style={{ width: 80, marginTop: 8 }}
        />
        <button onClick={onClose} style={{ marginTop: 24 }}>Close</button>
      </div>
    </div>
  );
};
