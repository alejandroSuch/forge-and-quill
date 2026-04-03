<script setup lang="ts">
import { ref } from 'vue'
import { useCharacterStore } from '../stores/character'

defineEmits<{ close: [] }>()

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
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')">
    <div class="bg-vulcan-800 rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-heading text-gold-400 text-lg">Notas ({{ store.notes.length }})</h2>
        <button @click="$emit('close')" class="text-parchment/50 text-xl px-2">&times;</button>
      </div>

      <div class="space-y-2 mb-3">
        <div
          v-for="(note, i) in store.notes" :key="i"
          class="bg-vulcan-700 rounded-lg px-3 py-2 flex justify-between items-start gap-2"
        >
          <p class="text-sm text-parchment/80 flex-1">{{ note }}</p>
          <button @click="remove(i)" class="text-ember-400 text-sm px-1 shrink-0">✕</button>
        </div>
      </div>

      <div class="flex gap-2">
        <input
          v-model="newNote"
          class="flex-1 bg-vulcan-700 text-parchment rounded-lg px-3 py-2 text-sm border border-vulcan-600 focus:border-gold-500 focus:outline-none"
          placeholder="Nueva nota..."
          @keydown.enter="add"
        />
        <button @click="add" class="bg-gold-500 text-vulcan-900 rounded-lg px-4 py-2 text-sm font-heading">+</button>
      </div>
    </div>
  </div>
</template>
