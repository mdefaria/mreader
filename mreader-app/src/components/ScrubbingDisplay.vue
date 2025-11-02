<template>
  <div class="scrubbing-display">
    <div class="context-words">
      <div
        v-for="(word, index) in displayWords"
        :key="index"
        class="context-word"
        :class="{
          'is-current': index === currentWordIndex,
          'is-before': index < currentWordIndex,
          'is-after': index > currentWordIndex
        }"
      >
        {{ word.text }}
      </div>
    </div>
    
    <!-- Progress indicator -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>

    <!-- Scrubbing indicator -->
    <div class="scrubbing-indicator">
      <span class="indicator-icon">{{ direction === 'forward' ? '→' : '←' }}</span>
      <span class="indicator-text">{{ direction === 'forward' ? 'Fast Forward' : 'Rewind' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Word } from '@/types'

interface Props {
  surroundingWords: Word[]
  currentIndex: number
  totalWords: number
  progress: number
  direction: 'forward' | 'backward'
}

const props = defineProps<Props>()

// Find the index of the current word in the surrounding words array
const currentWordIndex = computed(() => {
  // The surrounding words array should be centered around current word
  // If we have 5 words (2 before, current, 2 after), current is at index 2
  return Math.floor(props.surroundingWords.length / 2)
})

const displayWords = computed(() => props.surroundingWords)
</script>

<style scoped>
.scrubbing-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  user-select: none;
}

.context-words {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  max-width: 90%;
}

.context-word {
  font-size: clamp(1rem, 4vw, 1.5rem);
  font-weight: 400;
  color: var(--text-secondary);
  transition: all 0.15s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.context-word.is-current {
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 600;
  color: var(--text-primary);
  background: var(--bg-secondary, rgba(0, 0, 0, 0.05));
  padding: 0.5rem 1rem;
  transform: scale(1.1);
}

.context-word.is-before,
.context-word.is-after {
  opacity: 0.6;
}

.progress-bar {
  width: 100%;
  max-width: 800px;
  height: 3px;
  background: var(--bg-secondary, #e0e0e0);
  border-radius: 2px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-color, #ff6b6b);
  transition: width 0.1s linear;
  border-radius: 2px;
}

.scrubbing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-color, #ff6b6b);
  font-size: 1.125rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  background: var(--bg-secondary, rgba(255, 107, 107, 0.1));
  border-radius: 8px;
  margin-top: 1rem;
}

.indicator-icon {
  font-size: 1.5rem;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.indicator-text {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .scrubbing-display {
    min-height: 200px;
    padding: 1rem;
  }

  .context-words {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .context-word {
    font-size: clamp(0.875rem, 3.5vw, 1.25rem);
  }

  .context-word.is-current {
    font-size: clamp(1.5rem, 10vw, 3rem);
  }

  .scrubbing-indicator {
    font-size: 1rem;
    padding: 0.625rem 1.25rem;
  }

  .indicator-icon {
    font-size: 1.25rem;
  }

  .indicator-text {
    font-size: 0.75rem;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .scrubbing-display {
    min-height: 180px;
    padding: 0.75rem;
  }

  .context-words {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .context-word {
    font-size: clamp(0.75rem, 3vw, 1rem);
    padding: 0.125rem 0.25rem;
  }

  .context-word.is-current {
    font-size: clamp(1.25rem, 11vw, 2.5rem);
    padding: 0.375rem 0.75rem;
  }

  .progress-bar {
    margin-bottom: 0.75rem;
  }

  .scrubbing-indicator {
    padding: 0.5rem 1rem;
    margin-top: 0.75rem;
  }
}
</style>
