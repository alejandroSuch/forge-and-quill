<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { idbListSlots, idbDeleteSlot, getActiveSlot, setActiveSlot, idbLoadSlot } from '../services/storage'

const emit = defineEmits<{ close: [], switch: [slot: string] }>()

const { t } = useI18n()
const slots = ref<{ id: string; name: string }[]>([])
const activeSlot = ref('')
const newName = ref('')

onMounted(async () => {
  await refresh()
})

async function refresh() {
  const ids = await idbListSlots()
  activeSlot.value = await getActiveSlot()
  const entries = await Promise.all(
    ids.map(async id => {
      const data = await idbLoadSlot(id)
      return { id, name: (data.name as string) || id }
    })
  )
  slots.value = entries
}

async function switchTo(id: string) {
  await setActiveSlot(id)
  emit('switch', id)
}

async function createNew() {
  const name = newName.value.trim() || t('slots.new_default_name')
  await setActiveSlot(name)
  newName.value = ''
  emit('switch', name)
}

async function deleteSlot(id: string) {
  if (slots.value.length <= 1) return
  await idbDeleteSlot(id)
  if (activeSlot.value === id) {
    const remaining = slots.value.filter(s => s.id !== id)
    if (remaining.length > 0) {
      await setActiveSlot(remaining[0].id)
      emit('switch', remaining[0].id)
      return
    }
  }
  await refresh()
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div class="bg-surface rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-heading text-accent text-lg">{{ t('slots.title') }}</h2>
        <button @click="$emit('close')" class="text-muted text-xl px-2">&times;</button>
      </div>

      <div class="space-y-2 mb-4">
        <div
          v-for="s in slots" :key="s.id"
          class="bg-surface-alt rounded-lg px-3 py-2.5 flex items-center gap-2"
          :class="s.id === activeSlot ? 'border border-accent/40' : ''"
        >
          <button @click="switchTo(s.id)" class="flex-1 text-left text-sm" :class="s.id === activeSlot ? 'text-accent font-medium' : 'text-text'">
            {{ s.name }}
            <span v-if="s.id === activeSlot" class="text-accent text-xs ml-1">●</span>
          </button>
          <button
            v-if="slots.length > 1"
            @click.stop="deleteSlot(s.id)"
            class="text-danger text-sm px-2"
          >✕</button>
        </div>
      </div>

      <div class="flex gap-2">
        <input
          v-model="newName"
          class="flex-1 bg-surface-alt text-text rounded-lg px-3 py-2 text-sm border border-border focus:border-accent focus:outline-none"
          :placeholder="t('slots.new_placeholder')"
          @keydown.enter="createNew"
        />
        <button @click="createNew" class="bg-accent text-on-accent rounded-lg px-4 py-2 text-sm font-heading">
          {{ t('slots.create') }}
        </button>
      </div>
    </div>
  </div>
</template>
