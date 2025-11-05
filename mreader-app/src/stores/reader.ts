/**
 * Reader store - manages reading state and playback
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Book, Word } from '@/types'
import { tokenize } from '@/utils/tokenize'
import { useLibraryStore } from './library'
import { useSettingsStore } from './settings'

export const useReaderStore = defineStore('reader', () => {
  // State
  const currentBook = ref<Book | null>(null)
  const words = ref<Word[]>([])
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const playbackTimer = ref<number | null>(null)
  const lastPlayTime = ref<number>(0)
  const isScrubbing = ref(false)
  const scrubbingTimer = ref<number | null>(null)

  // Get stores
  const libraryStore = useLibraryStore()
  const settingsStore = useSettingsStore()

  // Computed
  const currentWord = computed(() => {
    if (currentIndex.value < 0 || currentIndex.value >= words.value.length) {
      return null
    }
    return words.value[currentIndex.value] || null
  })

  const progress = computed(() => {
    if (words.value.length === 0) return 0
    return (currentIndex.value / words.value.length) * 100
  })

  const isComplete = computed(() => {
    return currentIndex.value >= words.value.length - 1
  })

  const timeRemaining = computed(() => {
    if (words.value.length === 0 || currentIndex.value >= words.value.length) {
      return 0
    }

    const remainingWords = words.value.slice(currentIndex.value)
    const totalMs = remainingWords.reduce((sum, word) => sum + word.baseDelayMs, 0)
    return Math.ceil(totalMs / 1000 / 60) // minutes
  })

  // Load a book for reading
  async function loadBook(book: Book) {
    // Stop current playback
    stop()

    currentBook.value = book
    
    // Tokenize with current settings and use prosody data if available
    words.value = tokenize(
      book.content,
      settingsStore.wpm,
      settingsStore.prosodySensitivity,
      book.prosodyData
    )

    // Restore last position
    currentIndex.value = book.lastPosition || 0

    // Ensure we're within bounds
    if (currentIndex.value >= words.value.length) {
      currentIndex.value = 0
    }
  }

  // Re-tokenize when settings change
  function retokenize() {
    if (!currentBook.value) return

    const currentPosition = currentIndex.value
    
    words.value = tokenize(
      currentBook.value.content,
      settingsStore.wpm,
      settingsStore.prosodySensitivity,
      currentBook.value.prosodyData
    )

    // Restore position
    currentIndex.value = Math.min(currentPosition, words.value.length - 1)
  }

  // Watch for settings changes
  watch(
    () => [settingsStore.wpm, settingsStore.prosodySensitivity],
    () => {
      retokenize()
    }
  )

  // Playback control
  function play() {
    if (!currentWord.value || isPlaying.value) return
    
    isPlaying.value = true
    lastPlayTime.value = performance.now()
    scheduleNextWord()
  }

  function pause() {
    isPlaying.value = false
    if (playbackTimer.value !== null) {
      cancelAnimationFrame(playbackTimer.value)
      playbackTimer.value = null
    }
    savePosition()
  }

  function stop() {
    pause()
    currentIndex.value = 0
    savePosition()
  }

  function togglePlayPause() {
    if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  // Schedule next word with RAF for accurate timing
  function scheduleNextWord() {
    if (!isPlaying.value) return

    const word = currentWord.value
    if (!word) {
      pause()
      return
    }

    const now = performance.now()
    const elapsed = now - lastPlayTime.value

    if (elapsed >= word.baseDelayMs) {
      // Move to next word
      currentIndex.value++

      // Check if complete
      if (currentIndex.value >= words.value.length) {
        pause()
        currentIndex.value = words.value.length - 1
        return
      }

      lastPlayTime.value = now
    }

    // Schedule next frame
    playbackTimer.value = requestAnimationFrame(scheduleNextWord)
  }

  // Navigation
  function goToWord(index: number) {
    const wasPlaying = isPlaying.value
    pause()

    currentIndex.value = Math.max(0, Math.min(index, words.value.length - 1))
    savePosition()

    if (wasPlaying) {
      play()
    }
  }

  function goToNext() {
    goToWord(currentIndex.value + 1)
  }

  function goToPrevious() {
    goToWord(currentIndex.value - 1)
  }

  function skipForward(seconds: number = 10) {
    const baseDelay = 60000 / settingsStore.wpm
    const wordsToSkip = Math.ceil((seconds * 1000) / baseDelay)
    goToWord(currentIndex.value + wordsToSkip)
  }

  function skipBackward(seconds: number = 10) {
    const baseDelay = 60000 / settingsStore.wpm
    const wordsToSkip = Math.ceil((seconds * 1000) / baseDelay)
    goToWord(currentIndex.value - wordsToSkip)
  }

  function restart() {
    const wasPlaying = isPlaying.value
    pause()
    currentIndex.value = 0
    savePosition()
    if (wasPlaying) {
      play()
    }
  }

  // Save current position to library
  async function savePosition() {
    if (!currentBook.value) return
    await libraryStore.updateBookPosition(currentBook.value.id, currentIndex.value)
  }

  // Auto-save position periodically while playing
  watch(isPlaying, (playing) => {
    if (playing) {
      const saveInterval = setInterval(() => {
        if (isPlaying.value) {
          savePosition()
        } else {
          clearInterval(saveInterval)
        }
      }, 5000) // Save every 5 seconds
    }
  })

  // Scrubbing (fast forward/backward navigation)
  function startScrubbing(direction: 'forward' | 'backward', speedMultiplier: number = 1.5) {
    // Pause normal playback if playing
    if (isPlaying.value) {
      pause()
    }

    isScrubbing.value = true

    // Calculate delay based on current WPM and speed multiplier
    const baseDelay = 60000 / settingsStore.wpm
    const scrubbingDelay = baseDelay / speedMultiplier

    // Use RAF for smooth scrubbing
    let lastScrubbingTime = performance.now()

    const scrubLoop = () => {
      if (!isScrubbing.value) return

      const now = performance.now()
      const elapsed = now - lastScrubbingTime

      if (elapsed >= scrubbingDelay) {
        // Move index
        if (direction === 'forward') {
          currentIndex.value = Math.min(currentIndex.value + 1, words.value.length - 1)
        } else {
          currentIndex.value = Math.max(currentIndex.value - 1, 0)
        }

        lastScrubbingTime = now
      }

      scrubbingTimer.value = requestAnimationFrame(scrubLoop)
    }

    scrubLoop()
  }

  function stopScrubbing() {
    isScrubbing.value = false
    if (scrubbingTimer.value !== null) {
      cancelAnimationFrame(scrubbingTimer.value)
      scrubbingTimer.value = null
    }
    savePosition()
  }

  // Get surrounding words for context display during scrubbing
  function getSurroundingWords(count: number = 2): Word[] {
    const start = Math.max(0, currentIndex.value - count)
    const end = Math.min(words.value.length, currentIndex.value + count + 1)
    return words.value.slice(start, end)
  }

  return {
    // State
    currentBook,
    words,
    currentIndex,
    isPlaying,
    isScrubbing,

    // Computed
    currentWord,
    progress,
    isComplete,
    timeRemaining,

    // Actions
    loadBook,
    retokenize,
    play,
    pause,
    stop,
    togglePlayPause,
    goToWord,
    goToNext,
    goToPrevious,
    skipForward,
    skipBackward,
    restart,
    savePosition,
    startScrubbing,
    stopScrubbing,
    getSurroundingWords,
  }
})
