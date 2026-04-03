import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { God } from '../data/gods'
import type { Companion } from '../data/companions'

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

const STORAGE_KEY = 'vv-character'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return fallback
}

export const useCharacterStore = defineStore('character', () => {
  const saved = loadFromStorage(STORAGE_KEY, {} as Record<string, unknown>)

  const name = ref<string>((saved.name as string) ?? '')
  const god = ref<God>((saved.god as God) ?? '')
  const companion = ref<Companion>((saved.companion as Companion) ?? '')
  const book = ref<number>((saved.book as number) ?? 1)

  const charm = ref<number>((saved.charm as number) ?? 0)
  const grace = ref<number>((saved.grace as number) ?? 0)
  const ingenuity = ref<number>((saved.ingenuity as number) ?? 0)
  const strength = ref<number>((saved.strength as number) ?? 0)

  const blessings = ref<number>((saved.blessings as number) ?? 0)
  const wounded = ref<boolean>((saved.wounded as boolean) ?? false)
  const glory = ref<number>((saved.glory as number) ?? 0)
  const scars = ref<number>((saved.scars as number) ?? 0)
  const money = ref<number>((saved.money as number) ?? 0)
  const location = ref<number>((saved.location as number) ?? 0)

  const possessions = ref<Possession[]>((saved.possessions as Possession[]) ?? [])
  const titles = ref<string[]>((saved.titles as string[]) ?? [])
  const codewords = ref<Codeword[]>((saved.codewords as Codeword[]) ?? [])
  const notes = ref<string[]>((saved.notes as string[]) ?? [])
  const ticks = ref<TickEntry[]>((saved.ticks as TickEntry[]) ?? [])

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

  function toJSON() {
    return {
      name: name.value, god: god.value, companion: companion.value, book: book.value,
      charm: charm.value, grace: grace.value, ingenuity: ingenuity.value, strength: strength.value,
      blessings: blessings.value, wounded: wounded.value, glory: glory.value, scars: scars.value,
      money: money.value, location: location.value,
      possessions: possessions.value, titles: titles.value, codewords: codewords.value,
      notes: notes.value, ticks: ticks.value,
    }
  }

  // Auto-persist to localStorage
  watch(toJSON, (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  function reset() {
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
  }

  return {
    name, god, companion, book,
    charm, grace, ingenuity, strength,
    blessings, wounded, glory, scars, money, location,
    possessions, titles, codewords, notes, ticks,
    modifiers, woundPenalty, effective,
    toJSON, reset,
  }
})
