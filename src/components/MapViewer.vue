<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '../stores/character'
import { books } from '../data/books'

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useCharacterStore()

const mapFiles: Record<number, string> = {
  1: '/images/map-book1.jpg',
  2: '/images/map-book2.jpg',
  3: '/images/map-book3.jpg',
  4: '/images/map-book4.jpg',
  5: '/images/map-book5.jpg',
}

const currentMap = computed(() => mapFiles[store.book] ?? '')
const currentTitle = computed(() => books.find(b => b.number === store.book)?.title ?? '')

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const lastTranslateX = ref(0)
const lastTranslateY = ref(0)

let initialPinchDistance = 0
let initialScale = 1

function onPointerDown(e: PointerEvent) {
  isDragging.value = true
  startX.value = e.clientX
  startY.value = e.clientY
  lastTranslateX.value = translateX.value
  lastTranslateY.value = translateY.value
  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value) return
  translateX.value = lastTranslateX.value + (e.clientX - startX.value)
  translateY.value = lastTranslateY.value + (e.clientY - startY.value)
}

function onPointerUp() {
  isDragging.value = false
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    initialPinchDistance = Math.hypot(dx, dy)
    initialScale = scale.value
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    e.preventDefault()
    const dx = e.touches[0].clientX - e.touches[1].clientX
    const dy = e.touches[0].clientY - e.touches[1].clientY
    const dist = Math.hypot(dx, dy)
    scale.value = Math.max(0.5, Math.min(5, initialScale * (dist / initialPinchDistance)))
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  scale.value = Math.max(0.5, Math.min(5, scale.value * delta))
}

function resetView() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const transform = computed(() => `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`)
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/80 flex flex-col" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div class="flex justify-between items-center p-3 bg-surface/90 backdrop-blur">
      <div>
        <h2 class="font-heading text-accent text-lg">{{ t('map.title') }}</h2>
        <p class="text-muted text-xs">{{ currentTitle }}</p>
      </div>
      <div class="flex gap-2">
        <button @click="resetView" class="bg-surface-alt text-muted rounded px-3 py-1 text-xs">{{ t('map.reset') }}</button>
        <button @click="$emit('close')" class="text-muted text-xl px-2">&times;</button>
      </div>
    </div>

    <div class="flex gap-1 px-3 py-2 bg-surface/70 backdrop-blur">
      <button
        v-for="b in books" :key="b.number"
        @click="store.book = b.number; resetView()"
        class="px-3 py-1 rounded text-xs"
        :class="store.book === b.number ? 'bg-accent text-on-accent' : 'bg-surface-alt text-muted'"
      >
        {{ b.number }}
      </button>
    </div>

    <div
      class="flex-1 overflow-hidden touch-none cursor-grab active:cursor-grabbing"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @wheel.prevent="onWheel"
    >
      <div class="w-full h-full flex items-center justify-center">
        <img
          :src="currentMap"
          :alt="`Map: ${currentTitle}`"
          class="max-w-none select-none"
          :style="{ transform }"
          draggable="false"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
      </div>
    </div>
  </div>
</template>
