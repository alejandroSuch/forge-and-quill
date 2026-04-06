<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from '../stores/character'
import { useSwipeDown } from '../composables/useSwipeDown'

const emit = defineEmits<{ close: [] }>()

const { t } = useI18n()
const store = useCharacterStore()
const panelRef = ref<HTMLElement | null>(null)
const { translateY, dragging } = useSwipeDown(panelRef, () => emit('close'))
const newNote = ref('')
const editing = ref<number | null>(null)
const editText = ref('')
const confirmDelete = ref<number | null>(null)

function add() {
  const text = newNote.value.trim()
  if (!text) return
  store.notes.push(text)
  newNote.value = ''
}

function startEdit(i: number) {
  editing.value = i
  editText.value = store.notes[i]
}

function saveEdit() {
  if (editing.value === null) return
  const text = editText.value.trim()
  if (text) {
    store.notes[editing.value] = text
  }
  editing.value = null
}

function cancelEdit() {
  editing.value = null
}

function askDelete(i: number) {
  confirmDelete.value = i
}

function doDelete() {
  if (confirmDelete.value === null) return
  store.notes.splice(confirmDelete.value, 1)
  if (editing.value === confirmDelete.value) editing.value = null
  confirmDelete.value = null
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
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-heading text-accent text-lg">{{ t('notes.title', { count: store.notes.length }) }}</h2>
        <button @click="$emit('close')" class="text-muted text-xl px-2">&times;</button>
      </div>

      <p v-if="store.notes.length === 0" class="text-muted text-sm text-center py-6">
        {{ t('notes.empty') }}
      </p>

      <div class="space-y-2 mb-3">
        <div
          v-for="(note, i) in store.notes" :key="i"
          class="bg-surface-alt rounded-lg px-3 py-2"
        >
          <!-- Editing -->
          <div v-if="editing === i" class="space-y-2">
            <textarea
              v-model="editText"
              rows="3"
              class="w-full bg-bg text-text rounded px-2 py-1.5 text-sm border border-border focus:border-accent focus:outline-none resize-none"
            />
            <div class="flex gap-2">
              <button @click="saveEdit" class="flex-1 bg-accent text-on-accent rounded py-1.5 text-sm font-heading">{{ t('possessions.save') }}</button>
              <button @click="cancelEdit" class="flex-1 bg-surface-alt text-text rounded py-1.5 text-sm border border-border">{{ t('possessions.cancel') }}</button>
            </div>
          </div>
          <!-- Display -->
          <div v-else class="flex justify-between items-start gap-2">
            <p class="text-sm flex-1 cursor-pointer" @click="startEdit(i)">{{ note }}</p>
            <button @click="askDelete(i)" class="text-danger text-sm px-1 shrink-0">✕</button>
          </div>
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

      <!-- Delete confirmation -->
      <Transition name="modal">
        <div v-if="confirmDelete !== null" class="fixed inset-0 z-[60] bg-black/40 flex items-end justify-center" @click.self="confirmDelete = null">
          <div class="bg-surface rounded-t-2xl w-full max-w-md p-4 text-center space-y-4">
            <p class="text-text text-sm">{{ t('notes.delete_confirm') }}</p>
            <div class="flex gap-2">
              <button @click="confirmDelete = null" class="flex-1 bg-surface-alt text-text rounded-lg py-2.5 text-sm border border-border">
                {{ t('app.cancel') }}
              </button>
              <button @click="doDelete" class="flex-1 bg-danger text-on-accent rounded-lg py-2.5 text-sm font-heading">
                {{ t('app.confirm') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
