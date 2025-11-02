/**
 * Core type definitions for mreader
 */

export interface Word {
  text: string
  pivotIndex: number
  baseDelayMs: number
  prosody?: {
    pause?: number // multiplier for delay
    emphasis?: 'low' | 'medium' | 'high'
    tone?: 'rising' | 'falling' | 'neutral'
  }
}

export type BookFormat = 'txt' | 'epub'

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

export interface ProsodyData {
  analyzed: boolean
  lastAnalyzed?: Date
  method: 'rule-based' | 'llm'
  version: string
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
