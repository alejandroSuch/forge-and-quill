<script setup lang="ts">
import { useSyncStore } from '../stores/sync'

const sync = useSyncStore()

const colors: Record<string, string> = {
  synced: 'bg-green-500',
  pending: 'bg-yellow-500 animate-pulse',
  syncing: 'bg-yellow-500 animate-spin',
  offline: 'bg-gray-500',
  error: 'bg-red-500',
}

const labels: Record<string, string> = {
  synced: 'Sincronizado',
  pending: 'Pendiente...',
  syncing: 'Sincronizando...',
  offline: 'Local',
  error: 'Error de sync',
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-vulcan-800/90 rounded-full px-3 py-1.5 text-xs backdrop-blur">
    <div class="w-2.5 h-2.5 rounded-full" :class="colors[sync.status]" />
    <span class="text-parchment/70">{{ labels[sync.status] }}</span>
  </div>
</template>
