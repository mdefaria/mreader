<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Settings</h2>
            <button class="close-button" @click="closeModal" aria-label="Close">×</button>
          </div>

          <div class="modal-body">
            <!-- WPM Control -->
            <div class="setting-group">
              <label for="wpm">Reading Speed (WPM)</label>
              <div class="slider-container">
                <input
                  id="wpm"
                  type="range"
                  min="100"
                  max="1000"
                  step="10"
                  :value="localWpm"
                  @input="updateWpm"
                />
                <span class="slider-value">{{ localWpm }}</span>
              </div>
              <div class="slider-labels">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            <!-- Prosody Sensitivity -->
            <div class="setting-group">
              <label for="prosody">Prosody Sensitivity</label>
              <div class="slider-container">
                <input
                  id="prosody"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  :value="localProsodySensitivity"
                  @input="updateProsodySensitivity"
                />
                <span class="slider-value">{{ (localProsodySensitivity * 100).toFixed(0) }}%</span>
              </div>
              <div class="slider-labels">
                <span>Off</span>
                <span>Max</span>
              </div>
            </div>

            <!-- Theme Selection -->
            <div class="setting-group">
              <label>Theme</label>
              <div class="button-group">
                <button
                  v-for="themeOption in themes"
                  :key="themeOption"
                  class="option-button"
                  :class="{ active: localTheme === themeOption }"
                  @click="updateTheme(themeOption)"
                >
                  {{ themeOption.charAt(0).toUpperCase() + themeOption.slice(1) }}
                </button>
              </div>
            </div>

            <!-- Font Family -->
            <div class="setting-group">
              <label>Font</label>
              <div class="button-group">
                <button
                  v-for="font in fonts"
                  :key="font"
                  class="option-button"
                  :class="{ active: localFontFamily === font }"
                  @click="updateFontFamily(font)"
                >
                  {{ fontLabels[font] }}
                </button>
              </div>
            </div>

            <!-- Font Size -->
            <div class="setting-group">
              <label for="fontSize">Font Size</label>
              <div class="slider-container">
                <input
                  id="fontSize"
                  type="range"
                  min="12"
                  max="32"
                  step="1"
                  :value="localFontSize"
                  @input="updateFontSize"
                />
                <span class="slider-value">{{ localFontSize }}px</span>
              </div>
            </div>

            <!-- Toggle Options -->
            <div class="setting-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  :checked="localShowProsodyHints"
                  @change="toggleProsodyHints"
                />
                <span>Show prosody hints</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button class="primary-button" @click="closeModal">Done</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Theme, FontFamily } from '@/types'
import { useSettingsStore } from '@/stores/settings'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const settingsStore = useSettingsStore()

// Local state for immediate UI feedback
const localWpm = ref(settingsStore.wpm)
const localProsodySensitivity = ref(settingsStore.prosodySensitivity)
const localTheme = ref(settingsStore.theme)
const localFontFamily = ref(settingsStore.fontFamily)
const localFontSize = ref(settingsStore.fontSize)
const localShowProsodyHints = ref(settingsStore.showProsodyHints)

// Options
const themes: Theme[] = ['light', 'dark', 'book']
const fonts: FontFamily[] = ['system', 'serif', 'sans-serif', 'monospace']
const fontLabels: Record<FontFamily, string> = {
  system: 'System',
  serif: 'Serif',
  'sans-serif': 'Sans',
  monospace: 'Mono',
  dyslexic: 'Dyslexic',
}

// Update methods
function updateWpm(event: Event) {
  const value = parseInt((event.target as HTMLInputElement).value)
  localWpm.value = value
  settingsStore.setWpm(value)
}

function updateProsodySensitivity(event: Event) {
  const value = parseFloat((event.target as HTMLInputElement).value)
  localProsodySensitivity.value = value
  settingsStore.setProsodySensitivity(value)
}

function updateTheme(theme: Theme) {
  localTheme.value = theme
  settingsStore.setTheme(theme)
}

function updateFontFamily(font: FontFamily) {
  localFontFamily.value = font
  settingsStore.setFontFamily(font)
}

function updateFontSize(event: Event) {
  const value = parseInt((event.target as HTMLInputElement).value)
  localFontSize.value = value
  settingsStore.setFontSize(value)
}

function toggleProsodyHints() {
  localShowProsodyHints.value = !localShowProsodyHints.value
  settingsStore.toggleProsodyHints()
}

function closeModal() {
  emit('close')
}

// Sync with store when settings change externally
watch(
  () => settingsStore.wpm,
  (value) => (localWpm.value = value)
)
watch(
  () => settingsStore.prosodySensitivity,
  (value) => (localProsodySensitivity.value = value)
)
watch(
  () => settingsStore.theme,
  (value) => (localTheme.value = value)
)
watch(
  () => settingsStore.fontFamily,
  (value) => (localFontFamily.value = value)
)
watch(
  () => settingsStore.fontSize,
  (value) => (localFontSize.value = value)
)
watch(
  () => settingsStore.showProsodyHints,
  (value) => (localShowProsodyHints.value = value)
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-primary, white);
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: var(--bg-secondary, #f5f5f5);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider-container input[type='range'] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: var(--bg-secondary, #e0e0e0);
  outline: none;
  -webkit-appearance: none;
}

.slider-container input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-color, #ff6b6b);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.slider-container input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider-container input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent-color, #ff6b6b);
  cursor: pointer;
  border: none;
  transition: transform 0.2s ease;
}

.slider-container input[type='range']::-moz-range-thumb:hover {
  transform: scale(1.2);
}

.slider-value {
  min-width: 4rem;
  text-align: right;
  font-weight: 600;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.option-button {
  flex: 1;
  min-width: 80px;
  padding: 0.6rem 1rem;
  background: var(--bg-secondary, #f5f5f5);
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-primary);
  transition: all 0.2s ease;
  font-weight: 500;
}

.option-button:hover {
  background: var(--bg-hover, #e8e8e8);
}

.option-button.active {
  background: var(--accent-color, #ff6b6b);
  color: white;
  border-color: var(--accent-color, #ff6b6b);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--accent-color, #ff6b6b);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color, #e0e0e0);
}

.primary-button {
  width: 100%;
  padding: 0.75rem;
  background: var(--accent-color, #ff6b6b);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.primary-button:active {
  transform: translateY(0);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    max-height: 95vh;
  }

  .modal-body {
    padding: 1rem;
  }

  .setting-group {
    margin-bottom: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .option-button {
    width: 100%;
  }
}
</style>
