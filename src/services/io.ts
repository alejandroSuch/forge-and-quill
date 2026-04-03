import type { useCharacterStore } from '../stores/character'

export function exportCharacter(data: ReturnType<ReturnType<typeof useCharacterStore>['toJSON']>) {
  const name = (data.name || 'character').replace(/\s+/g, '-').toLowerCase()
  const date = new Date().toISOString().slice(0, 10)
  const filename = `forge-and-quill-${name}-${date}.json`
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function importCharacter(
  file: File,
  store: ReturnType<typeof useCharacterStore>,
) {
  const text = await file.text()
  const data = JSON.parse(text)

  // Hydrate scalars
  if (data.name != null) store.name = data.name
  if (data.god != null) store.god = data.god
  if (data.companion != null) store.companion = data.companion
  if (data.book != null) store.book = data.book
  if (data.charm != null) store.charm = data.charm
  if (data.grace != null) store.grace = data.grace
  if (data.ingenuity != null) store.ingenuity = data.ingenuity
  if (data.strength != null) store.strength = data.strength
  if (data.blessings != null) store.blessings = data.blessings
  if (data.wounded != null) store.wounded = data.wounded
  if (data.glory != null) store.glory = data.glory
  if (data.scars != null) store.scars = data.scars
  if (data.money != null) store.money = data.money
  if (data.location != null) store.location = data.location

  // Hydrate lists
  if (Array.isArray(data.possessions)) store.possessions = data.possessions
  if (Array.isArray(data.titles)) store.titles = data.titles
  if (Array.isArray(data.codewords)) store.codewords = data.codewords
  if (Array.isArray(data.notes)) store.notes = data.notes
  if (Array.isArray(data.ticks)) store.ticks = data.ticks
}
