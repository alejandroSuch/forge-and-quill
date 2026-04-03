<script setup lang="ts">
import { useCharacterStore } from '../stores/character'
import { titles as allTitles } from '../data/titles'

defineEmits<{ close: [] }>()

const store = useCharacterStore()

function hasTitle(t: string): boolean {
  return store.titles.includes(t)
}

function toggle(t: string) {
  const idx = store.titles.indexOf(t)
  if (idx >= 0) {
    store.titles.splice(idx, 1)
  } else {
    store.titles.push(t)
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')">
    <div class="bg-vulcan-800 rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-heading text-gold-400 text-lg">Titulos ({{ store.titles.length }})</h2>
        <button @click="$emit('close')" class="text-parchment/50 text-xl px-2">&times;</button>
      </div>

      <div class="grid grid-cols-1 gap-1.5">
        <button
          v-for="t in allTitles" :key="t"
          @click="toggle(t)"
          class="text-left rounded-lg px-3 py-2 text-sm transition-colors"
          :class="hasTitle(t) ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40' : 'bg-vulcan-700 text-parchment/60'"
        >
          {{ t }}
        </button>
      </div>
    </div>
  </div>
</template>
