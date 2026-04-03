# PRD: VulcanVerse Companion App

## 1. Overview

Progressive Web App (PWA) that serves as a digital adventure sheet for the VulcanVerse gamebook saga (5 books by Jamie Thomson and Dave Morris). Replaces the paper character sheet with a persistent, cloud-synced experience backed by Google Sheets.

**Target URL:** `https://<app>.github.io/?id=<GOOGLE_SHEET_ID>`

**Core premise:** zero friction. Open the link, play. No accounts, no sign-ups, no server.

## 2. Problem

Playing VulcanVerse with a paper adventure sheet is cumbersome: erasing, tracking codewords across 5 books, calculating modifiers, managing 20+ possessions. The existing [vulcanversejs](https://daelsepara.github.io/vulcanversejs/) app solves part of this but uses local JSON files for save/load (easy to lose), has no cloud sync, and no offline-first behavior.

## 3. Goals

| Goal | Metric |
|---|---|
| Zero-lag UI | All writes feel instant (optimistic updates) |
| Never lose data | Google Sheet as durable backend, auto-sync |
| Works offline | Full PWA with service worker, syncs when back online |
| Shareable | A single URL `?id=SHEET_ID` is your entire game state |
| Mobile-first | Playable one-handed on a phone while holding a book |

## 4. User Flow

### 4.1 First Visit (no `?id` parameter)

1. App loads empty. Shows onboarding screen.
2. Prompt: "Introduce tu codigo de aventura" (the Google Sheet ID or full URL).
3. User pastes the Sheet ID or URL. App extracts the ID.
4. ID is stored in `localStorage`. URL updates to `?id=SHEET_ID`.
5. App reads the Sheet. If empty, initializes with default adventure sheet structure.

### 4.2 Return Visit (has `?id` parameter)

1. App loads. Reads `?id` from URL.
2. Immediately renders from `localStorage` cache (instant).
3. Background fetch from Google Sheet. Merges any differences (Sheet wins on conflict).
4. Ready to play.

### 4.3 Changing Sheet

- Settings menu: "Cambiar hoja de aventura". Clears local cache, prompts for new ID.

## 5. Data Model

Based on the original vulcanversejs app. The Google Sheet stores one character per sheet (tab).

### 5.1 Character Sheet Fields

```
name: string                    # Character name
god: enum                       # Patron deity (see 5.3)
companion: enum                 # Travel companion (see 5.4)
book: number (1-5)              # Current book being played

# Attributes (score range: -2 to 5)
attributes:
  charm: number
  grace: number
  ingenuity: number
  strength: number

# Derived: modifier per attribute = max bonus from possessed items (read-only)
# Derived: effective score = base + modifier - 1 if wounded

blessings: number (0-3)         # Single-use rerolls on failed checks
wounded: boolean                # -1 to all attribute rolls when true
glory: number (min 0)           # Accumulated glory points
scars: number (min 0)           # Permanent scars
money: number (min 0)           # Pyr (in-game currency)
location: number                # Current section number

# Collections
possessions: [                  # Max 20 items
  {
    name: string,
    charm: number (-5..5),      # Attribute modifier (optional)
    grace: number (-5..5),
    ingenuity: number (-5..5),
    strength: number (-5..5)
  }
]

titles: string[]                # Earned titles (from predefined list)
codewords: [                    # Per-book codeword tracking
  { book: number, code: string }
]
notes: string[]                 # Free-form notes
ticks: [                        # Section tick boxes (per book/page)
  { book: number, page: number, ticks: boolean[] }
]
storage: []                     # Reserved for future use
```

### 5.2 Predefined Codewords (per book)

Each book uses codewords starting with a specific letter:

| Book | Letter | Count | Examples |
|---|---|---|---|
| 1. The Houses of the Dead | N | 43 | Nadir, Nemesis, Nimbus, Noble |
| 2. The Hammer of the Sun | O | 25 | Oasis, Omen, Ostrich, Ozone |
| 3. The Wild Woods | P | 58 | Panacea, Passion, Pledged, Pure |
| 4. The Pillars of the Sky | Q | 25 | Quaff, Quake, Quest, Quorum |
| 5. Workshop of the Gods | R | 50 | Radiant, Regal, Requiem, Rune |

Full lists are in the reference app's `book-data.js`.

### 5.3 Gods (patron deities)

Aphrodite, Apollo, Ares, Artemis, Athena, Demeter, Hades, Hera, Hermes, Nemesis, Orion, Poseidon, Tethys, Vulcan, Zeus.

### 5.4 Companions

Chipos, Galatea, Loutro, Magnes, Polymnia, Tomyios.

### 5.5 Titles

43 predefined titles (e.g., "Giant Slayer", "Friend of the Ferryman", "Saviour of Iskandria"). Full list in `book-data.js`.

## 6. Google Sheets Backend

### 6.1 Why Google Sheets

- Zero cost, zero ops.
- User owns their data (it's their Sheet).
- Shareable: give someone the Sheet ID and they see your character.
- Google Sheets API is free for read/write at gamebook-companion scale.

### 6.2 Sheet Structure

One Google Sheet per player. The Sheet contains these tabs (worksheets):

#### Tab: `Character`

| Row | A (Field) | B (Value) |
|---|---|---|
| 1 | name | (string) |
| 2 | god | (string) |
| 3 | companion | (string) |
| 4 | book | (number) |
| 5 | charm | (number) |
| 6 | grace | (number) |
| 7 | ingenuity | (number) |
| 8 | strength | (number) |
| 9 | blessings | (number) |
| 10 | wounded | (TRUE/FALSE) |
| 11 | glory | (number) |
| 12 | scars | (number) |
| 13 | money | (number) |
| 14 | location | (number) |

#### Tab: `Possessions`

| A (Name) | B (Charm) | C (Grace) | D (Ingenuity) | E (Strength) |
|---|---|---|---|---|
| Bronze sword | 0 | 0 | 0 | 2 |
| Silver tongue amulet | 1 | 0 | 0 | 0 |

Max 20 rows.

#### Tab: `Codewords`

| A (Book) | B (Codeword) |
|---|---|
| 1 | Nemesis |
| 3 | Passion |

One row per acquired codeword.

#### Tab: `Titles`

| A (Title) |
|---|
| Giant Slayer |
| Friend of the Ferryman |

#### Tab: `Ticks`

| A (Book) | B (Page) | C (Tick1) | D (Tick2) | ... |
|---|---|---|---|---|
| 1 | 11 | TRUE | FALSE | FALSE | TRUE |
| 2 | 350 | TRUE | TRUE | TRUE | FALSE | FALSE |

Variable number of tick columns per row (max 10).

#### Tab: `Notes`

| A (Note) |
|---|
| Met the ferryman at section 234 |
| Need to return to the temple |

### 6.3 Sheet Setup Document

A separate document (`docs/SHEET_SETUP.md`) will contain:

1. Step-by-step instructions to create the Google Sheet from a template.
2. How to make the Sheet publicly readable (or use an API key).
3. How to create a Google Cloud project with Sheets API enabled.
4. How to generate an API key (restricted to Sheets API + your domain).
5. Alternative: use a "published" Sheet for read-only + Google Forms for writes (no API key needed).

### 6.4 Authentication Strategy

**Option A (recommended): API Key + Public Sheet**
- User makes their Sheet "Anyone with the link can edit".
- App uses a single API key (restricted to the GitHub Pages domain).
- Simplest UX. No OAuth flow.

**Option B: OAuth (future)**
- For users who want their Sheet private.
- OAuth 2.0 with Google sign-in.
- Out of scope for v1.

## 7. Optimistic Storage Architecture

```
  [UI State]
      |
      v
  [localStorage]  <-- source of truth for rendering
      |
      v (debounced, 2s after last change)
  [Google Sheets API]  <-- durable storage
      |
      v (on load)
  [localStorage]  <-- hydrated from Sheet on startup
```

### 7.1 Write Path

1. User changes a field (e.g., money from 10 to 15).
2. `localStorage` updates immediately. UI reflects the change.
3. A debounced sync (2s) batches all pending changes.
4. Batch write to Google Sheets API (`values.batchUpdate`).
5. On success: clear pending queue.
6. On failure: retry with exponential backoff (3 attempts). Show subtle "sync pending" indicator.

### 7.2 Read Path

1. On app load: render from `localStorage` immediately.
2. Background fetch from Sheet.
3. If Sheet data is newer (compare `lastModified` field): update `localStorage` + UI.
4. If Sheet is empty: push `localStorage` to Sheet (first sync).

### 7.3 Conflict Resolution

Simple last-write-wins. This is a single-player companion app. Conflicts only happen if the same player uses two devices simultaneously, which is unlikely.

### 7.4 Offline Behavior

- Service worker caches all app assets.
- All reads/writes go through `localStorage`.
- Sync queue persists in `localStorage`.
- When back online: flush queue to Sheet.
- Visual indicator: green dot (synced), yellow dot (pending), red dot (offline).

## 8. Features

### 8.1 v1 (MVP)

| Feature | Description |
|---|---|
| **Adventure sheet** | Full character sheet with all fields from section 5.1 |
| **Attribute modifiers** | Auto-calculated from equipped possessions (highest bonus per attribute) |
| **Wound penalty** | Visual indicator, auto-applied -1 to displayed effective scores |
| **Possessions** | Add/edit/remove items with attribute modifiers. Max 20, counter shown |
| **Codewords** | Checkbox grid per book. Organized by book tabs |
| **Tick boxes** | Per-section tick tracking. Section selector per book |
| **Titles** | Add from predefined list, remove |
| **Notes** | Free-form text notes, add/remove |
| **Maps** | Zoomable/pannable maps per book (5 region maps) |
| **Dice roller** | 2d6 roller with attribute + modifier + wound calculation. Shows pass/fail against a target number. Auto-handles double 1 (always fail) and double 6 (always success) |
| **Blessing spend** | Button on dice roll fail to spend a blessing and reroll |
| **Google Sheet sync** | Read/write as described in section 7 |
| **PWA** | Installable, offline-capable, service worker |
| **Onboarding** | Sheet ID input flow (section 4.1) |
| **Book selector** | Switch between books 1-5, updates map/codewords/ticks |

### 8.2 v2 (Future)

| Feature | Description |
|---|---|
| **OAuth** | Private Sheets support |
| **Multi-character** | Multiple tabs in same Sheet for different characters |
| **Quest log** | Structured quest tracker (from notes) |
| **Section bookmark** | Quick-save current book + section for resuming |
| **Import/export JSON** | Compatibility with vulcanversejs save files |
| **Dark mode** | Theme toggle |
| **Localization** | EN/ES at minimum |

## 9. Technical Architecture

### 9.1 Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Vue 3 (Composition API) | Matches reference app. Lightweight. |
| Build | Vite | Fast builds, good PWA plugin ecosystem |
| PWA | vite-plugin-pwa (Workbox) | Service worker generation, precaching |
| CSS | Tailwind CSS | Utility-first, mobile-first, small bundle |
| State | Pinia | Vue 3 native, simple, supports plugins for localStorage sync |
| Sheets API | Google Sheets API v4 (REST) | Direct fetch calls, no SDK needed |
| Hosting | GitHub Pages | Free, fits the `?id=` URL pattern |
| Maps | CSS transform + touch events | Same approach as reference app (draggable image) |

### 9.2 Project Structure

```
vv/
  docs/                     # PRD, Sheet setup guide
  public/
    images/                 # Maps (5 region maps + Vulcan City)
    icons/                  # PWA icons
  src/
    App.vue
    main.ts
    router.ts
    stores/
      character.ts          # Pinia store, localStorage plugin
      sync.ts               # Google Sheets sync logic
    composables/
      useDiceRoller.ts
      useSheetSync.ts
    components/
      CharacterSheet.vue
      AttributeRow.vue
      PossessionsModal.vue
      CodewordsPanel.vue
      TicksPanel.vue
      TitlesModal.vue
      NotesModal.vue
      MapViewer.vue
      DiceRoller.vue
      SyncIndicator.vue
      OnboardingScreen.vue
    data/
      books.ts              # Book titles, page counts, maps
      codewords.ts           # All codewords per book
      ticks.ts               # Tick definitions per book/page
      titles.ts              # Predefined title list
      gods.ts                # God list
      companions.ts          # Companion list
    services/
      sheets.ts              # Google Sheets API client
      storage.ts             # localStorage wrapper
    sw.ts                    # Service worker config
  index.html
  vite.config.ts
  tailwind.config.ts
```

### 9.3 Key Implementation Details

**Attribute modifier calculation:** For each attribute, take the maximum positive modifier from all possessions (not the sum). This matches the reference app's behavior.

**Tick box data:** Hardcoded per book. Each book has a list of sections that have tick boxes, with the number of ticks per section. This data comes from `book-data.js` in the reference app. Total: ~400 sections across 5 books.

**Section pages:** Book 1 has 832 sections, Book 2 has 1706, Book 3 has 834, Book 4 has 1076, Book 5 has 1667.

**Debounced sync:** Use `watchEffect` on the Pinia store. Debounce 2s. Batch all dirty fields into a single Sheets API call.

## 10. UI/UX

### 10.1 Layout (mobile-first)

```
+----------------------------------+
|  [Book: 2 v]  Hammer of the Sun  |
+----------------------------------+
|  Name: ___________  God: [___v]  |
|  Companion: [___v]  Location: __ |
+----------------------------------+
|  CHARM    [-2] +0  = -2          |
|  GRACE    [ 1] +1  = +2          |
|  INGENUITY[ 0] +0  =  0          |
|  STRENGTH [ 2] +2  = +4          |
+----------------------------------+
|  Blessings: [**.]   Wounded: [ ] |
|  Glory: 5   Scars: 1   Money: 42 |
+----------------------------------+
|  [Possessions 3/20] [Codewords]  |
|  [Titles]  [Ticks]  [Notes]      |
|  [Map]     [Dice]                |
+----------------------------------+
|  [=synced]                        |
+----------------------------------+
```

### 10.2 Design Principles

- **One-hand use.** Primary actions reachable by thumb.
- **Minimal modals.** Use slide-up panels instead of full modals where possible.
- **VulcanVerse aesthetic.** Warm palette (oranges, golds, dark backgrounds). Serif font for headings (Marcellus or similar). Parchment texture subtle background.
- **Big touch targets.** Checkboxes and buttons min 44x44px.

### 10.3 Sync Indicator

Bottom-right corner, always visible:
- Green circle: synced.
- Yellow circle + spinner: syncing.
- Red circle: offline or error. Tap for details.

## 11. Google Sheet Setup Guide

Delivered as `docs/SHEET_SETUP.md`. Contents:

1. **Create a Google Sheet** from the provided template link (we publish a template Sheet that users can copy).
2. **Share settings:** "Anyone with the link" > "Editor".
3. **Copy the Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/{THIS_PART}/edit`.
4. **Open the app** and paste the ID when prompted.
5. Done.

The app's first sync will populate the Sheet tabs if they don't exist (via Sheets API `batchUpdate` to create tabs and write headers).

### 11.1 Template Sheet Structure

We provide a public Google Sheet template with:
- All 6 tabs pre-created with headers.
- Example character data (can be cleared).
- Data validation on key fields (god dropdown, companion dropdown, attribute ranges).
- Conditional formatting: wounded row turns red when TRUE.

## 12. Non-Goals (v1)

- No user accounts or authentication beyond Sheet access.
- No multiplayer or shared character sheets.
- No game content (section text). This is a companion, not the gamebook itself.
- No rules enforcement (e.g., the app won't prevent carrying 21 items, just warns).
- No PDF/print export.

## 13. Risks

| Risk | Mitigation |
|---|---|
| Google Sheets API rate limits (100 req/min default) | Debounced writes, batch operations. A single player will never hit this. |
| User loses Sheet access | Data also in localStorage. Export to JSON as fallback. |
| Sheet structure corrupted by manual edit | Validation on read. Auto-repair headers if missing. |
| API key abuse | Restrict key to GitHub Pages domain + Sheets API only. |
| Large tick data (400+ sections) | Only sync ticks that have been modified (dirty tracking). |

## 14. Milestones

| Phase | Scope | Estimate |
|---|---|---|
| 1 | Project setup, character sheet UI (all fields), localStorage persistence | |
| 2 | Google Sheets integration (read/write/sync), onboarding flow | |
| 3 | Codewords, ticks, possessions, titles, notes modals | |
| 4 | Maps, dice roller, blessing mechanics | |
| 5 | PWA (service worker, manifest, installability), offline sync queue | |
| 6 | Sheet setup template + docs, polish, deploy to GitHub Pages | |
