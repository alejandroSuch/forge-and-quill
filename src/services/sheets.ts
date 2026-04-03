const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY ?? ''
const BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

export interface SheetCharacter {
  name: string
  god: string
  companion: string
  book: number
  charm: number
  grace: number
  ingenuity: number
  strength: number
  blessings: number
  wounded: boolean
  glory: number
  scars: number
  money: number
  location: number
}

export interface SheetPossession {
  name: string
  charm: number
  grace: number
  ingenuity: number
  strength: number
}

function url(sheetId: string, path: string, params: Record<string, string> = {}) {
  const p = new URLSearchParams({ key: API_KEY, ...params })
  return `${BASE}/${sheetId}${path}?${p}`
}

async function fetchSheet(sheetId: string, range: string): Promise<string[][]> {
  const res = await fetch(url(sheetId, `/values/${encodeURIComponent(range)}`))
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.values ?? []
}

async function writeSheet(sheetId: string, range: string, values: string[][]) {
  const res = await fetch(
    url(sheetId, `/values/${encodeURIComponent(range)}`, { valueInputOption: 'RAW' }),
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    },
  )
  if (!res.ok) throw new Error(`Sheets API write ${res.status}: ${await res.text()}`)
}

async function clearSheet(sheetId: string, range: string) {
  const res = await fetch(url(sheetId, `/values/${encodeURIComponent(range)}:clear`), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Sheets API clear ${res.status}: ${await res.text()}`)
}

// Ensure all 6 tabs exist
async function ensureTabs(sheetId: string) {
  const meta = await fetch(url(sheetId, ''))
  if (!meta.ok) throw new Error(`Cannot access sheet: ${meta.status}`)
  const data = await meta.json()
  const existing = new Set((data.sheets ?? []).map((s: { properties: { title: string } }) => s.properties.title))
  const needed = ['Character', 'Possessions', 'Codewords', 'Titles', 'Ticks', 'Notes']
  const missing = needed.filter(t => !existing.has(t))

  if (missing.length > 0) {
    const requests = missing.map(title => ({ addSheet: { properties: { title } } }))
    const res = await fetch(url(sheetId, ':batchUpdate'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests }),
    })
    if (!res.ok) throw new Error(`Cannot create tabs: ${res.status}`)
  }
}

export async function readCharacter(sheetId: string): Promise<SheetCharacter | null> {
  const rows = await fetchSheet(sheetId, 'Character!A1:B14')
  if (rows.length < 14) return null
  const get = (i: number) => rows[i]?.[1] ?? ''
  return {
    name: get(0),
    god: get(1),
    companion: get(2),
    book: Number(get(3)) || 1,
    charm: Number(get(4)) || 0,
    grace: Number(get(5)) || 0,
    ingenuity: Number(get(6)) || 0,
    strength: Number(get(7)) || 0,
    blessings: Number(get(8)) || 0,
    wounded: get(9) === 'TRUE',
    glory: Number(get(10)) || 0,
    scars: Number(get(11)) || 0,
    money: Number(get(12)) || 0,
    location: Number(get(13)) || 0,
  }
}

export async function writeCharacter(sheetId: string, c: SheetCharacter) {
  const values = [
    ['name', c.name],
    ['god', c.god],
    ['companion', c.companion],
    ['book', String(c.book)],
    ['charm', String(c.charm)],
    ['grace', String(c.grace)],
    ['ingenuity', String(c.ingenuity)],
    ['strength', String(c.strength)],
    ['blessings', String(c.blessings)],
    ['wounded', c.wounded ? 'TRUE' : 'FALSE'],
    ['glory', String(c.glory)],
    ['scars', String(c.scars)],
    ['money', String(c.money)],
    ['location', String(c.location)],
  ]
  await writeSheet(sheetId, 'Character!A1:B14', values)
}

export async function readPossessions(sheetId: string): Promise<SheetPossession[]> {
  const rows = await fetchSheet(sheetId, 'Possessions!A1:E20')
  return rows.map(r => ({
    name: r[0] ?? '',
    charm: Number(r[1]) || 0,
    grace: Number(r[2]) || 0,
    ingenuity: Number(r[3]) || 0,
    strength: Number(r[4]) || 0,
  })).filter(p => p.name)
}

export async function writePossessions(sheetId: string, items: SheetPossession[]) {
  await clearSheet(sheetId, 'Possessions!A1:E20')
  if (items.length === 0) return
  const values = items.map(p => [p.name, String(p.charm), String(p.grace), String(p.ingenuity), String(p.strength)])
  await writeSheet(sheetId, `Possessions!A1:E${items.length}`, values)
}

export async function readCodewords(sheetId: string): Promise<{ book: number; code: string }[]> {
  const rows = await fetchSheet(sheetId, 'Codewords!A1:B500')
  return rows.map(r => ({ book: Number(r[0]) || 1, code: r[1] ?? '' })).filter(c => c.code)
}

export async function writeCodewords(sheetId: string, cws: { book: number; code: string }[]) {
  await clearSheet(sheetId, 'Codewords!A1:B500')
  if (cws.length === 0) return
  const values = cws.map(c => [String(c.book), c.code])
  await writeSheet(sheetId, `Codewords!A1:B${cws.length}`, values)
}

export async function readTitles(sheetId: string): Promise<string[]> {
  const rows = await fetchSheet(sheetId, 'Titles!A1:A50')
  return rows.map(r => r[0]).filter(Boolean)
}

export async function writeTitles(sheetId: string, ts: string[]) {
  await clearSheet(sheetId, 'Titles!A1:A50')
  if (ts.length === 0) return
  await writeSheet(sheetId, `Titles!A1:A${ts.length}`, ts.map(t => [t]))
}

export async function readNotes(sheetId: string): Promise<string[]> {
  const rows = await fetchSheet(sheetId, 'Notes!A1:A200')
  return rows.map(r => r[0]).filter(Boolean)
}

export async function writeNotes(sheetId: string, ns: string[]) {
  await clearSheet(sheetId, 'Notes!A1:A200')
  if (ns.length === 0) return
  await writeSheet(sheetId, `Notes!A1:A${ns.length}`, ns.map(n => [n]))
}

export async function readTicks(sheetId: string): Promise<{ book: number; page: number; ticks: boolean[] }[]> {
  const rows = await fetchSheet(sheetId, 'Ticks!A1:L500')
  return rows.map(r => ({
    book: Number(r[0]) || 1,
    page: Number(r[1]) || 0,
    ticks: r.slice(2).map(v => v === 'TRUE'),
  })).filter(t => t.page > 0)
}

export async function writeTicks(sheetId: string, ts: { book: number; page: number; ticks: boolean[] }[]) {
  await clearSheet(sheetId, 'Ticks!A1:L500')
  if (ts.length === 0) return
  const values = ts.map(t => [String(t.book), String(t.page), ...t.ticks.map(v => v ? 'TRUE' : 'FALSE')])
  const maxCols = Math.max(...values.map(r => r.length))
  const endCol = String.fromCharCode(64 + maxCols)
  await writeSheet(sheetId, `Ticks!A1:${endCol}${ts.length}`, values)
}

export { ensureTabs }
