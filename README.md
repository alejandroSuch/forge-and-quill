# Forge & Quill

Digital adventure sheet for the [VulcanVerse](https://www.vulcanverse.com/) gamebook saga. Track your character's attributes, possessions, codewords, titles, and more.

Inspired by [daelsepara/vulcanversejs](https://github.com/daelsepara/vulcanversejs) ([live app](https://daelsepara.github.io/vulcanversejs/)). Map images sourced from that project.

## Features

- Character sheet with 4 attributes + possession modifiers
- Possessions (max 20) with stat bonuses
- Codeword and title tracking per book
- Tick box progress tracking
- Free-form notes
- Pan/zoom map viewer (5 books)
- 2d6 dice roller with blessings mechanic
- Import/export character data as JSON
- Light/dark mode
- English/Spanish (auto-detected)
- Installable PWA (works offline)

## Tech

Vue 3, Pinia, Tailwind CSS v4, TypeScript, Vite, vue-i18n, vite-plugin-pwa.

Persistence: localStorage (scalar fields) + IndexedDB (lists).

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## License

GPL-3.0. See [LICENSE](./LICENSE).

Map images from [daelsepara/vulcanversejs](https://github.com/daelsepara/vulcanversejs), also GPL-3.0.
