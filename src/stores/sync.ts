import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useCharacterStore } from './character'
import * as sheets from '../services/sheets'
import { lsGetSheetId, lsSetSheetId, lsClearSheetId } from '../services/storage'

export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'offline' | 'error'

export const useSyncStore = defineStore('sync', () => {
  const sheetId = ref(lsGetSheetId())
  const status = ref<SyncStatus>(sheetId.value ? 'pending' : 'offline')
  const errorMsg = ref('')
  let syncTimer: ReturnType<typeof setTimeout> | null = null
  let retries = 0

  function setSheetId(id: string) {
    const extracted = extractSheetId(id)
    sheetId.value = extracted
    lsSetSheetId(extracted)
    // Also update URL
    const url = new URL(window.location.href)
    url.searchParams.set('id', extracted)
    window.history.replaceState({}, '', url.toString())
  }

  function clearSheetId() {
    sheetId.value = ''
    lsClearSheetId()
    status.value = 'offline'
    const url = new URL(window.location.href)
    url.searchParams.delete('id')
    window.history.replaceState({}, '', url.toString())
  }

  function extractSheetId(input: string): string {
    input = input.trim()
    // Full Google Sheets URL
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return match[1]
    // Raw ID
    return input
  }

  async function initialSync() {
    if (!sheetId.value) return
    const char = useCharacterStore()
    status.value = 'syncing'
    try {
      await sheets.ensureTabs(sheetId.value)
      const remote = await sheets.readCharacter(sheetId.value)
      if (remote && remote.name) {
        // Sheet has data: hydrate local
        char.name = remote.name
        char.god = remote.god as typeof char.god
        char.companion = remote.companion as typeof char.companion
        char.book = remote.book
        char.charm = remote.charm
        char.grace = remote.grace
        char.ingenuity = remote.ingenuity
        char.strength = remote.strength
        char.blessings = remote.blessings
        char.wounded = remote.wounded
        char.glory = remote.glory
        char.scars = remote.scars
        char.money = remote.money
        char.location = remote.location

        const [poss, cws, titles, notes, ticks] = await Promise.all([
          sheets.readPossessions(sheetId.value),
          sheets.readCodewords(sheetId.value),
          sheets.readTitles(sheetId.value),
          sheets.readNotes(sheetId.value),
          sheets.readTicks(sheetId.value),
        ])
        char.possessions = poss
        char.codewords = cws
        char.titles = titles
        char.notes = notes
        char.ticks = ticks
      } else {
        // Sheet is empty: push local data
        await pushAll()
      }
      status.value = 'synced'
      retries = 0
    } catch (e) {
      console.error('Initial sync failed:', e)
      status.value = 'error'
      errorMsg.value = String(e)
    }
  }

  async function pushAll() {
    const char = useCharacterStore()
    const id = sheetId.value
    if (!id) return

    await sheets.writeCharacter(id, {
      name: char.name, god: char.god, companion: char.companion, book: char.book,
      charm: char.charm, grace: char.grace, ingenuity: char.ingenuity, strength: char.strength,
      blessings: char.blessings, wounded: char.wounded, glory: char.glory, scars: char.scars,
      money: char.money, location: char.location,
    })
    await Promise.all([
      sheets.writePossessions(id, char.possessions),
      sheets.writeCodewords(id, char.codewords),
      sheets.writeTitles(id, char.titles),
      sheets.writeNotes(id, char.notes),
      sheets.writeTicks(id, char.ticks),
    ])
  }

  function schedulePush() {
    if (!sheetId.value) return
    if (syncTimer) clearTimeout(syncTimer)
    status.value = 'pending'
    syncTimer = setTimeout(async () => {
      status.value = 'syncing'
      try {
        await pushAll()
        status.value = 'synced'
        retries = 0
      } catch (e) {
        retries++
        if (retries <= 3) {
          const delay = 2000 * Math.pow(2, retries)
          syncTimer = setTimeout(() => schedulePush(), delay)
          status.value = 'pending'
        } else {
          status.value = 'error'
          errorMsg.value = String(e)
        }
      }
    }, 2000)
  }

  // Watch character store changes and auto-sync
  function startWatching() {
    const char = useCharacterStore()
    watch(() => char.toJSON(), () => {
      schedulePush()
    }, { deep: true })

    // Online/offline detection
    window.addEventListener('online', () => {
      if (status.value === 'offline') {
        schedulePush()
      }
    })
    window.addEventListener('offline', () => {
      status.value = 'offline'
    })
  }

  return {
    sheetId, status, errorMsg,
    setSheetId, clearSheetId, initialSync, startWatching, pushAll,
  }
})
