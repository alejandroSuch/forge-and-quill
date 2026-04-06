<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '../stores/character'
import { ticks as tickDefs } from '../data/ticks'
import { books } from '../data/books'
import { useSwipeDown } from '../composables/useSwipeDown'

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useCharacterStore()
const panelRef = ref<HTMLElement | null>(null)
const { translateY, dragging } = useSwipeDown(panelRef, () => emit('close'))

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
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div
      ref="panelRef"
      class="bg-surface rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4"
      :style="{ transform: translateY > 0 ? `translateY(${translateY}px)` : '', transition: dragging ? 'none' : '' }"
    >
      <div class="flex justify-center mb-2"><div class="w-10 h-1 rounded-full bg-border"></div></div>
      <div class="flex justify-between items-center mb-1">
        <h2 class="font-heading text-accent text-lg">{{ t('ticks.title') }}</h2>
        <button @click="$emit('close')" class="text-muted text-xl px-2">&times;</button>
      </div>
      <p class="text-muted text-xs mb-3">{{ t('ticks.book_info', { n: store.book, title: books.find(b => b.number === store.book)?.title }) }}</p>

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

      <p v-if="sections.length === 0" class="text-muted text-sm text-center py-6">
        {{ t('ticks.empty') }}
      </p>

      <div class="space-y-2">
        <div v-for="sec in sections" :key="sec.page" class="bg-surface-alt rounded-lg px-3 py-2 flex items-center gap-3">
          <span class="text-muted text-sm w-16 shrink-0">§{{ sec.page }}</span>
          <div class="flex gap-1.5 flex-wrap">
            <button
              v-for="i in sec.ticks" :key="i"
              @click="toggleTick(sec.page, i - 1, sec.ticks)"
              class="w-7 h-7 rounded border-2 text-xs transition-colors"
              :class="getTickState(sec.page, i - 1) ? 'bg-accent border-accent text-on-accent' : 'bg-bg border-border'"
            >
              {{ getTickState(sec.page, i - 1) ? '✓' : '' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
