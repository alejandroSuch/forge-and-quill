<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCharacterStore } from '../stores/character'

defineEmits<{ close: [] }>()

const store = useCharacterStore()

const attrs = ['charm', 'grace', 'ingenuity', 'strength'] as const
const selectedAttr = ref<typeof attrs[number]>('charm')
const target = ref(8)
const die1 = ref(0)
const die2 = ref(0)
const rolled = ref(false)
const blessingUsed = ref(false)

const effectiveScore = computed(() => store.effective[selectedAttr.value])

const total = computed(() => {
  if (!rolled.value) return 0
  return die1.value + die2.value + effectiveScore.value
})

const isDoubleOne = computed(() => die1.value === 1 && die2.value === 1)
const isDoubleSix = computed(() => die1.value === 6 && die2.value === 6)

const result = computed(() => {
  if (!rolled.value) return ''
  if (isDoubleOne.value) return 'FALLO AUTOMATICO'
  if (isDoubleSix.value) return 'EXITO AUTOMATICO'
  return total.value >= target.value ? 'EXITO' : 'FALLO'
})

const isSuccess = computed(() => {
  if (!rolled.value) return false
  if (isDoubleOne.value) return false
  if (isDoubleSix.value) return true
  return total.value >= target.value
})

function roll() {
  die1.value = Math.floor(Math.random() * 6) + 1
  die2.value = Math.floor(Math.random() * 6) + 1
  rolled.value = true
  blessingUsed.value = false
}

function useBlessing() {
  if (store.blessings <= 0 || isSuccess.value || !rolled.value) return
  store.blessings--
  blessingUsed.value = true
  roll()
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')">
    <div class="bg-vulcan-800 rounded-t-2xl w-full max-w-md p-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-heading text-gold-400 text-lg">Dados</h2>
        <button @click="$emit('close')" class="text-parchment/50 text-xl px-2">&times;</button>
      </div>

      <!-- Attribute selector -->
      <div class="flex gap-1 mb-3">
        <button
          v-for="a in attrs" :key="a"
          @click="selectedAttr = a"
          class="flex-1 rounded py-1.5 text-xs font-heading capitalize"
          :class="selectedAttr === a ? 'bg-gold-500 text-vulcan-900' : 'bg-vulcan-700 text-parchment/70'"
        >
          {{ a }}
        </button>
      </div>

      <!-- Target number -->
      <div class="flex items-center justify-center gap-3 mb-4">
        <span class="text-parchment/70 text-sm">Dificultad:</span>
        <button @click="target > 2 && target--" class="w-8 h-8 rounded bg-vulcan-700 active:bg-vulcan-600">-</button>
        <span class="font-mono text-xl text-gold-400 w-8 text-center">{{ target }}</span>
        <button @click="target < 20 && target++" class="w-8 h-8 rounded bg-vulcan-700 active:bg-vulcan-600">+</button>
      </div>

      <!-- Dice display -->
      <div v-if="rolled" class="text-center mb-4">
        <div class="flex items-center justify-center gap-4 mb-2">
          <div class="w-16 h-16 bg-vulcan-700 rounded-xl flex items-center justify-center text-3xl font-mono text-parchment border-2 border-vulcan-600">
            {{ die1 }}
          </div>
          <div class="w-16 h-16 bg-vulcan-700 rounded-xl flex items-center justify-center text-3xl font-mono text-parchment border-2 border-vulcan-600">
            {{ die2 }}
          </div>
        </div>
        <p class="text-parchment/60 text-xs mb-1">
          {{ die1 }}+{{ die2 }} + {{ effectiveScore }} ({{ selectedAttr }}) = {{ die1 + die2 + effectiveScore }}
          vs {{ target }}
        </p>
        <p
          class="text-xl font-heading"
          :class="isSuccess ? 'text-green-400' : 'text-ember-400'"
        >
          {{ result }}
        </p>
        <p v-if="blessingUsed" class="text-gold-300 text-xs mt-1">Bendicion usada para re-tirar</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          @click="roll"
          class="flex-1 bg-gold-500 text-vulcan-900 font-heading rounded-lg py-3 text-sm active:bg-gold-400"
        >
          🎲 Tirar 2d6
        </button>
        <button
          v-if="rolled && !isSuccess && store.blessings > 0"
          @click="useBlessing"
          class="bg-vulcan-700 text-gold-400 font-heading rounded-lg py-3 px-4 text-sm active:bg-vulcan-600 border border-gold-500/30"
        >
          Bendicion ({{ store.blessings }})
        </button>
      </div>
    </div>
  </div>
</template>
