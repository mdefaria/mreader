import React from 'react';
import type { Word } from '../types';

interface RsvpPlayerProps {
  word: Word;
}

export const RsvpPlayer: React.FC<RsvpPlayerProps> = ({ word }) => {
  if (!word) return <div className="rsvp-word">...</div>;
  return (
    <div className="rsvp-word">{word.text}</div>
  );
};
