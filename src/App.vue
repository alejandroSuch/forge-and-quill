<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSyncStore } from './stores/sync'
import { useCharacterStore } from './stores/character'
import CharacterSheet from './components/CharacterSheet.vue'
import OnboardingScreen from './components/OnboardingScreen.vue'
import SyncIndicator from './components/SyncIndicator.vue'

const sync = useSyncStore()
const showSettings = ref(false)

function changeSheet() {
  const char = useCharacterStore()
  char.reset()
  sync.clearSheetId()
  localStorage.removeItem('vv-character')
  showSettings.value = false
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const urlId = params.get('id')
  if (urlId && urlId !== sync.sheetId) {
    sync.setSheetId(urlId)
  }

  if (sync.sheetId && sync.sheetId !== '__local__') {
    await sync.initialSync()
    sync.startWatching()
  }
})
</script>

<template>
  <div class="min-h-dvh">
    <template v-if="!sync.sheetId">
      <OnboardingScreen />
    </template>
    <template v-else>
      <header class="bg-vulcan-800 border-b border-vulcan-700 px-4 py-3 sticky top-0 z-50 flex items-center">
        <h1 class="font-heading text-gold-400 text-lg tracking-wide flex-1 text-center">VulcanVerse</h1>
        <button @click="showSettings = !showSettings" class="text-parchment/50 text-lg px-1 absolute right-3">⚙</button>
      </header>

      <!-- Settings dropdown -->
      <div v-if="showSettings" class="bg-vulcan-800 border-b border-vulcan-700 px-4 py-3 text-center">
        <button @click="changeSheet" class="text-ember-400 text-sm active:text-ember-500">
          Cambiar hoja de aventura
        </button>
      </div>

      <main class="pt-3">
        <CharacterSheet />
      </main>
      <SyncIndicator />
    </template>
  </div>
</template>
