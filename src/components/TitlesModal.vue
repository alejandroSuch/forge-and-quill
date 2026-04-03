<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '../stores/character'
import { titles as allTitles } from '../data/titles'

defineEmits<{ close: [] }>()

const { t } = useI18n()
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
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div class="bg-surface rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-heading text-accent text-lg">{{ t('titles.title', { count: store.titles.length }) }}</h2>
        <button @click="$emit('close')" class="text-muted text-xl px-2">&times;</button>
      </div>

      <div class="grid grid-cols-1 gap-1.5">
        <button
          v-for="title in allTitles" :key="title"
          @click="toggle(title)"
          class="text-left rounded-lg px-3 py-2 text-sm transition-colors"
          :class="hasTitle(title) ? 'bg-accent-subtle text-accent border border-accent/40' : 'bg-surface-alt text-muted'"
        >
          {{ title }}
        </button>
      </div>
    </div>
  </div>
</template>
