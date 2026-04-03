<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '../stores/character'
import { codewords } from '../data/codewords'
import { books } from '../data/books'

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useCharacterStore()

const bookCodes = computed(() => codewords[store.book] ?? [])

function isActive(code: string): boolean {
  return store.codewords.some(c => c.book === store.book && c.code === code)
}

function toggle(code: string) {
  const idx = store.codewords.findIndex(c => c.book === store.book && c.code === code)
  if (idx >= 0) {
    store.codewords.splice(idx, 1)
  } else {
    store.codewords.push({ book: store.book, code })
  }
}

const activeCount = computed(() => store.codewords.filter(c => c.book === store.book).length)
const currentBookTitle = computed(() => books.find(b => b.number === store.book)?.title ?? '')
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div class="bg-surface rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4">
      <div class="flex justify-between items-center mb-1">
        <h2 class="font-heading text-accent text-lg">{{ t('codewords.title') }}</h2>
        <button @click="$emit('close')" class="text-muted text-xl px-2">&times;</button>
      </div>
      <p class="text-muted text-xs mb-3">{{ t('codewords.book_info', { n: store.book, title: currentBookTitle, active: activeCount, total: bookCodes.length }) }}</p>

      <div class="flex gap-1 mb-3 overflow-x-auto">
        <button
          v-for="b in books" :key="b.number"
          @click="store.book = b.number"
          class="px-3 py-1 rounded text-xs shrink-0"
          :class="store.book === b.number ? 'bg-accent text-on-accent' : 'bg-surface-alt text-muted'"
        >
          {{ b.number }}
        </button>
      </div>

      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="code in bookCodes" :key="code"
          @click="toggle(code)"
          class="text-left rounded-lg px-3 py-2 text-sm transition-colors"
          :class="isActive(code) ? 'bg-accent-subtle text-accent border border-accent/40' : 'bg-surface-alt text-muted'"
        >
          {{ code }}
        </button>
      </div>
    </div>
  </div>
</template>
