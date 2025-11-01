/**
 * IndexedDB storage service for books and settings
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Book, UserSettings } from '@/types'

interface MReaderDB extends DBSchema {
  books: {
    key: string
    value: Book
    indexes: { 'by-title': string; 'by-addedAt': Date }
  }
  settings: {
    key: string
    value: any
  }
}

class StorageService {
  private db: IDBPDatabase<MReaderDB> | null = null
  private readonly DB_NAME = 'mreader-db'
  private readonly DB_VERSION = 1

  async init(): Promise<void> {
    if (this.db) return

    this.db = await openDB<MReaderDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Create books store
        if (!db.objectStoreNames.contains('books')) {
          const bookStore = db.createObjectStore('books', { keyPath: 'id' })
          bookStore.createIndex('by-title', 'title')
          bookStore.createIndex('by-addedAt', 'addedAt')
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
      },
    })
  }

  // Book operations
  async addBook(book: Book): Promise<void> {
    await this.init()
    await this.db!.add('books', book)
  }

  async getBook(id: string): Promise<Book | undefined> {
    await this.init()
    return await this.db!.get('books', id)
  }

  async getAllBooks(): Promise<Book[]> {
    await this.init()
    return await this.db!.getAll('books')
  }

  async updateBook(book: Book): Promise<void> {
    await this.init()
    book.updatedAt = new Date()
    await this.db!.put('books', book)
  }

  async deleteBook(id: string): Promise<void> {
    await this.init()
    await this.db!.delete('books', id)
  }

  async updateBookPosition(id: string, position: number): Promise<void> {
    await this.init()
    const book = await this.getBook(id)
    if (book) {
      book.lastPosition = position
      book.updatedAt = new Date()
      await this.updateBook(book)
    }
  }

  // Settings operations
  async getSetting<T>(key: string, defaultValue: T): Promise<T> {
    await this.init()
    const value = await this.db!.get('settings', key)
    return value !== undefined ? value : defaultValue
  }

  async setSetting(key: string, value: any): Promise<void> {
    await this.init()
    await this.db!.put('settings', value, key)
  }

  async getUserSettings(): Promise<UserSettings> {
    await this.init()
    const settings = await this.db!.get('settings', 'userSettings')
    
    // Default settings
    const defaults: UserSettings = {
      theme: 'light',
      fontFamily: 'system',
      fontSize: 16,
      wpm: 250,
      prosodySensitivity: 0.7,
      autoSave: true,
      showPivotHighlight: true,
    }

    return settings ? { ...defaults, ...settings } : defaults
  }

  async setUserSettings(settings: Partial<UserSettings>): Promise<void> {
    await this.init()
    const current = await this.getUserSettings()
    await this.db!.put('settings', { ...current, ...settings }, 'userSettings')
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await this.init()
    await this.db!.clear('books')
    await this.db!.clear('settings')
  }
}

export const storage = new StorageService()
