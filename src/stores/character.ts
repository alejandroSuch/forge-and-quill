import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { God } from '../data/gods'
import type { Companion } from '../data/companions'
import { idbLoad, idbSave, idbClear } from '../services/storage'

export interface Possession {
  name: string
  charm: number
  grace: number
  ingenuity: number
  strength: number
}

export interface TickEntry {
  book: number
  page: number
  ticks: boolean[]
}

export interface Codeword {
  book: number
  code: string
}

export const useCharacterStore = defineStore('character', () => {
  const name = ref('')
  const god = ref<God>('')
  const companion = ref<Companion>('')
  const book = ref(1)

  const charm = ref(0)
  const grace = ref(0)
  const ingenuity = ref(0)
  const strength = ref(0)

  const blessings = ref(0)
  const wounded = ref(false)
  const glory = ref(0)
  const scars = ref(0)
  const money = ref(0)
  const location = ref(0)

  const possessions = ref<Possession[]>([])
  const titles = ref<string[]>([])
  const codewords = ref<Codeword[]>([])
  const notes = ref<string[]>([])
  const ticks = ref<TickEntry[]>([])

  const hydrated = ref(false)

  async function hydrate() {
    const saved = await idbLoad()
    if (!saved || !Object.keys(saved).length) {
      hydrated.value = true
      return
    }
    name.value = (saved.name as string) ?? ''
    god.value = (saved.god as God) ?? ''
    companion.value = (saved.companion as Companion) ?? ''
    book.value = (saved.book as number) ?? 1
    charm.value = (saved.charm as number) ?? 0
    grace.value = (saved.grace as number) ?? 0
    ingenuity.value = (saved.ingenuity as number) ?? 0
    strength.value = (saved.strength as number) ?? 0
    blessings.value = (saved.blessings as number) ?? 0
    wounded.value = (saved.wounded as boolean) ?? false
    glory.value = (saved.glory as number) ?? 0
    scars.value = (saved.scars as number) ?? 0
    money.value = (saved.money as number) ?? 0
    location.value = (saved.location as number) ?? 0
    possessions.value = (saved.possessions as Possession[]) ?? []
    titles.value = (saved.titles as string[]) ?? []
    codewords.value = (saved.codewords as Codeword[]) ?? []
    notes.value = (saved.notes as string[]) ?? []
    ticks.value = (saved.ticks as TickEntry[]) ?? []
    hydrated.value = true
  }

  // Attribute modifiers: max bonus from possessions per attribute
  const modifiers = computed(() => {
    const mods = { charm: 0, grace: 0, ingenuity: 0, strength: 0 }
    for (const p of possessions.value) {
      if (p.charm > mods.charm) mods.charm = p.charm
      if (p.grace > mods.grace) mods.grace = p.grace
      if (p.ingenuity > mods.ingenuity) mods.ingenuity = p.ingenuity
      if (p.strength > mods.strength) mods.strength = p.strength
    }
    return mods
  })

  const woundPenalty = computed(() => (wounded.value ? 1 : 0))

  const effective = computed(() => ({
    charm: charm.value + modifiers.value.charm - woundPenalty.value,
    grace: grace.value + modifiers.value.grace - woundPenalty.value,
    ingenuity: ingenuity.value + modifiers.value.ingenuity - woundPenalty.value,
    strength: strength.value + modifiers.value.strength - woundPenalty.value,
  }))

  const snapshot = computed(() => ({
    name: name.value, god: god.value, companion: companion.value, book: book.value,
    charm: charm.value, grace: grace.value, ingenuity: ingenuity.value, strength: strength.value,
    blessings: blessings.value, wounded: wounded.value, glory: glory.value, scars: scars.value,
    money: money.value, location: location.value,
    possessions: possessions.value, titles: titles.value, codewords: codewords.value,
    notes: notes.value, ticks: ticks.value,
  }))

  function toJSON() {
    return snapshot.value
  }

  // Auto-persist everything to IndexedDB (debounced)
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  function scheduleSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => idbSave(toJSON()), 300)
  }

  watch(snapshot, () => {
    if (hydrated.value) scheduleSave()
  }, { deep: true })

  async function reset() {
    name.value = ''
    god.value = ''
    companion.value = ''
    book.value = 1
    charm.value = 0
    grace.value = 0
    ingenuity.value = 0
    strength.value = 0
    blessings.value = 0
    wounded.value = false
    glory.value = 0
    scars.value = 0
    money.value = 0
    location.value = 0
    possessions.value = []
    titles.value = []
    codewords.value = []
    notes.value = []
    ticks.value = []
    await idbClear()
  }

  return {
    name, god, companion, book,
    charm, grace, ingenuity, strength,
    blessings, wounded, glory, scars, money, location,
    possessions, titles, codewords, notes, ticks,
    modifiers, woundPenalty, effective,
    toJSON, reset, hydrate, hydrated,
  }
})
