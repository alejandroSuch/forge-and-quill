<script setup lang="ts">
import { useCharacterStore } from './stores/character'
import CharacterSheet from './components/CharacterSheet.vue'

const char = useCharacterStore()
</script>

<template>
  <div class="min-h-dvh">
    <header class="bg-vulcan-800 border-b border-vulcan-700 px-4 py-3 sticky top-0 z-50 flex items-center">
      <h1 class="font-heading text-gold-400 text-lg tracking-wide flex-1 text-center">VulcanVerse</h1>
      <button @click="char.reset()" class="text-ember-400 text-sm absolute right-3 active:text-ember-500">
        Reset
      </button>
    </header>

    <main class="pt-3">
      <CharacterSheet />
    </main>
  </div>
</template>
