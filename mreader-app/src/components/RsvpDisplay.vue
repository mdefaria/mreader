<template>
  <div class="rsvp-display">
    <div v-if="currentWord" class="word-container">
      <!-- Word with pivot alignment -->
      <div v-if="showPivotHighlight" class="word pivot-mode">
        <div class="pivot-wrapper">
          <span class="word-part before-pivot">{{ beforePivot }}</span><!--
       --><span class="word-part pivot">{{ pivotChar }}</span><!--
       --><span class="word-part after-pivot">{{ afterPivot }}</span>
        </div>
      </div>
      <div v-else class="word">
        <span class="full-word">{{ currentWord.text }}</span>
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
import { useSettingsStore } from '@/stores/settings'
import type { Word } from '@/types'

interface Props {
  currentWord: Word | null
  progress: number
  isComplete?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isComplete: false,
})

const settingsStore = useSettingsStore()

// Get pivot highlight setting
const showPivotHighlight = computed(() => settingsStore.showPivotHighlight)

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
  letter-spacing: 0.02em;
  line-height: 1.4;
  color: var(--text-primary);
  text-align: center;
  min-height: 1.4em;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Pivot mode - align pivot letter to center with fixed positioning */
.word.pivot-mode {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 1.4em;
}

.pivot-wrapper {
  position: relative;
  display: inline-block;
  white-space: nowrap;
}

.word.pivot-mode .word-part {
  display: inline-block;
  white-space: nowrap;
  position: absolute;
  top: 0;
}

.word.pivot-mode .before-pivot {
  opacity: 0.9;
  right: 100%;
  text-align: right;
}

.word.pivot-mode .pivot {
  color: var(--accent-color, #ff6b6b);
  font-weight: 700;
  border-bottom: 3px solid var(--accent-color, #ff6b6b);
  padding-bottom: 2px;
  position: relative;
  left: 0;
  z-index: 1;
}

.word.pivot-mode .after-pivot {
  opacity: 0.9;
  left: 100%;
  text-align: left;
}

/* Full word mode - simple centered text */
.full-word {
  text-align: center;
  display: block;
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
