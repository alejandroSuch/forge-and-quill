/**
 * Client-side persistence layer.
 * - localStorage: scalar character data (fast, synchronous reads on startup)
 * - IndexedDB: list data (possessions, codewords, titles, notes, ticks)
 */

const DB_NAME = 'vv-db'
const DB_VERSION = 1
const STORES = ['possessions', 'codewords', 'titles', 'notes', 'ticks'] as const

export type StoreName = (typeof STORES)[number]

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: '_id', autoIncrement: true })
        }
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const req = tx.objectStore(store).getAll()
    req.onsuccess = () => resolve(req.result.map(stripId))
    req.onerror = () => reject(req.error)
  })
}

export async function idbPutAll<T>(store: StoreName, items: T[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const os = tx.objectStore(store)
    os.clear()
    items.forEach((item, i) => os.put({ ...item, _id: i }))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbClear(store: StoreName): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbClearAll(): Promise<void> {
  await Promise.all(STORES.map(s => idbClear(s)))
}

function stripId<T>(obj: T & { _id?: number }): T {
  const { _id: _, ...rest } = obj
  return rest as T
}

// localStorage helpers (unchanged semantics, centralized)
const LS_CHAR_KEY = 'vv-character'
const LS_SHEET_KEY = 'vv-sheet-id'

export function lsLoadCharacter(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(LS_CHAR_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

export function lsSaveCharacter(data: Record<string, unknown>): void {
  localStorage.setItem(LS_CHAR_KEY, JSON.stringify(data))
}

export function lsGetSheetId(): string {
  return localStorage.getItem(LS_SHEET_KEY) ?? ''
}

export function lsSetSheetId(id: string): void {
  localStorage.setItem(LS_SHEET_KEY, id)
}

export function lsClearSheetId(): void {
  localStorage.removeItem(LS_SHEET_KEY)
}
