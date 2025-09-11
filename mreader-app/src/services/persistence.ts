// IndexedDB-backed persistence for mreader.
// Stores user settings and last reading session using a tiny key/value store.
// Uses browser-native IndexedDB (no extra deps) to keep bundle size minimal.

import type { VisualMode } from '../types';

// App state v1 (legacy) kept for migration
interface PersistedAppStateV1 {
  version: 1;
  wpm: number;
  visualMode: VisualMode;
  bookText: string | null;
  index: number;
  updatedAt: number;
}

// Current app state v2: no embedded book data; points to active book id
export interface PersistedAppStateV2 {
  version: 2;
  wpm: number;
  visualMode: VisualMode;
  activeBookId?: string;
  updatedAt: number;
}

type AnyAppState = PersistedAppStateV1 | PersistedAppStateV2;

const DEFAULT_APP_STATE: PersistedAppStateV2 = {
  version: 2,
  wpm: 300,
  visualMode: 'light',
  activeBookId: undefined,
  updatedAt: Date.now(),
};

export type BookRecord = {
  id: string;
  title: string;
  text: string;
  index: number;
  size: number;
  createdAt: number;
  updatedAt: number;
};

// Minimal IndexedDB helpers
const DB_NAME = 'mreader';
const DB_VERSION = 2;
const STORE = 'kv';
const BOOKS_STORE = 'books';
const APP_KEY = 'app';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(BOOKS_STORE)) {
        db.createObjectStore(BOOKS_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function idbGet<T>(key: string): Promise<T | undefined> {
  return openDB().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const store = tx.objectStore(STORE);
        const rq = store.get(key);
        rq.onsuccess = () => {
          const val = rq.result?.value as T | undefined;
          resolve(val);
        };
        rq.onerror = () => reject(rq.error);
      })
  );
}

function idbSet<T>(key: string, value: T): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        const rq = store.put({ key, value });
        rq.onsuccess = () => resolve();
        rq.onerror = () => reject(rq.error);
      })
  );
}

function idbDel(key: string): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        const store = tx.objectStore(STORE);
        const rq = store.delete(key);
        rq.onsuccess = () => resolve();
        rq.onerror = () => reject(rq.error);
      })
  );
}

// Books store helpers
function booksGet(id: string): Promise<BookRecord | undefined> {
  return openDB().then(
    (db) =>
      new Promise<BookRecord | undefined>((resolve, reject) => {
        const tx = db.transaction(BOOKS_STORE, 'readonly');
        const store = tx.objectStore(BOOKS_STORE);
        const rq = store.get(id);
        rq.onsuccess = () => resolve(rq.result as BookRecord | undefined);
        rq.onerror = () => reject(rq.error);
      })
  );
}

function booksPut(book: BookRecord): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(BOOKS_STORE, 'readwrite');
        const store = tx.objectStore(BOOKS_STORE);
        const rq = store.put(book);
        rq.onsuccess = () => resolve();
        rq.onerror = () => reject(rq.error);
      })
  );
}

function booksGetAll(): Promise<BookRecord[]> {
  return openDB().then(
    (db) =>
      new Promise<BookRecord[]>((resolve, reject) => {
        const tx = db.transaction(BOOKS_STORE, 'readonly');
        const store = tx.objectStore(BOOKS_STORE);
        // getAll is widely supported in modern browsers
        const maybeGetAll = (store as IDBObjectStore & { getAll?: () => IDBRequest })
          .getAll?.bind(store) as undefined | (() => IDBRequest);
        const rq = maybeGetAll ? maybeGetAll() : null;
        if (rq) {
          rq.onsuccess = () => resolve((rq.result as BookRecord[]) || []);
          rq.onerror = () => reject(rq.error);
        } else {
          // Fallback cursor path
          const results: BookRecord[] = [];
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor) {
              results.push(cursor.value as BookRecord);
              cursor.continue();
            } else {
              resolve(results);
            }
          };
          cursorReq.onerror = () => reject(cursorReq.error);
        }
      })
  );
}

let lastKnown: Partial<PersistedAppStateV2> = {};

export async function loadState(): Promise<Partial<PersistedAppStateV2>> {
  if (typeof indexedDB === 'undefined') return {};
  try {
    const state = await idbGet<AnyAppState>(APP_KEY);
    if (state) {
      if ((state as PersistedAppStateV1).version === 1) {
        // Migrate: create a book record if bookText exists
        const v1 = state as PersistedAppStateV1;
        let activeBookId: string | undefined;
        if (v1.bookText) {
          const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `book-${Date.now()}`;
          const book: BookRecord = {
            id,
            title: 'Imported book',
            text: v1.bookText,
            index: v1.index || 0,
            size: v1.bookText.length,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await booksPut(book);
          activeBookId = id;
        }
        const v2: PersistedAppStateV2 = {
          version: 2,
          wpm: v1.wpm,
          visualMode: v1.visualMode,
          activeBookId,
          updatedAt: Date.now(),
        };
        await idbSet(APP_KEY, v2);
        lastKnown = v2;
        return v2;
      }
      if ((state as PersistedAppStateV2).version === 2) {
        lastKnown = state as PersistedAppStateV2;
        return state as PersistedAppStateV2;
      }
    }
  } catch {
    // ignore
  }
  return {};
}

let saveQueued = false;
let pending: Partial<PersistedAppStateV2> = {};

// Merge + throttle writes to next animation frame to avoid excessive churn.
export function saveState(partial: Partial<PersistedAppStateV2>) {
  pending = { ...pending, ...partial };
  if (saveQueued) return;
  saveQueued = true;
  requestAnimationFrame(async () => {
    try {
      const merged: PersistedAppStateV2 = {
        ...DEFAULT_APP_STATE,
        ...(lastKnown as PersistedAppStateV2),
        ...pending,
        updatedAt: Date.now(),
      } as PersistedAppStateV2;
      await idbSet(APP_KEY, merged);
      lastKnown = merged;
    } catch {
      // ignore
    } finally {
      pending = {};
      saveQueued = false;
    }
  });
}

export async function clearState() {
  try {
    await idbDel(APP_KEY);
    lastKnown = {};
  } catch {
    // ignore
  }
}

// Public book APIs
export async function addBook(title: string, text: string): Promise<BookRecord> {
  const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `book-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = Date.now();
  const book: BookRecord = { id, title, text, index: 0, size: text.length, createdAt: now, updatedAt: now };
  await booksPut(book);
  return book;
}

export async function getBook(id: string): Promise<BookRecord | undefined> {
  return booksGet(id);
}

export async function listBooks(): Promise<BookRecord[]> {
  const items = await booksGetAll();
  // Sort by updatedAt desc for convenience
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function updateBookIndex(id: string, index: number): Promise<void> {
  const existing = await booksGet(id);
  if (!existing) return;
  if (existing.index === index) return;
  existing.index = index;
  existing.updatedAt = Date.now();
  await booksPut(existing);
}

