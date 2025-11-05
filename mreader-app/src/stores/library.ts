/**
 * Library store - manages book collection
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Book, BookFormat, ProsodyBookFile } from '@/types'
import { storage } from '@/services/storage'
import { extractTitle, countWords } from '@/utils/tokenize'
import { parseEpubFile, isEpubFile } from '@/utils/epub-parser'

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
  async function addBook(
    content: string,
    format: BookFormat,
    title?: string,
    author?: string
  ): Promise<Book> {
    const book: Book = {
      id: crypto.randomUUID(),
      title: title || extractTitle(content),
      author,
      content,
      format,
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
    // Check if it's a prosody JSON file
    if (file.name.endsWith('.prosody.json') || 
        (file.name.endsWith('.json') && file.type === 'application/json')) {
      try {
        const jsonContent = await file.text()
        const prosodyBook = JSON.parse(jsonContent) as ProsodyBookFile
        
        // Validate prosody book format (API response + title)
        if (!prosodyBook.version || !prosodyBook.words || !prosodyBook.title) {
          throw new Error('Invalid prosody book format')
        }
        
        // Reconstruct text from words
        const text = prosodyBook.words.map(w => w.text).join(' ')
        
        console.log('📚 Importing prosody book:', {
          title: prosodyBook.title,
          author: prosodyBook.author,
          method: prosodyBook.method,
          wordCount: prosodyBook.metadata.wordCount,
          firstWord: prosodyBook.words[0]
        })
        
        // Create book with embedded prosody data
        const book: Book = {
          id: crypto.randomUUID(),
          title: prosodyBook.title,
          author: prosodyBook.author,
          content: text,
          format: 'prosody',
          lastPosition: 0,
          totalWords: prosodyBook.metadata.wordCount,
          prosodyData: {
            version: prosodyBook.version,
            method: prosodyBook.method,
            metadata: prosodyBook.metadata,
            words: prosodyBook.words,
            analyzed: true,
            lastAnalyzed: new Date(),
          },
          addedAt: new Date(),
          updatedAt: new Date(),
        }
        
        await storage.addBook(book)
        books.value.push(book)
        return book
      } catch (error) {
        console.error('Failed to parse prosody book:', error)
        throw new Error('Invalid prosody book file')
      }
    }

    // Check if it's an EPUB file
    if (isEpubFile(file)) {
      const { content, metadata } = await parseEpubFile(file)
      const title = metadata.title || file.name.replace(/\.epub$/i, '')
      const author = metadata.creator
      return addBook(content, 'epub', title, author)
    }

    // Otherwise treat as plain text
    const content = await file.text()
    const title = file.name.replace(/\.(txt|md)$/i, '')
    return addBook(content, 'txt', title)
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
