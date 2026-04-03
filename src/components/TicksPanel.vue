<script setup lang="ts">
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'
import { ticks as tickDefs } from '../data/ticks'
import { books } from '../data/books'

defineEmits<{ close: [] }>()

const store = useCharacterStore()

const sections = computed(() => tickDefs[store.book] ?? [])

function getTickState(page: number, tickIndex: number): boolean {
  const entry = store.ticks.find(t => t.book === store.book && t.page === page)
  return entry?.ticks[tickIndex] ?? false
}

function toggleTick(page: number, tickIndex: number, totalTicks: number) {
  let entry = store.ticks.find(t => t.book === store.book && t.page === page)
  if (!entry) {
    entry = { book: store.book, page, ticks: Array(totalTicks).fill(false) }
    store.ticks.push(entry)
  }
  entry.ticks[tickIndex] = !entry.ticks[tickIndex]
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')">
    <div class="bg-vulcan-800 rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4">
      <div class="flex justify-between items-center mb-1">
        <h2 class="font-heading text-gold-400 text-lg">Tick Boxes</h2>
        <button @click="$emit('close')" class="text-parchment/50 text-xl px-2">&times;</button>
      </div>
      <p class="text-parchment/50 text-xs mb-3">Libro {{ store.book }}: {{ books.find(b => b.number === store.book)?.title }}</p>

      <!-- Book tabs -->
      <div class="flex gap-1 mb-3 overflow-x-auto">
        <button
          v-for="b in books" :key="b.number"
          @click="store.book = b.number"
          class="px-3 py-1 rounded text-xs shrink-0"
          :class="store.book === b.number ? 'bg-gold-500 text-vulcan-900' : 'bg-vulcan-700 text-parchment/70'"
        >
          {{ b.number }}
        </button>
      </div>

      <div class="space-y-2">
        <div v-for="sec in sections" :key="sec.page" class="bg-vulcan-700 rounded-lg px-3 py-2 flex items-center gap-3">
          <span class="text-parchment/70 text-sm w-16 shrink-0">§{{ sec.page }}</span>
          <div class="flex gap-1.5 flex-wrap">
            <button
              v-for="i in sec.ticks" :key="i"
              @click="toggleTick(sec.page, i - 1, sec.ticks)"
              class="w-7 h-7 rounded border-2 text-xs transition-colors"
              :class="getTickState(sec.page, i - 1) ? 'bg-gold-500 border-gold-400 text-vulcan-900' : 'bg-vulcan-900 border-vulcan-600'"
            >
              {{ getTickState(sec.page, i - 1) ? '✓' : '' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
