/**
 * Core type definitions for mreader
 */

export type Emphasis = 'none' | 'low' | 'medium' | 'high'
export type Tone = 'neutral' | 'rising' | 'falling'

export interface ProsodyInfo {
  pause?: number // multiplier for delay (0.5-5.0)
  pauseAfter?: number // additional milliseconds
  emphasis?: Emphasis
  tone?: Tone
  pitch?: number // optional TTS pitch in Hz
  loudness?: number // optional TTS loudness in dB
}

export interface Word {
  text: string
  index?: number // word position in sequence
  start?: number // character position in original text
  end?: number // character end position
  pivotIndex: number
  baseDelay?: number // in milliseconds (from API)
  baseDelayMs: number // in milliseconds (app internal)
  prosody?: ProsodyInfo
}

export type BookFormat = 'txt' | 'epub' | 'prosody'

export interface Book {
  id: string
  title: string
  author?: string
  content: string
  format: BookFormat
  lastPosition: number
  totalWords: number
  prosodyData?: ProsodyData
  addedAt: Date
  updatedAt: Date
}

export interface ProcessingMetadata {
  wordCount: number
  avgWordLength: number
  totalPauses?: number
  emphasisCount?: number
  processingTime?: number // seconds
  model?: string
}

export interface ProsodyData {
  version: string // format version
  method: string // 'rule-based' | 'mit-prosody' | 'openai' | 'anthropic'
  metadata: ProcessingMetadata
  words: Word[]
  analyzed: boolean
  lastAnalyzed?: Date
}

// Prosody book format - JSON file with pre-analyzed prosody
// This wraps the API response with book metadata
export interface ProsodyBookFile {
  title: string
  author?: string
  // The rest is the direct API response (ProsodyResult)
  version: string
  method: string
  metadata: ProcessingMetadata
  words: Word[]
}

export type Theme = 'light' | 'dark' | 'book'

export type FontFamily = 'system' | 'serif' | 'sans-serif' | 'monospace' | 'dyslexic'

export interface UserSettings {
  theme: Theme
  fontFamily: FontFamily
  fontSize: number
  wpm: number
  prosodySensitivity: number
  autoSave: boolean
  showPivotHighlight: boolean
}

export interface ReaderState {
  currentBook: Book | null
  currentIndex: number
  isPlaying: boolean
  wpm: number
  prosodySensitivity: number
}

export interface LibraryState {
  books: Book[]
  selectedBookId: string | null
  searchQuery: string
  sortBy: 'title' | 'author' | 'addedAt' | 'lastRead'
}

export interface GestureEvent {
  type: 'tap' | 'swipe' | 'pinch'
  target: 'top' | 'bottom' | 'left' | 'right'
  data?: any
}
