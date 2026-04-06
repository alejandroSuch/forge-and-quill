<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const show = ref(false)
let registration: ServiceWorkerRegistration | undefined

onMounted(async () => {
  if (!('serviceWorker' in navigator)) return
  registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return

  // Check if a waiting SW is already there
  if (registration.waiting) {
    show.value = true
    return
  }

  registration.addEventListener('updatefound', () => {
    const newSW = registration!.installing
    if (!newSW) return
    newSW.addEventListener('statechange', () => {
      if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
        show.value = true
      }
    })
  })
})

function update() {
  if (registration?.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
  window.location.reload()
}
</script>

<template>
  <Transition name="toast">
    <div
      v-if="show"
      class="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-surface border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 text-sm"
    >
      <span class="text-text">{{ t('update.available') }}</span>
      <button @click="update" class="bg-accent text-on-accent rounded px-3 py-1 text-xs font-heading">
        {{ t('update.reload') }}
      </button>
    </div>
  </Transition>
</template>
