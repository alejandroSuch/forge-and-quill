/**
 * Client-side persistence layer using IndexedDB.
 *
 * v1: single "character" store with one record at key "state"
 * v2: "characters" store (keyPath: "id") + "meta" store for active slot
 *
 * On upgrade from v1→v2, existing data is migrated as slot "default".
 */

const DB_NAME = 'fq-db'
const DB_VERSION = 2

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (event) => {
      const db = req.result
      const oldVersion = event.oldVersion

      if (oldVersion < 1) {
        // Fresh install: skip v1 store entirely
      }

      if (oldVersion >= 1 && oldVersion < 2) {
        // Migrate v1 → v2: read old data, create new stores, copy it over
        // We'll handle the data migration after the upgrade completes
      }

      if (!db.objectStoreNames.contains('characters')) {
        db.createObjectStore('characters', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta')
      }

      // Remove old v1 store if present
      if (db.objectStoreNames.contains('character')) {
        // Can't read from old store here in the same upgrade transaction easily,
        // so we keep it and migrate in migrateV1 below
      }
    }

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

/** Migrate v1 data (single "state" record) to v2 slot "default" */
export async function migrateV1(): Promise<void> {
  const db = await openDB()
  if (!db.objectStoreNames.contains('character')) return

  const old: Record<string, unknown> | undefined = await new Promise((resolve, reject) => {
    const tx = db.transaction('character', 'readonly')
    const req = tx.objectStore('character').get('state')
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })

  if (old && Object.keys(old).length > 0) {
    const slotName = (old.name as string) || 'default'
    const exists = await idbLoadSlot(slotName)
    if (!exists || !Object.keys(exists).length) {
      await idbSaveSlot(slotName, old)
      await setActiveSlot(slotName)
    }
  }

  // Clean up old store - we can't delete object stores outside onupgradeneeded,
  // so just clear the data
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction('character', 'readwrite')
    tx.objectStore('character').clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// --- Slot-based API ---

export async function idbLoadSlot(id: string): Promise<Record<string, unknown>> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('characters', 'readonly')
    const req = tx.objectStore('characters').get(id)
    req.onsuccess = () => {
      const result = req.result
      if (result) {
        const { id: _, ...data } = result
        resolve(data)
      } else {
        resolve({})
      }
    }
    req.onerror = () => reject(req.error)
  })
}

export async function idbSaveSlot(id: string, data: Record<string, unknown>): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('characters', 'readwrite')
    tx.objectStore('characters').put({ ...data, id })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbDeleteSlot(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('characters', 'readwrite')
    tx.objectStore('characters').delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function idbListSlots(): Promise<string[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('characters', 'readonly')
    const req = tx.objectStore('characters').getAllKeys()
    req.onsuccess = () => resolve(req.result as string[])
    req.onerror = () => reject(req.error)
  })
}

export async function getActiveSlot(): Promise<string> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meta', 'readonly')
    const req = tx.objectStore('meta').get('activeSlot')
    req.onsuccess = () => resolve((req.result as string) ?? '')
    req.onerror = () => reject(req.error)
  })
}

export async function setActiveSlot(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('meta', 'readwrite')
    tx.objectStore('meta').put(id, 'activeSlot')
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// --- Backwards-compatible API (delegates to active slot) ---

export async function idbLoad(): Promise<Record<string, unknown>> {
  const slot = await getActiveSlot()
  if (!slot) return {}
  return idbLoadSlot(slot)
}

export async function idbSave(data: Record<string, unknown>): Promise<void> {
  let slot = await getActiveSlot()
  if (!slot) {
    slot = (data.name as string) || 'default'
    await setActiveSlot(slot)
  }
  return idbSaveSlot(slot, data)
}

export async function idbClear(): Promise<void> {
  const slot = await getActiveSlot()
  if (slot) await idbDeleteSlot(slot)
}
