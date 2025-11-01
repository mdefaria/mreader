/**
 * Text tokenization utilities
 * Converts raw text into processable Word objects with prosody
 */

import type { Word } from '@/types'
import { 
  analyzeProsody, 
  calculatePivotIndex, 
  calculateBaseDelay,
  calculateWordDelay 
} from './prosody'

/**
 * Tokenize text into words with prosody analysis
 */
export function tokenize(
  text: string,
  wpm: number = 250,
  prosodySensitivity: number = 0.7
): Word[] {
  // Split by whitespace but preserve structure
  const rawWords = text
    .split(/\s+/)
    .filter(word => word.length > 0)

  const baseDelay = calculateBaseDelay(wpm)
  const words: Word[] = []

  for (let i = 0; i < rawWords.length; i++) {
    const word = rawWords[i]!
    const nextWord = rawWords[i + 1]

    const prosody = analyzeProsody(word, nextWord, prosodySensitivity)
    const pivotIndex = calculatePivotIndex(word)
    const wordDelay = calculateWordDelay(baseDelay, prosody)

    words.push({
      text: word,
      pivotIndex,
      baseDelayMs: wordDelay,
      prosody,
    })
  }

  return words
}

/**
 * Count total words in text
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length
}

/**
 * Extract title from text (first line or first N chars)
 */
export function extractTitle(text: string, maxLength: number = 50): string {
  const firstLine = text.split('\n')[0]?.trim() || ''
  
  if (firstLine.length === 0) {
    return 'Untitled'
  }
  
  if (firstLine.length <= maxLength) {
    return firstLine
  }
  
  return firstLine.substring(0, maxLength - 3) + '...'
}

/**
 * Detect chapters or sections in text
 */
export function detectChapters(text: string): { title: string; startIndex: number }[] {
  const chapters: { title: string; startIndex: number }[] = []
  const lines = text.split('\n')
  
  let currentIndex = 0
  
  // Simple heuristic: look for lines that might be chapter headings
  // - Short lines (< 60 chars)
  // - Followed by blank line or all caps
  // - Contains "chapter", "part", or roman numerals
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() || ''
    const nextLine = i < lines.length - 1 ? lines[i + 1]?.trim() || '' : ''
    
    // Count words before this line
    const textBefore = lines.slice(0, i).join('\n')
    currentIndex = countWords(textBefore)
    
    // Check if this looks like a chapter heading
    if (
      line.length > 0 &&
      line.length < 60 &&
      (
        /chapter\s+\d+/i.test(line) ||
        /chapter\s+[ivxlcdm]+/i.test(line) ||
        /^part\s+\d+/i.test(line) ||
        (line === line.toUpperCase() && line.split(/\s+/).length <= 5)
      ) &&
      (nextLine === '' || i === 0)
    ) {
      chapters.push({
        title: line,
        startIndex: currentIndex,
      })
    }
  }
  
  return chapters
}

/**
 * Get a page/context of words around a position
 */
export function getContextPage(
  words: Word[],
  currentIndex: number,
  wordsPerPage: number = 100
): { words: Word[]; startIndex: number; endIndex: number } {
  const halfPage = Math.floor(wordsPerPage / 2)
  
  let startIndex = Math.max(0, currentIndex - halfPage)
  let endIndex = Math.min(words.length, startIndex + wordsPerPage)
  
  // Adjust if we're near the end
  if (endIndex - startIndex < wordsPerPage) {
    startIndex = Math.max(0, endIndex - wordsPerPage)
  }
  
  return {
    words: words.slice(startIndex, endIndex),
    startIndex,
    endIndex,
  }
}
