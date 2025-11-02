<template>
  <div ref="pageContainer" class="context-page">
    <div ref="textContainer" class="context-text">
      <span
        v-for="(word, index) in visibleWords"
        :key="startIndex + index"
        class="word"
        :class="{
          current: startIndex + index === currentIndex,
          before: startIndex + index < currentIndex,
          after: startIndex + index > currentIndex,
        }"
        @click="$emit('jump-to-word', startIndex + index, true)"
      >
        {{ word.text }}
      </span>
    </div>

    <div class="context-controls">
      <button @click.stop="handlePreviousPage" :disabled="startIndex === 0" class="nav-button">
        ← Previous
      </button>
      <div class="page-info">
        {{ Math.floor(currentIndex / calculatedWordsPerPage) + 1 }} / {{ totalPages }}
      </div>
      <button @click.stop="handleNextPage" :disabled="endIndex >= totalWords" class="nav-button">
        Next →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Word } from '@/types'

interface Props {
  words: Word[]
  currentIndex: number
  wordsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  wordsPerPage: 100,
})

const emit = defineEmits<{
  'jump-to-word': [index: number, shouldPlay: boolean]
  'previous-page': []
  'next-page': []
}>()

const pageContainer = ref<HTMLElement | null>(null)
const textContainer = ref<HTMLElement | null>(null)
const calculatedWordsPerPage = ref(props.wordsPerPage)

// Constants for word calculation
const AVG_CHARS_PER_WORD = 6 // Average word length including space
const CHAR_WIDTH_RATIO = 0.6 // Estimated ratio of character width to font size
const MIN_WORDS_PER_PAGE = 150 // Minimum words to show per page

// Calculate optimal words per page based on available height
const calculateWordsPerPage = () => {
  if (!textContainer.value || !pageContainer.value) {
    // Use fallback if DOM is not ready
    calculatedWordsPerPage.value = props.wordsPerPage
    return
  }

  const containerHeight = textContainer.value.clientHeight
  const lineHeight = parseFloat(getComputedStyle(textContainer.value).lineHeight)
  const fontSize = parseFloat(getComputedStyle(textContainer.value).fontSize)
  
  const containerWidth = textContainer.value.clientWidth
  const charsPerLine = Math.floor(containerWidth / (fontSize * CHAR_WIDTH_RATIO))
  const wordsPerLine = Math.floor(charsPerLine / AVG_CHARS_PER_WORD)
  
  // Calculate how many lines fit in the container
  const linesPerPage = Math.floor(containerHeight / lineHeight)
  
  // Calculate total words that fit in the page (with minimum threshold)
  const estimatedWords = Math.max(MIN_WORDS_PER_PAGE, wordsPerLine * linesPerPage)
  calculatedWordsPerPage.value = estimatedWords
}

// Recalculate on window resize
const handleResize = () => {
  calculateWordsPerPage()
}

onMounted(() => {
  calculateWordsPerPage()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const totalWords = computed(() => props.words.length)

const totalPages = computed(() => 
  Math.ceil(totalWords.value / calculatedWordsPerPage.value)
)

const startIndex = computed(() => {
  const page = Math.floor(props.currentIndex / calculatedWordsPerPage.value)
  return page * calculatedWordsPerPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + calculatedWordsPerPage.value, totalWords.value)
})

const visibleWords = computed(() => {
  return props.words.slice(startIndex.value, endIndex.value)
})

// Handle page navigation
function handlePreviousPage() {
  const currentPage = Math.floor(props.currentIndex / calculatedWordsPerPage.value)
  const newPage = Math.max(0, currentPage - 1)
  const newIndex = newPage * calculatedWordsPerPage.value
  emit('jump-to-word', newIndex, false)
}

function handleNextPage() {
  const currentPage = Math.floor(props.currentIndex / calculatedWordsPerPage.value)
  const newPage = currentPage + 1
  const newIndex = Math.min(totalWords.value - 1, newPage * calculatedWordsPerPage.value)
  emit('jump-to-word', newIndex, false)
}
</script>

<style scoped>
.context-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 2rem;
  overflow: hidden;
}

.context-text {
  flex: 1;
  overflow-y: auto;
  line-height: 1.8;
  font-size: var(--font-size, 16px);
  font-family: var(--font-family);
  color: var(--text-primary);
  padding-bottom: 2rem;
  text-align: justify;
  text-justify: inter-word;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.word {
  display: inline;
  cursor: pointer;
  padding: 2px 1px;
  transition: all 0.2s ease;
  border-radius: 2px;
}

.word:hover {
  background: var(--hover-bg, rgba(0, 0, 0, 0.05));
}

.word.current {
  background: var(--accent-color, #ff6b6b);
  color: white;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 3px;
}

.word.before {
  opacity: 0.6;
}

.word.after {
  opacity: 0.8;
}

.word::after {
  content: ' ';
}

.context-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid var(--border-color, #e0e0e0);
}

.nav-button {
  padding: 0.5rem 1rem;
  background: var(--bg-secondary, #f5f5f5);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.nav-button:hover:not(:disabled) {
  background: var(--accent-color, #ff6b6b);
  color: white;
  border-color: var(--accent-color, #ff6b6b);
}

.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

/* Responsive */
@media (max-width: 768px) {
  .context-page {
    padding: 1rem;
  }

  .context-text {
    font-size: 0.95rem;
    line-height: 1.7;
    padding-bottom: 1rem;
  }

  .nav-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .context-page {
    padding: 0.75rem;
  }

  .context-text {
    font-size: 0.875rem;
    line-height: 1.65;
    padding-bottom: 1.5rem;
  }

  .context-controls {
    gap: 0.5rem;
    padding: 0.75rem 0;
  }

  .nav-button {
    padding: 0.375rem 0.625rem;
    font-size: 0.8125rem;
  }

  .page-info {
    font-size: 0.8125rem;
  }
}

/* Large screens */
@media (min-width: 1200px) {
  .context-page {
    padding: 3rem 4rem;
  }
  
  .context-text {
    line-height: 2;
  }
}
</style>
