<script setup lang="ts">
import { useCharacterStore } from '../stores/character'
import { computed } from 'vue'

const props = defineProps<{
  attr: 'charm' | 'grace' | 'ingenuity' | 'strength'
}>()

const store = useCharacterStore()

const base = computed({
  get: () => store[props.attr],
  set: (v: number) => { store[props.attr] = v },
})
const mod = computed(() => store.modifiers[props.attr])
const eff = computed(() => store.effective[props.attr])
const label = computed(() => props.attr.charAt(0).toUpperCase() + props.attr.slice(1))
</script>

<template>
  <div class="flex items-center gap-2 py-1">
    <span class="w-24 font-heading text-gold-400 text-sm uppercase tracking-wide">{{ label }}</span>
    <button @click="base > -2 && base--" class="w-8 h-8 rounded bg-vulcan-700 text-parchment active:bg-vulcan-600">-</button>
    <span class="w-8 text-center font-mono text-lg">{{ base }}</span>
    <button @click="base < 5 && base++" class="w-8 h-8 rounded bg-vulcan-700 text-parchment active:bg-vulcan-600">+</button>
    <span v-if="mod > 0" class="text-gold-300 text-sm">+{{ mod }}</span>
    <span class="ml-auto font-mono text-lg" :class="eff < 0 ? 'text-ember-400' : 'text-parchment'">= {{ eff }}</span>
  </div>
</template>
