<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '../stores/character'

defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useCharacterStore()
const newNote = ref('')

function add() {
  const text = newNote.value.trim()
  if (!text) return
  store.notes.push(text)
  newNote.value = ''
}

function remove(i: number) {
  store.notes.splice(i, 1)
}
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div class="bg-surface rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-heading text-accent text-lg">{{ t('notes.title', { count: store.notes.length }) }}</h2>
        <button @click="$emit('close')" class="text-muted text-xl px-2">&times;</button>
      </div>

      <div class="space-y-2 mb-3">
        <div
          v-for="(note, i) in store.notes" :key="i"
          class="bg-surface-alt rounded-lg px-3 py-2 flex justify-between items-start gap-2"
        >
          <p class="text-sm flex-1">{{ note }}</p>
          <button @click="remove(i)" class="text-danger text-sm px-1 shrink-0">✕</button>
        </div>
      </div>

      <div class="flex gap-2">
        <input
          v-model="newNote"
          class="flex-1 bg-surface-alt text-text rounded-lg px-3 py-2 text-sm border border-border focus:border-accent focus:outline-none"
          :placeholder="t('notes.placeholder')"
          @keydown.enter="add"
        />
        <button @click="add" class="bg-accent text-on-accent rounded-lg px-4 py-2 text-sm font-heading">+</button>
      </div>
    </div>
  </div>
</template>
