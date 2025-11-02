<template>
  <div class="context-page">
    <div class="context-text">
      <span
        v-for="(word, index) in visibleWords"
        :key="startIndex + index"
        class="word"
        :class="{
          current: startIndex + index === currentIndex,
          before: startIndex + index < currentIndex,
          after: startIndex + index > currentIndex,
        }"
        @click="$emit('jump-to-word', startIndex + index)"
      >
        {{ word.text }}
      </span>
    </div>

    <div class="context-controls">
      <button @click="$emit('previous-page')" :disabled="startIndex === 0" class="nav-button">
        ← Previous
      </button>
      <div class="page-info">
        {{ Math.floor(currentIndex / wordsPerPage) + 1 }} / {{ totalPages }}
      </div>
      <button @click="$emit('next-page')" :disabled="endIndex >= totalWords" class="nav-button">
        Next →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Word } from '@/types'

interface Props {
  words: Word[]
  currentIndex: number
  wordsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  wordsPerPage: 100,
})

defineEmits<{
  'jump-to-word': [index: number]
  'previous-page': []
  'next-page': []
}>()

const totalWords = computed(() => props.words.length)

const totalPages = computed(() => 
  Math.ceil(totalWords.value / props.wordsPerPage)
)

const startIndex = computed(() => {
  const page = Math.floor(props.currentIndex / props.wordsPerPage)
  return page * props.wordsPerPage
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + props.wordsPerPage, totalWords.value)
})

const visibleWords = computed(() => {
  return props.words.slice(startIndex.value, endIndex.value)
})
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
    font-size: 0.9375rem;
    line-height: 1.7;
    padding-bottom: 1.5rem;
  }

  .nav-button {
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
  }

  .page-info {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .context-page {
    padding: 0.75rem;
  }

  .context-text {
    font-size: 0.875rem;
    line-height: 1.65;
    padding-bottom: 1rem;
  }

  .context-controls {
    padding: 0.75rem 0;
    gap: 0.75rem;
  }

  .nav-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    min-width: 44px;
    min-height: 44px;
  }

  .page-info {
    font-size: 0.8125rem;
  }
}
</style>
