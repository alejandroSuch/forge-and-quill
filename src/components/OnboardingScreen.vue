<script setup lang="ts">
import { ref } from 'vue'
import { useSyncStore } from '../stores/sync'

const sync = useSyncStore()
const input = ref('')
const loading = ref(false)
const error = ref('')

async function connect() {
  if (!input.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    sync.setSheetId(input.value)
    await sync.initialSync()
    sync.startWatching()
  } catch (e) {
    error.value = 'No se pudo conectar. Verifica el ID y que la hoja sea publica.'
    sync.clearSheetId()
  } finally {
    loading.value = false
  }
}

function skipOnboarding() {
  sync.setSheetId('__local__')
}
</script>

<template>
  <div class="min-h-dvh flex flex-col items-center justify-center px-6">
    <h1 class="font-heading text-gold-400 text-3xl mb-2">VulcanVerse</h1>
    <p class="text-parchment/70 text-sm mb-8 text-center">Companion App</p>

    <div class="w-full max-w-sm space-y-4">
      <label class="text-gold-400 text-sm font-heading block">Introduce tu codigo de aventura</label>
      <p class="text-parchment/50 text-xs">Pega el ID de tu Google Sheet o la URL completa</p>
      <input
        v-model="input"
        class="w-full bg-vulcan-700 text-parchment rounded-lg px-4 py-3 text-sm border border-vulcan-600 focus:border-gold-500 focus:outline-none"
        placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
        @keydown.enter="connect"
      />
      <p v-if="error" class="text-ember-400 text-xs">{{ error }}</p>
      <button
        @click="connect"
        :disabled="loading || !input.trim()"
        class="w-full bg-gold-500 text-vulcan-900 font-heading rounded-lg py-3 text-sm disabled:opacity-50 active:bg-gold-400"
      >
        {{ loading ? 'Conectando...' : 'Conectar' }}
      </button>
      <button
        @click="skipOnboarding"
        class="w-full text-parchment/50 text-xs py-2 active:text-parchment/80"
      >
        Jugar sin sincronizar (solo local)
      </button>
    </div>
  </div>
</template>
