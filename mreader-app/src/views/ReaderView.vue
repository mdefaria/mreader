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
  readerStore.pause()
  readerStore.currentIndex = Math.max(0, Math.min(index, words.value.length - 1))
  readerStore.savePosition()
}

function handlePreviousPage() {
  const wordsPerPage = 100
  // Calculate current page
  const currentPage = Math.floor(currentIndex.value / wordsPerPage)
  // Go to start of previous page
  const newPage = Math.max(0, currentPage - 1)
  const newIndex = newPage * wordsPerPage
  readerStore.pause()
  readerStore.currentIndex = newIndex
  readerStore.savePosition()
}

function handleNextPage() {
  const wordsPerPage = 100
  // Calculate current page
  const currentPage = Math.floor(currentIndex.value / wordsPerPage)
  // Go to start of next page
  const newPage = currentPage + 1
  const newIndex = Math.min(words.value.length - 1, newPage * wordsPerPage)
  readerStore.pause()
  readerStore.currentIndex = newIndex
  readerStore.savePosition()
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

/* Responsive */
@media (max-width: 768px) {
  .reader-header {
    padding: 0.75rem 1rem;
  }

  .book-title {
    font-size: 1rem;
    padding: 0 0.5rem;
  }

  .back-button,
  .settings-button {
    font-size: 1rem;
    padding: 0.375rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .reader-header {
    padding: 0.5rem 0.75rem;
    gap: 0.5rem;
  }

  .book-title {
    font-size: 0.875rem;
    padding: 0 0.25rem;
  }

  .back-button,
  .settings-button {
    font-size: 0.9rem;
    padding: 0.375rem;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-button {
    flex-shrink: 0;
  }

  .settings-button {
    flex-shrink: 0;
  }
}

/* Print styles */
@media print {
  .reader-header {
    display: none;
  }
}
</style>
