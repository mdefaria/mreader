<template>
  <div ref="readerContainer" class="reader-view">
    <!-- Reader Header -->
    <header class="reader-header">
      <button class="back-button" @click="$emit('back-to-library')" aria-label="Back to library">
        ← Library
      </button>
      <h2 class="book-title">{{ currentBook?.title }}</h2>
      <button class="settings-button" @click="showSettings = true" aria-label="Settings">
        ⚙️
      </button>
    </header>

    <!-- Main Reading Area -->
    <div class="reader-content">
      <!-- RSVP Display (when playing) -->
      <RsvpDisplay
        v-if="isPlaying"
        :current-word="currentWord"
        :progress="progress"
        :is-complete="isComplete"
      />

      <!-- Context Page (when paused) -->
      <ContextPage
        v-else
        :words="words"
        :current-index="currentIndex"
        :words-per-page="100"
        @jump-to-word="handleJumpToWord"
        @previous-page="handlePreviousPage"
        @next-page="handleNextPage"
      />
    </div>

    <!-- Reader Controls -->
    <footer class="reader-footer">
      <div class="controls">
        <button class="control-button" @click="readerStore.skipBackward(10)" aria-label="Skip backward 10s">
          ⏪
        </button>
        <button class="control-button" @click="readerStore.goToPrevious" aria-label="Previous word">
          ◀
        </button>
        <button class="play-button" @click="readerStore.togglePlayPause" aria-label="Play/Pause">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="control-button" @click="readerStore.goToNext" aria-label="Next word">
          ▶
        </button>
        <button class="control-button" @click="readerStore.skipForward(10)" aria-label="Skip forward 10s">
          ⏩
        </button>
      </div>

      <div class="progress-info">
        <span>{{ currentIndex + 1 }} / {{ words.length }}</span>
        <span v-if="timeRemaining > 0">~{{ timeRemaining }} min left</span>
      </div>
    </footer>

    <!-- Settings Modal -->
    <SettingsModal :is-open="showSettings" @close="handleCloseSettings" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useReaderStore } from '@/stores/reader'
import { useSettingsStore } from '@/stores/settings'
import { useLibraryStore } from '@/stores/library'
import { useGestures } from '@/composables/useGestures'
import RsvpDisplay from '@/components/RsvpDisplay.vue'
import ContextPage from '@/components/ContextPage.vue'
import SettingsModal from '@/components/SettingsModal.vue'

interface Props {
  bookId: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'back-to-library': []
}>()

const readerStore = useReaderStore()
const settingsStore = useSettingsStore()
const libraryStore = useLibraryStore()

const showSettings = ref(false)
const readerContainer = ref<HTMLElement | null>(null)

// Computed properties
const currentBook = computed(() => readerStore.currentBook)
const currentWord = computed(() => readerStore.currentWord)
const words = computed(() => readerStore.words)
const currentIndex = computed(() => readerStore.currentIndex)
const isPlaying = computed(() => readerStore.isPlaying)
const progress = computed(() => readerStore.progress)
const isComplete = computed(() => readerStore.isComplete)
const timeRemaining = computed(() => readerStore.timeRemaining)

// Gesture handlers
useGestures(readerContainer, {
  onTapTop: () => {
    showSettings.value = true
    readerStore.pause()
  },
  onTapBottom: () => {
    readerStore.togglePlayPause()
  },
})

// Navigation handlers
function handleJumpToWord(index: number) {
  readerStore.goToWord(index)
}

function handlePreviousPage() {
  const wordsPerPage = 100
  const newIndex = Math.max(0, currentIndex.value - wordsPerPage)
  readerStore.goToWord(newIndex)
}

function handleNextPage() {
  const wordsPerPage = 100
  const newIndex = Math.min(words.value.length - 1, currentIndex.value + wordsPerPage)
  readerStore.goToWord(newIndex)
}

function handleCloseSettings() {
  showSettings.value = false
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  switch (event.code) {
    case 'Space':
      event.preventDefault()
      readerStore.togglePlayPause()
      break
    case 'ArrowLeft':
      event.preventDefault()
      readerStore.goToPrevious()
      break
    case 'ArrowRight':
      event.preventDefault()
      readerStore.goToNext()
      break
    case 'ArrowUp':
      event.preventDefault()
      settingsStore.setWpm(settingsStore.wpm + 10)
      break
    case 'ArrowDown':
      event.preventDefault()
      settingsStore.setWpm(settingsStore.wpm - 10)
      break
    case 'Home':
      event.preventDefault()
      readerStore.goToWord(0)
      break
    case 'Escape':
      if (showSettings.value) {
        showSettings.value = false
      } else {
        readerStore.pause()
      }
      break
  }
}

// Lifecycle
onMounted(async () => {
  const book = await libraryStore.books.find(b => b.id === props.bookId)
  if (book) {
    await readerStore.loadBook(book)
  }
  
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  readerStore.pause()
  readerStore.savePosition()
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.reader-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  overflow: hidden;
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  background: var(--bg-primary);
  z-index: 10;
}

.back-button,
.settings-button {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem;
  color: var(--text-primary);
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 600;
}

.back-button:hover,
.settings-button:hover {
  background: var(--bg-secondary);
}

.book-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  text-align: center;
  padding: 0 1rem;
}

.reader-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.reader-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-color, #e0e0e0);
  background: var(--bg-primary);
  z-index: 10;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.control-button,
.play-button {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.control-button {
  width: 48px;
  height: 48px;
}

.play-button {
  width: 64px;
  height: 64px;
  font-size: 1.5rem;
  background: var(--accent-color, #ff6b6b);
  color: white;
  border: none;
}

.control-button:hover {
  background: var(--bg-hover);
  transform: scale(1.05);
}

.play-button:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.control-button:active,
.play-button:active {
  transform: scale(0.95);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

/* Responsive */
@media (max-width: 768px) {
  .reader-header {
    padding: 1rem;
  }

  .book-title {
    font-size: 1rem;
  }

  .reader-footer {
    padding: 1rem;
  }

  .controls {
    gap: 0.75rem;
  }

  .control-button {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .play-button {
    width: 56px;
    height: 56px;
    font-size: 1.25rem;
  }
}

/* Print styles */
@media print {
  .reader-header,
  .reader-footer {
    display: none;
  }
}
</style>
