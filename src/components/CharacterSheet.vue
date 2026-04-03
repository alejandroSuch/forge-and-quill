<script setup lang="ts">
import { ref } from 'vue'
import { useCharacterStore } from '../stores/character'
import { books } from '../data/books'
import { gods } from '../data/gods'
import { companions } from '../data/companions'
import AttributeRow from './AttributeRow.vue'
import PossessionsModal from './PossessionsModal.vue'
import CodewordsPanel from './CodewordsPanel.vue'
import TicksPanel from './TicksPanel.vue'
import TitlesModal from './TitlesModal.vue'
import NotesModal from './NotesModal.vue'
import MapViewer from './MapViewer.vue'
import DiceRoller from './DiceRoller.vue'
import { computed } from 'vue'

const store = useCharacterStore()

const currentBook = computed(() => books.find(b => b.number === store.book) ?? books[0])

type Panel = 'possessions' | 'codewords' | 'ticks' | 'titles' | 'notes' | 'map' | 'dice' | null
const activePanel = ref<Panel>(null)

function toggle(panel: Panel) {
  activePanel.value = activePanel.value === panel ? null : panel
}
</script>

<template>
  <div class="max-w-md mx-auto px-3 pb-20">
    <!-- Book selector -->
    <div class="bg-vulcan-800 rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
      <label class="text-gold-400 text-sm font-heading">Libro</label>
      <select v-model.number="store.book" class="flex-1 bg-vulcan-700 text-parchment rounded px-2 py-1 text-sm">
        <option v-for="b in books" :key="b.number" :value="b.number">{{ b.number }}. {{ b.title }}</option>
      </select>
    </div>

    <!-- Identity -->
    <div class="bg-vulcan-800 rounded-lg px-3 py-3 mb-3 space-y-2">
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="text-gold-400 text-xs font-heading block mb-1">Nombre</label>
          <input v-model="store.name" class="w-full bg-vulcan-700 text-parchment rounded px-2 py-1.5 text-sm" placeholder="Tu personaje" />
        </div>
        <div class="w-28">
          <label class="text-gold-400 text-xs font-heading block mb-1">Seccion</label>
          <input v-model.number="store.location" type="number" min="0" :max="currentBook.pages" class="w-full bg-vulcan-700 text-parchment rounded px-2 py-1.5 text-sm" />
        </div>
      </div>
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="text-gold-400 text-xs font-heading block mb-1">Dios</label>
          <select v-model="store.god" class="w-full bg-vulcan-700 text-parchment rounded px-2 py-1.5 text-sm">
            <option value="">---</option>
            <option v-for="g in gods" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="text-gold-400 text-xs font-heading block mb-1">Compañero</label>
          <select v-model="store.companion" class="w-full bg-vulcan-700 text-parchment rounded px-2 py-1.5 text-sm">
            <option value="">---</option>
            <option v-for="c in companions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Attributes -->
    <div class="bg-vulcan-800 rounded-lg px-3 py-2 mb-3">
      <AttributeRow attr="charm" />
      <AttributeRow attr="grace" />
      <AttributeRow attr="ingenuity" />
      <AttributeRow attr="strength" />
    </div>

    <!-- Stats -->
    <div class="bg-vulcan-800 rounded-lg px-3 py-3 mb-3 space-y-3">
      <!-- Blessings -->
      <div class="flex items-center gap-3">
        <span class="text-gold-400 text-sm font-heading w-24">Bendiciones</span>
        <div class="flex gap-1">
          <button
            v-for="i in 3" :key="i"
            @click="store.blessings = store.blessings === i ? i - 1 : i"
            class="w-8 h-8 rounded-full border-2 transition-colors"
            :class="i <= store.blessings ? 'bg-gold-500 border-gold-400' : 'bg-vulcan-700 border-vulcan-600'"
          />
        </div>
      </div>

      <!-- Wounded -->
      <div class="flex items-center gap-3">
        <span class="text-gold-400 text-sm font-heading w-24">Herido</span>
        <button
          @click="store.wounded = !store.wounded"
          class="w-8 h-8 rounded border-2 transition-colors flex items-center justify-center text-lg"
          :class="store.wounded ? 'bg-ember-500 border-ember-400 text-white' : 'bg-vulcan-700 border-vulcan-600'"
        >
          {{ store.wounded ? '✕' : '' }}
        </button>
        <span v-if="store.wounded" class="text-ember-400 text-sm">-1 a todas las tiradas</span>
      </div>

      <!-- Numeric stats -->
      <div class="grid grid-cols-3 gap-2">
        <div v-for="stat in [
          { key: 'glory', label: 'Gloria' },
          { key: 'scars', label: 'Cicatrices' },
          { key: 'money', label: 'Pyr' },
        ]" :key="stat.key" class="text-center">
          <label class="text-gold-400 text-xs font-heading block mb-1">{{ stat.label }}</label>
          <div class="flex items-center justify-center gap-1">
            <button @click="(store as any)[stat.key] > 0 && (store as any)[stat.key]--" class="w-7 h-7 rounded bg-vulcan-700 active:bg-vulcan-600 text-sm">-</button>
            <input v-model.number="(store as any)[stat.key]" type="number" min="0" class="w-14 bg-vulcan-700 text-parchment text-center rounded py-1 text-sm" />
            <button @click="(store as any)[stat.key]++" class="w-7 h-7 rounded bg-vulcan-700 active:bg-vulcan-600 text-sm">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="grid grid-cols-3 gap-2 mb-3">
      <button @click="toggle('possessions')" class="bg-vulcan-800 rounded-lg py-3 text-sm text-gold-400 font-heading active:bg-vulcan-700">
        Objetos <span class="text-parchment/60">{{ store.possessions.length }}/20</span>
      </button>
      <button @click="toggle('codewords')" class="bg-vulcan-800 rounded-lg py-3 text-sm text-gold-400 font-heading active:bg-vulcan-700">
        Codigos
      </button>
      <button @click="toggle('ticks')" class="bg-vulcan-800 rounded-lg py-3 text-sm text-gold-400 font-heading active:bg-vulcan-700">
        Ticks
      </button>
      <button @click="toggle('titles')" class="bg-vulcan-800 rounded-lg py-3 text-sm text-gold-400 font-heading active:bg-vulcan-700">
        Titulos <span class="text-parchment/60">{{ store.titles.length }}</span>
      </button>
      <button @click="toggle('notes')" class="bg-vulcan-800 rounded-lg py-3 text-sm text-gold-400 font-heading active:bg-vulcan-700">
        Notas <span class="text-parchment/60">{{ store.notes.length }}</span>
      </button>
      <button @click="toggle('map')" class="bg-vulcan-800 rounded-lg py-3 text-sm text-gold-400 font-heading active:bg-vulcan-700">
        Mapa
      </button>
      <button @click="toggle('dice')" class="col-span-3 bg-vulcan-800 rounded-lg py-3 text-sm text-gold-400 font-heading active:bg-vulcan-700">
        🎲 Dados
      </button>
    </div>
  </div>

  <!-- Panels -->
  <PossessionsModal v-if="activePanel === 'possessions'" @close="activePanel = null" />
  <CodewordsPanel v-if="activePanel === 'codewords'" @close="activePanel = null" />
  <TicksPanel v-if="activePanel === 'ticks'" @close="activePanel = null" />
  <TitlesModal v-if="activePanel === 'titles'" @close="activePanel = null" />
  <NotesModal v-if="activePanel === 'notes'" @close="activePanel = null" />
  <MapViewer v-if="activePanel === 'map'" @close="activePanel = null" />
  <DiceRoller v-if="activePanel === 'dice'" @close="activePanel = null" />
</template>
