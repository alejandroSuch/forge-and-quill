<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '../stores/character'
import { codewords } from '../data/codewords'
import { books } from '../data/books'
import { useSwipeDown } from '../composables/useSwipeDown'

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useCharacterStore()
const panelRef = ref<HTMLElement | null>(null)
const { translateY, dragging } = useSwipeDown(panelRef, () => emit('close'))

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
    <div
      ref="panelRef"
      class="bg-surface rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4"
      :style="{ transform: translateY > 0 ? `translateY(${translateY}px)` : '', transition: dragging ? 'none' : '' }"
    >
      <div class="flex justify-center mb-2"><div class="w-10 h-1 rounded-full bg-border"></div></div>
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

      <p v-if="bookCodes.length === 0" class="text-muted text-sm text-center py-6">
        {{ t('codewords.empty') }}
      </p>

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
