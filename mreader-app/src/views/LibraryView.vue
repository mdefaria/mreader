<template>
  <div class="library-view">
    <header class="library-header">
      <h1>📖 My Library</h1>
      <div class="header-actions">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search books..."
          class="search-input"
        />
      </div>
    </header>

    <div class="library-content">
      <BookUploader v-if="books.length === 0 || showUploader" @upload="handleUpload" />

      <div v-if="books.length > 0" class="books-grid">
        <div
          v-for="book in filteredBooks"
          :key="book.id"
          class="book-card"
          @click="openBook(book.id)"
        >
          <div class="book-info">
            <h3 class="book-title">
              {{ book.title }}
              <span v-if="book.format === 'epub'" class="format-badge">EPUB</span>
            </h3>
            <p v-if="book.author" class="book-author">{{ book.author }}</p>
            <div class="book-meta">
              <span>{{ book.totalWords.toLocaleString() }} words</span>
              <span v-if="book.lastPosition > 0">
                {{ Math.round((book.lastPosition / book.totalWords) * 100) }}% read
              </span>
            </div>
          </div>
          <div class="book-actions">
            <button
              class="action-button delete"
              @click.stop="confirmDelete(book.id)"
              aria-label="Delete book"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <button v-if="books.length > 0" class="add-more-button" @click="showUploader = !showUploader">
        {{ showUploader ? '✕ Cancel' : '+ Add Another Book' }}
      </button>
    </div>

    <!-- Version display -->
    <div class="version-display" role="contentinfo" aria-label="App version">
      v{{ appVersion }}
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="deleteConfirm" class="confirm-overlay" @click="deleteConfirm = null">
        <div class="confirm-dialog" @click.stop>
          <h3>Delete Book?</h3>
          <p>This action cannot be undone.</p>
          <div class="confirm-actions">
            <button class="cancel-button" @click="deleteConfirm = null">Cancel</button>
            <button class="delete-button" @click="deleteBook">Delete</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLibraryStore } from '@/stores/library'
import BookUploader from '@/components/BookUploader.vue'

// Get app version from package.json
const appVersion = import.meta.env.VITE_APP_VERSION || '0.1.0'

const emit = defineEmits<{
  'open-book': [bookId: string]
}>()

const libraryStore = useLibraryStore()
const showUploader = ref(false)
const deleteConfirm = ref<string | null>(null)

const books = computed(() => libraryStore.books)
const filteredBooks = computed(() => libraryStore.filteredBooks)

const searchQuery = computed({
  get: () => libraryStore.searchQuery,
  set: (value) => libraryStore.setSearchQuery(value),
})

async function handleUpload(file: File) {
  try {
    await libraryStore.importBookFromFile(file)
    showUploader.value = false
  } catch (error) {
    console.error('Failed to import book:', error)
    alert('Failed to import book. Please try again.')
  }
}

function openBook(bookId: string) {
  emit('open-book', bookId)
}

function confirmDelete(bookId: string) {
  deleteConfirm.value = bookId
}

async function deleteBook() {
  if (!deleteConfirm.value) return
  await libraryStore.deleteBook(deleteConfirm.value)
  deleteConfirm.value = null
}
</script>

<style scoped>
.library-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.library-header {
  padding: 2rem;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  background: var(--bg-primary);
}

.library-header h1 {
  margin: 0 0 1rem;
  font-size: 2rem;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.search-input {
  flex: 1;
  max-width: 400px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color, #ff6b6b);
}

.library-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.book-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--accent-color, #ff6b6b);
}

.book-info {
  flex: 1;
  min-width: 0;
}

.book-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.format-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  background: var(--accent-color, #ff6b6b);
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 4px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.book-author {
  margin: 0 0 0.75rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-style: italic;
}

.book-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.book-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.6;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.action-button:hover {
  opacity: 1;
  background: var(--bg-hover, rgba(0, 0, 0, 0.05));
}

.add-more-button {
  display: block;
  width: 100%;
  padding: 1rem;
  background: var(--bg-secondary);
  border: 2px dashed var(--border-color, #e0e0e0);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-more-button:hover {
  border-color: var(--accent-color, #ff6b6b);
  color: var(--accent-color, #ff6b6b);
  background: var(--bg-hover);
}

/* Confirmation dialog */
.confirm-overlay {
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
}

.confirm-dialog {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.confirm-dialog h3 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.confirm-dialog p {
  margin: 0 0 1.5rem;
  color: var(--text-secondary);
}

.confirm-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-button,
.delete-button {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.cancel-button:hover {
  background: var(--bg-hover);
}

.delete-button {
  background: #dc3545;
  color: white;
}

.delete-button:hover {
  background: #c82333;
}

/* Responsive */
@media (max-width: 768px) {
  .library-header {
    padding: 1rem;
  }

  .library-header h1 {
    font-size: 1.5rem;
  }

  .library-content {
    padding: 1rem;
  }

  .books-grid {
    grid-template-columns: 1fr;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .library-header {
    padding: 0.75rem;
  }

  .library-header h1 {
    font-size: 1.25rem;
    margin: 0 0 0.75rem;
  }

  .search-input {
    max-width: 100%;
    padding: 0.625rem 0.875rem;
    font-size: 0.9375rem;
  }

  .library-content {
    padding: 0.75rem;
  }

  .books-grid {
    gap: 1rem;
  }

  .book-card {
    padding: 1rem;
  }

  .book-title {
    font-size: 1.125rem;
  }

  .book-meta {
    font-size: 0.8rem;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .confirm-dialog {
    padding: 1.5rem;
  }
}

/* Version display */
.version-display {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  padding: 0.375rem 0.75rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 500;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
  pointer-events: none;
  user-select: none;
  opacity: 0.6;
  transition: opacity 0.2s ease;
  z-index: 100;
}

/* Improve visibility on focus for keyboard navigation */
.version-display:focus-visible {
  opacity: 1;
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
}

/* Only apply hover on devices that support it (not touch-only) */
@media (hover: hover) and (pointer: fine) {
  .version-display:hover {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .version-display {
    bottom: 0.75rem;
    right: 0.75rem;
    font-size: 0.6875rem;
    padding: 0.3125rem 0.625rem;
  }
}
</style>
