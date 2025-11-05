/**
 * Prosody analysis utilities
 * Provides rule-based prosody detection for natural reading rhythm
 */

import type { Word } from '@/types'

export interface ProsodyRules {
  // Pause multipliers for punctuation
  period: number
  comma: number
  semicolon: number
  colon: number
  questionMark: number
  exclamationMark: number
  dash: number
  ellipsis: number
  
  // Emphasis detection
  allCaps: 'high'
  italic: 'medium'
  bold: 'medium'
}

export const defaultProsodyRules: ProsodyRules = {
  period: 2.5,
  comma: 1.5,
  semicolon: 2.0,
  colon: 1.8,
  questionMark: 2.5,
  exclamationMark: 2.5,
  dash: 1.5,
  ellipsis: 2.0,
  allCaps: 'high',
  italic: 'medium',
  bold: 'medium',
}

/**
 * Detect prosody for a single word based on its context
 */
export function analyzeProsody(
  word: string,
  _nextWord: string | undefined,
  sensitivity: number = 0.7
): Word['prosody'] {
  const prosody: Word['prosody'] = {}

  // Check for trailing punctuation
  const punctuation = word.match(/[.,;:!?—…-]+$/)?.[0]
  
  if (punctuation && sensitivity > 0) {
    const rules = defaultProsodyRules
    let pauseMultiplier = 1.0

    if (punctuation.includes('.')) pauseMultiplier = rules.period
    else if (punctuation.includes('!')) pauseMultiplier = rules.exclamationMark
    else if (punctuation.includes('?')) pauseMultiplier = rules.questionMark
    else if (punctuation.includes(';')) pauseMultiplier = rules.semicolon
    else if (punctuation.includes(':')) pauseMultiplier = rules.colon
    else if (punctuation.includes(',')) pauseMultiplier = rules.comma
    else if (punctuation.includes('…')) pauseMultiplier = rules.ellipsis
    else if (punctuation.includes('—') || punctuation.includes('-')) {
      pauseMultiplier = rules.dash
    }

    // Apply sensitivity scaling
    prosody.pause = 1 + (pauseMultiplier - 1) * sensitivity
  }

  // Check for emphasis
  const cleanWord = word.replace(/[.,;:!?—…-]+$/, '')
  
  // All caps (but not single letter or acronym-like)
  if (cleanWord.length > 2 && cleanWord === cleanWord.toUpperCase()) {
    prosody.emphasis = 'high'
  }
  
  // Detect tone based on punctuation
  if (word.includes('?')) {
    prosody.tone = 'rising'
  } else if (word.includes('!')) {
    prosody.tone = 'neutral' // Could be rising or falling depending on context
  } else if (punctuation?.includes('.')) {
    prosody.tone = 'falling'
  }

  // Longer words get slightly more time
  if (cleanWord.length > 10) {
    prosody.pause = (prosody.pause || 1) * 1.1
  }

  return Object.keys(prosody).length > 0 ? prosody : undefined
}

/**
 * Calculate optimal pivot point for visual fixation (ORP - Optimal Recognition Point)
 * Generally around 30-40% into the word for optimal reading speed
 */
export function calculatePivotIndex(word: string): number {
  const cleanWord = word.replace(/[.,;:!?—…-]+$/, '')
  const length = cleanWord.length

  if (length <= 1) return 0
  if (length <= 3) return 1
  if (length <= 5) return 2
  
  // For longer words, aim for about 30-35% into the word
  return Math.floor(length * 0.33)
}

/**
 * Calculate base delay for a word based on WPM
 */
export function calculateBaseDelay(wpm: number): number {
  return 60000 / wpm // milliseconds per word
}

/**
 * Apply prosody adjustments to base delay
 */
export function calculateWordDelay(
  baseDelay: number,
  prosody?: Word['prosody']
): number {
  let delay = baseDelay

  // Apply pause multiplier (main prosody timing adjustment)
  if (prosody?.pause) {
    delay *= prosody.pause
  }

  // Add fixed pause after word (from API's pauseAfter field)
  if (prosody?.pauseAfter) {
    delay += prosody.pauseAfter
  }

  // Emphasis can also affect timing slightly
  if (prosody?.emphasis === 'high') {
    delay *= 1.2
  } else if (prosody?.emphasis === 'medium') {
    delay *= 1.1
  } else if (prosody?.emphasis === 'low') {
    delay *= 1.05
  }

  const finalDelay = Math.round(delay)
  
  // Debug logging for first few words
  if (prosody && Math.random() < 0.05) { // Log 5% of words to avoid spam
    console.log('⏱️  Word timing:', {
      base: `${baseDelay}ms`,
      pause: prosody.pause || 1,
      pauseAfter: prosody.pauseAfter || 0,
      emphasis: prosody.emphasis || 'none',
      final: `${finalDelay}ms`
    })
  }
  
  return finalDelay
}
