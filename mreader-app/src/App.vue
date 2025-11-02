<template>
  <div id="app" :data-theme="theme">
    <LibraryView v-if="currentView === 'library'" @open-book="openBook" />
    <ReaderView
      v-else-if="currentView === 'reader' && selectedBookId"
      :book-id="selectedBookId"
      @back-to-library="backToLibrary"
    />
    <UpdatePrompt />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLibraryStore } from './stores/library'
import { useSettingsStore } from './stores/settings'
import LibraryView from './views/LibraryView.vue'
import ReaderView from './views/ReaderView.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'

type View = 'library' | 'reader'

const currentView = ref<View>('library')
const selectedBookId = ref<string | null>(null)

const libraryStore = useLibraryStore()
const settingsStore = useSettingsStore()

const theme = computed(() => settingsStore.theme)

// Initialize app
onMounted(async () => {
  await settingsStore.loadSettings()
  await libraryStore.loadBooks()
})

// Navigation
function openBook(bookId: string) {
  selectedBookId.value = bookId
  currentView.value = 'reader'
}

function backToLibrary() {
  currentView.value = 'library'
  selectedBookId.value = null
}
</script>

<style>
/* CSS Variables for theming */
:root[data-theme='light'] {
  --bg-primary: #ffffff;
  --bg-secondary: #f7fafc;
  --bg-hover: #edf2f7;
  --text-primary: #1a202c;
  --text-secondary: #718096;
  --border-color: #e2e8f0;
  --accent-color: #ff6b6b;
  --accent-light: rgba(255, 107, 107, 0.1);
  --hover-bg: rgba(0, 0, 0, 0.05);
}

:root[data-theme='dark'] {
  --bg-primary: #1a202c;
  --bg-secondary: #2d3748;
  --bg-hover: #4a5568;
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
  --border-color: #4a5568;
  --accent-color: #ff6b6b;
  --accent-light: rgba(255, 107, 107, 0.1);
  --hover-bg: rgba(255, 255, 255, 0.05);
}

:root[data-theme='book'] {
  --bg-primary: #f4f1ea;
  --bg-secondary: #e8e3d3;
  --bg-hover: #dcd7c7;
  --text-primary: #3e3022;
  --text-secondary: #6b5d4f;
  --border-color: #d4cfc0;
  --accent-color: #c17850;
  --accent-light: rgba(193, 120, 80, 0.1);
  --hover-bg: rgba(0, 0, 0, 0.05);
}

/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

button {
  font-family: inherit;
}

input, textarea, select {
  font-family: inherit;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}

/* Focus styles */
:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Selection */
::selection {
  background: var(--accent-light);
  color: var(--text-primary);
}
</style>

