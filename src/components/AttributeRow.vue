<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '../stores/character'
import { computed } from 'vue'

const props = defineProps<{
  attr: 'charm' | 'grace' | 'ingenuity' | 'strength'
}>()

const { t } = useI18n()
const store = useCharacterStore()

const base = computed({
  get: () => store[props.attr],
  set: (v: number) => { store[props.attr] = v },
})
const mod = computed(() => store.modifiers[props.attr])
const eff = computed(() => store.effective[props.attr])
const label = computed(() => t(`attributes.${props.attr}`))
</script>

<template>
  <div class="flex items-center gap-2 py-1">
    <span class="w-24 font-heading text-accent text-sm uppercase tracking-wide">{{ label }}</span>
    <button @click="base > -2 && base--" class="w-8 h-8 rounded bg-surface-alt text-text active:bg-border">-</button>
    <span class="w-8 text-center font-mono text-lg">{{ base }}</span>
    <button @click="base < 5 && base++" class="w-8 h-8 rounded bg-surface-alt text-text active:bg-border">+</button>
    <span v-if="mod > 0" class="text-accent text-sm">+{{ mod }}</span>
    <span class="ml-auto font-mono text-lg" :class="eff < 0 ? 'text-danger' : 'text-text'">= {{ eff }}</span>
  </div>
</template>
