/**
 * Library store - manages book collection
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Book } from '@/types'
import { storage } from '@/services/storage'
import { extractTitle, countWords } from '@/utils/tokenize'

export const useLibraryStore = defineStore('library', () => {
  // State
  const books = ref<Book[]>([])
  const selectedBookId = ref<string | null>(null)
  const searchQuery = ref('')
  const sortBy = ref<'title' | 'author' | 'addedAt' | 'lastRead'>('addedAt')
  const isLoaded = ref(false)

  // Computed
  const selectedBook = computed(() => {
    if (!selectedBookId.value) return null
    return books.value.find(book => book.id === selectedBookId.value) || null
  })

  const filteredBooks = computed(() => {
    let filtered = books.value

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy.value) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return (a.author || '').localeCompare(b.author || '')
        case 'addedAt':
          return b.addedAt.getTime() - a.addedAt.getTime()
        case 'lastRead':
          return b.updatedAt.getTime() - a.updatedAt.getTime()
        default:
          return 0
      }
    })

    return filtered
  })

  // Load books from storage
  async function loadBooks() {
    const storedBooks = await storage.getAllBooks()
    books.value = storedBooks.map(book => ({
      ...book,
      addedAt: new Date(book.addedAt),
      updatedAt: new Date(book.updatedAt),
    }))
    isLoaded.value = true
  }

  // Add a new book
  async function addBook(content: string, title?: string, author?: string): Promise<Book> {
    const book: Book = {
      id: crypto.randomUUID(),
      title: title || extractTitle(content),
      author,
      content,
      lastPosition: 0,
      totalWords: countWords(content),
      addedAt: new Date(),
      updatedAt: new Date(),
    }

    await storage.addBook(book)
    books.value.push(book)
    return book
  }

  // Import book from file
  async function importBookFromFile(file: File): Promise<Book> {
    const content = await file.text()
    const title = file.name.replace(/\.(txt|md)$/i, '')
    return addBook(content, title)
  }

  // Update book
  async function updateBook(bookId: string, updates: Partial<Book>) {
    const index = books.value.findIndex(b => b.id === bookId)
    if (index === -1) return

    const book = books.value[index]!
    const updatedBook = { ...book, ...updates, updatedAt: new Date() }
    books.value[index] = updatedBook
    await storage.updateBook(updatedBook)
  }

  // Delete book
  async function deleteBook(bookId: string) {
    const index = books.value.findIndex(b => b.id === bookId)
    if (index === -1) return

    await storage.deleteBook(bookId)
    books.value.splice(index, 1)

    if (selectedBookId.value === bookId) {
      selectedBookId.value = null
    }
  }

  // Update book reading position
  async function updateBookPosition(bookId: string, position: number) {
    await storage.updateBookPosition(bookId, position)
    const book = books.value.find(b => b.id === bookId)
    if (book) {
      book.lastPosition = position
      book.updatedAt = new Date()
    }
  }

  // Select a book
  function selectBook(bookId: string | null) {
    selectedBookId.value = bookId
  }

  // Set search query
  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  // Set sort order
  function setSortBy(sort: typeof sortBy.value) {
    sortBy.value = sort
  }

  return {
    // State
    books,
    selectedBookId,
    searchQuery,
    sortBy,
    isLoaded,

    // Computed
    selectedBook,
    filteredBooks,

    // Actions
    loadBooks,
    addBook,
    importBookFromFile,
    updateBook,
    deleteBook,
    updateBookPosition,
    selectBook,
    setSearchQuery,
    setSortBy,
  }
})
