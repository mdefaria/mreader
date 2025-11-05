<template>
  <div
    class="book-uploader"
    :class="{ 'is-dragging': isDragging }"
    @drop.prevent="handleDrop"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
  >
    <div class="upload-content">
      <div class="upload-icon">📚</div>
      <h3>Add a Book</h3>
      <p>Drag and drop a text, EPUB, or prosody file here, or click to browse</p>
      <input
        ref="fileInput"
        type="file"
        accept=".txt,.md,.epub,.prosody.json,.json"
        @change="handleFileSelect"
        class="file-input"
      />
      <button class="browse-button" @click="openFilePicker">
        Choose File
      </button>
      <div v-if="isUploading" class="uploading">
        <div class="spinner"></div>
        <p>Adding book...</p>
      </div>
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  upload: [file: File]
}>()

const isDragging = ref(false)
const isUploading = ref(false)
const error = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const ACCEPTED_TYPES = ['text/plain', 'text/markdown', 'application/epub+zip', 'application/json']
const ACCEPTED_EXTENSIONS = /\.(txt|md|epub|prosody\.json|json)$/i
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB (EPUB files can be larger)

function openFilePicker() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

async function processFile(file: File) {
  error.value = ''

  // Validate file type
  if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.test(file.name)) {
    error.value = 'Please upload a .txt, .md, .epub, or .prosody.json file'
    return
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    error.value = 'File is too large. Maximum size is 50MB'
    return
  }

  // Validate file is not empty
  if (file.size === 0) {
    error.value = 'File is empty'
    return
  }

  isUploading.value = true

  try {
    emit('upload', file)
  } catch (err) {
    error.value = 'Failed to upload file'
    console.error(err)
  } finally {
    isUploading.value = false
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>

<style scoped>
.book-uploader {
  border: 2px dashed var(--border-color, #cbd5e0);
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--bg-secondary, #f7fafc);
  cursor: pointer;
}

.book-uploader:hover {
  border-color: var(--accent-color, #ff6b6b);
  background: var(--bg-hover, #edf2f7);
}

.book-uploader.is-dragging {
  border-color: var(--accent-color, #ff6b6b);
  background: var(--accent-light, rgba(255, 107, 107, 0.1));
  transform: scale(1.02);
}

.upload-content {
  pointer-events: none;
}

.upload-content * {
  pointer-events: auto;
}

.upload-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.book-uploader h3 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.book-uploader p {
  margin: 0 0 1.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.file-input {
  display: none;
}

.browse-button {
  padding: 0.75rem 2rem;
  background: var(--accent-color, #ff6b6b);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.browse-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.browse-button:active {
  transform: translateY(0);
}

.uploading {
  margin-top: 1.5rem;
  color: var(--text-secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--bg-secondary, #e0e0e0);
  border-top-color: var(--accent-color, #ff6b6b);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fee;
  color: #c00;
  border-radius: 6px;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .book-uploader {
    padding: 2rem 1rem;
  }

  .upload-icon {
    font-size: 3rem;
  }

  .book-uploader h3 {
    font-size: 1.25rem;
  }
}

/* Extra small screens */
@media (max-width: 480px) {
  .book-uploader {
    padding: 1.5rem 0.75rem;
  }

  .upload-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .book-uploader h3 {
    font-size: 1.125rem;
    margin: 0 0 0.375rem;
  }

  .book-uploader p {
    font-size: 0.875rem;
    margin: 0 0 1.25rem;
  }

  .browse-button {
    padding: 0.625rem 1.5rem;
    font-size: 0.9375rem;
  }

  .error-message {
    font-size: 0.8125rem;
  }
}
</style>
