<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '../stores/character'
import { haptic } from '../composables/useHaptic'
import { useSwipeDown } from '../composables/useSwipeDown'

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useCharacterStore()
const panelRef = ref<HTMLElement | null>(null)
const { translateY, dragging } = useSwipeDown(panelRef, () => emit('close'))

const attrs = ['charm', 'grace', 'ingenuity', 'strength'] as const
const selectedAttr = ref<typeof attrs[number]>('charm')
const target = ref(8)
const die1 = ref(0)
const die2 = ref(0)
const rolled = ref(false)
const blessingUsed = ref(false)
const rolling = ref(false)

interface RollRecord {
  die1: number
  die2: number
  attr: string
  effective: number
  target: number
  success: boolean
}
const history = ref<RollRecord[]>([])

const effectiveScore = computed(() => store.effective[selectedAttr.value])

const total = computed(() => {
  if (!rolled.value) return 0
  return die1.value + die2.value + effectiveScore.value
})

const isDoubleOne = computed(() => die1.value === 1 && die2.value === 1)
const isDoubleSix = computed(() => die1.value === 6 && die2.value === 6)

const result = computed(() => {
  if (!rolled.value) return ''
  if (isDoubleOne.value) return t('dice.auto_fail')
  if (isDoubleSix.value) return t('dice.auto_success')
  return total.value >= target.value ? t('dice.success') : t('dice.fail')
})

const isSuccess = computed(() => {
  if (!rolled.value) return false
  if (isDoubleOne.value) return false
  if (isDoubleSix.value) return true
  return total.value >= target.value
})

function roll() {
  haptic(15)
  rolling.value = true
  setTimeout(() => {
    die1.value = Math.floor(Math.random() * 6) + 1
    die2.value = Math.floor(Math.random() * 6) + 1
    rolled.value = true
    blessingUsed.value = false
    rolling.value = false

    const success = isDoubleSix.value || (!isDoubleOne.value && die1.value + die2.value + effectiveScore.value >= target.value)
    history.value.unshift({
      die1: die1.value, die2: die2.value,
      attr: selectedAttr.value, effective: effectiveScore.value,
      target: target.value, success,
    })
    if (history.value.length > 10) history.value.pop()

    haptic(success ? 5 : 30)
  }, 300)
}

function useBlessing() {
  if (store.blessings <= 0 || isSuccess.value || !rolled.value) return
  store.blessings--
  blessingUsed.value = true
  haptic(10)
  roll()
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div
      ref="panelRef"
      class="bg-surface rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4"
      :style="{ transform: translateY > 0 ? `translateY(${translateY}px)` : '', transition: dragging ? 'none' : '' }"
    >
      <!-- Swipe handle -->
      <div class="flex justify-center mb-2"><div class="w-10 h-1 rounded-full bg-border"></div></div>

      <div class="flex justify-between items-center mb-4">
        <h2 class="font-heading text-accent text-lg">{{ t('dice.title') }}</h2>
        <button @click="$emit('close')" class="text-muted text-xl px-2">&times;</button>
      </div>

      <div class="flex gap-1 mb-3">
        <button
          v-for="a in attrs" :key="a"
          @click="selectedAttr = a"
          class="flex-1 rounded py-1.5 text-xs font-heading"
          :class="selectedAttr === a ? 'bg-accent text-on-accent' : 'bg-surface-alt text-muted'"
        >
          {{ t(`attributes.${a}`) }}
        </button>
      </div>

      <div class="flex items-center justify-center gap-3 mb-4">
        <span class="text-muted text-sm">{{ t('dice.difficulty') }}</span>
        <button @click="target > 2 && target--" class="w-8 h-8 rounded bg-surface-alt active:bg-border">-</button>
        <span class="font-mono text-xl text-accent w-8 text-center">{{ target }}</span>
        <button @click="target < 20 && target++" class="w-8 h-8 rounded bg-surface-alt active:bg-border">+</button>
      </div>

      <div v-if="rolled" class="text-center mb-4">
        <div class="flex items-center justify-center gap-4 mb-2">
          <div
            class="w-16 h-16 bg-surface-alt rounded-xl flex items-center justify-center text-3xl font-mono border-2 border-border"
            :class="{ 'animate-dice-spin': rolling }"
          >
            {{ rolling ? '?' : die1 }}
          </div>
          <div
            class="w-16 h-16 bg-surface-alt rounded-xl flex items-center justify-center text-3xl font-mono border-2 border-border"
            :class="{ 'animate-dice-spin': rolling }"
          >
            {{ rolling ? '?' : die2 }}
          </div>
        </div>
        <p class="text-muted text-xs mb-1">
          {{ die1 }}+{{ die2 }} + {{ effectiveScore }} ({{ t(`attributes.${selectedAttr}`) }}) = {{ die1 + die2 + effectiveScore }}
          vs {{ target }}
        </p>
        <p class="text-xl font-heading" :class="isSuccess ? 'text-success' : 'text-danger'">
          {{ result }}
        </p>
        <p v-if="blessingUsed" class="text-accent text-xs mt-1">{{ t('dice.blessing_used') }}</p>
      </div>

      <div class="flex gap-2 mb-4">
        <button
          @click="roll"
          :disabled="rolling"
          class="flex-1 bg-accent text-on-accent font-heading rounded-lg py-3 text-sm active:opacity-80 disabled:opacity-50"
        >
          🎲 {{ t('dice.roll') }}
        </button>
        <button
          v-if="rolled && !isSuccess && store.blessings > 0"
          @click="useBlessing"
          :disabled="rolling"
          class="bg-surface-alt text-accent font-heading rounded-lg py-3 px-4 text-sm active:bg-border border border-accent/30 disabled:opacity-50"
        >
          {{ t('dice.blessing', { n: store.blessings }) }}
        </button>
      </div>

      <!-- Roll history -->
      <div v-if="history.length > 0">
        <h3 class="text-muted text-xs font-heading mb-2">{{ t('dice.history') }}</h3>
        <div class="space-y-1">
          <div
            v-for="(h, i) in history" :key="i"
            class="flex items-center gap-2 text-xs text-muted"
          >
            <span class="font-mono">{{ h.die1 }}+{{ h.die2 }}</span>
            <span>+{{ h.effective }}</span>
            <span class="capitalize">{{ h.attr.charAt(0) }}</span>
            <span>vs {{ h.target }}</span>
            <span class="ml-auto font-heading" :class="h.success ? 'text-success' : 'text-danger'">
              {{ h.success ? '✓' : '✕' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
