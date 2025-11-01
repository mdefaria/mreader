<template>
  <div class="rsvp-display" :class="{ 'has-prosody': showProsodyHints && currentWord?.prosody }">
    <div v-if="currentWord" class="word-container">
      <!-- Word with pivot highlighting -->
      <div class="word">
        <span class="before-pivot">{{ beforePivot }}</span>
        <span class="pivot">{{ pivotChar }}</span>
        <span class="after-pivot">{{ afterPivot }}</span>
      </div>

      <!-- Prosody indicator -->
      <div v-if="showProsodyHints && currentWord.prosody" class="prosody-hint">
        <span v-if="currentWord.prosody.pause && currentWord.prosody.pause > 1.3" class="pause-indicator">
          {{ '·'.repeat(Math.min(3, Math.ceil(currentWord.prosody.pause))) }}
        </span>
        <span v-if="currentWord.prosody.emphasis" class="emphasis-indicator" :data-emphasis="currentWord.prosody.emphasis">
          {{ currentWord.prosody.emphasis === 'high' ? '!' : currentWord.prosody.emphasis === 'medium' ? '·' : '' }}
        </span>
      </div>

      <!-- Progress indicator -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
    </div>

    <div v-else class="no-word">
      <p>{{ isComplete ? 'Completed!' : 'No content' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Word } from '@/types'

interface Props {
  currentWord: Word | null
  progress: number
  showProsodyHints?: boolean
  isComplete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showProsodyHints: true,
  isComplete: false,
})

// Split word at pivot point
const beforePivot = computed(() => {
  if (!props.currentWord) return ''
  return props.currentWord.text.slice(0, props.currentWord.pivotIndex)
})

const pivotChar = computed(() => {
  if (!props.currentWord) return ''
  return props.currentWord.text.charAt(props.currentWord.pivotIndex)
})

const afterPivot = computed(() => {
  if (!props.currentWord) return ''
  return props.currentWord.text.slice(props.currentWord.pivotIndex + 1)
})
</script>

<style scoped>
.rsvp-display {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem;
  user-select: none;
}

.word-container {
  width: 100%;
  max-width: 800px;
}

.word {
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 500;
  text-align: center;
  letter-spacing: 0.02em;
  line-height: 1.4;
  transition: opacity 0.1s ease;
  color: var(--text-primary);
}

.before-pivot,
.after-pivot {
  opacity: 0.9;
}

.pivot {
  color: var(--accent-color, #ff6b6b);
  font-weight: 700;
  position: relative;
}

.pivot::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-color, #ff6b6b);
  opacity: 0.5;
}

.prosody-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  min-height: 1.5rem;
  color: var(--text-secondary);
  font-size: 1.5rem;
  opacity: 0.6;
}

.pause-indicator {
  letter-spacing: 0.2em;
}

.emphasis-indicator[data-emphasis='high'] {
  color: var(--accent-color, #ff6b6b);
  font-weight: bold;
}

.progress-bar {
  width: 100%;
  height: 3px;
  background: var(--bg-secondary, #e0e0e0);
  border-radius: 2px;
  margin-top: 2rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent-color, #ff6b6b);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.no-word {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .rsvp-display {
    min-height: 200px;
    padding: 1rem;
  }

  .word {
    font-size: clamp(1.5rem, 10vw, 3rem);
  }
}
</style>
