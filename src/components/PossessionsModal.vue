<script setup lang="ts">
import { ref } from 'vue'
import { useCharacterStore, type Possession } from '../stores/character'

defineEmits<{ close: [] }>()

const store = useCharacterStore()

const editing = ref<number | null>(null)
const form = ref<Possession>({ name: '', charm: 0, grace: 0, ingenuity: 0, strength: 0 })

function startAdd() {
  form.value = { name: '', charm: 0, grace: 0, ingenuity: 0, strength: 0 }
  editing.value = -1
}

function startEdit(i: number) {
  form.value = { ...store.possessions[i] }
  editing.value = i
}

function save() {
  if (!form.value.name.trim()) return
  if (editing.value === -1) {
    if (store.possessions.length >= 20) return
    store.possessions.push({ ...form.value })
  } else if (editing.value !== null) {
    store.possessions[editing.value] = { ...form.value }
  }
  editing.value = null
}

function remove(i: number) {
  store.possessions.splice(i, 1)
  if (editing.value === i) editing.value = null
}

const attrs = ['charm', 'grace', 'ingenuity', 'strength'] as const
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')">
    <div class="bg-vulcan-800 rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-heading text-gold-400 text-lg">Objetos ({{ store.possessions.length }}/20)</h2>
        <button @click="$emit('close')" class="text-parchment/50 text-xl px-2">&times;</button>
      </div>

      <!-- List -->
      <div class="space-y-2 mb-3">
        <div
          v-for="(p, i) in store.possessions" :key="i"
          @click="startEdit(i)"
          class="bg-vulcan-700 rounded-lg px-3 py-2 flex justify-between items-center active:bg-vulcan-600 cursor-pointer"
        >
          <div>
            <div class="text-sm">{{ p.name }}</div>
            <div class="text-xs text-parchment/50 flex gap-2">
              <span v-if="p.charm">C:{{ p.charm > 0 ? '+' : '' }}{{ p.charm }}</span>
              <span v-if="p.grace">G:{{ p.grace > 0 ? '+' : '' }}{{ p.grace }}</span>
              <span v-if="p.ingenuity">I:{{ p.ingenuity > 0 ? '+' : '' }}{{ p.ingenuity }}</span>
              <span v-if="p.strength">S:{{ p.strength > 0 ? '+' : '' }}{{ p.strength }}</span>
            </div>
          </div>
          <button @click.stop="remove(i)" class="text-ember-400 text-sm px-2">✕</button>
        </div>
      </div>

      <!-- Add/Edit form -->
      <div v-if="editing !== null" class="bg-vulcan-700 rounded-lg p-3 space-y-2 mb-3">
        <input v-model="form.name" class="w-full bg-vulcan-900 text-parchment rounded px-2 py-1.5 text-sm" placeholder="Nombre del objeto" />
        <div class="grid grid-cols-4 gap-2">
          <div v-for="a in attrs" :key="a" class="text-center">
            <label class="text-gold-400 text-xs block">{{ a.charAt(0).toUpperCase() }}</label>
            <input v-model.number="(form as any)[a]" type="number" min="-5" max="5" class="w-full bg-vulcan-900 text-parchment text-center rounded py-1 text-sm" />
          </div>
        </div>
        <div class="flex gap-2">
          <button @click="save" class="flex-1 bg-gold-500 text-vulcan-900 rounded py-1.5 text-sm font-heading">Guardar</button>
          <button @click="editing = null" class="flex-1 bg-vulcan-600 text-parchment rounded py-1.5 text-sm">Cancelar</button>
        </div>
      </div>

      <button
        v-if="editing === null && store.possessions.length < 20"
        @click="startAdd"
        class="w-full bg-vulcan-700 text-gold-400 rounded-lg py-2.5 text-sm font-heading active:bg-vulcan-600"
      >
        + Añadir objeto
      </button>
    </div>
  </div>
</template>
