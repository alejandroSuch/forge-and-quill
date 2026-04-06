<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
import RulesReference from './RulesReference.vue'

const { t } = useI18n()
const store = useCharacterStore()

const currentBook = computed(() => books.find(b => b.number === store.book) ?? books[0])

type Panel = 'possessions' | 'codewords' | 'ticks' | 'titles' | 'notes' | 'map' | 'dice' | 'rules' | null
const activePanel = ref<Panel>(null)

function toggle(panel: Panel) {
  activePanel.value = activePanel.value === panel ? null : panel
}
</script>

<template>
  <div class="max-w-md mx-auto px-3 pb-20">
    <!-- Book selector -->
    <div class="bg-surface rounded-lg px-3 py-2 mb-3 flex items-center gap-2">
      <label class="text-accent text-sm font-heading">{{ t('character.book') }}</label>
      <select v-model.number="store.book" class="flex-1 bg-surface-alt text-text rounded px-2 py-1 text-sm border border-border">
        <option v-for="b in books" :key="b.number" :value="b.number">{{ b.number }}. {{ b.title }}</option>
      </select>
    </div>

    <!-- Identity -->
    <div class="bg-surface rounded-lg px-3 py-3 mb-3 space-y-2">
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="text-accent text-xs font-heading block mb-1">{{ t('character.name') }}</label>
          <input v-model="store.name" class="w-full bg-surface-alt text-text rounded px-2 py-1.5 text-sm border border-border focus:border-accent focus:outline-none" :placeholder="t('character.placeholder_name')" />
        </div>
        <div class="w-28">
          <label class="text-accent text-xs font-heading block mb-1">{{ t('character.section') }}</label>
          <input v-model.number="store.location" type="number" min="0" :max="currentBook.pages" class="w-full bg-surface-alt text-text rounded px-2 py-1.5 text-sm border border-border" />
        </div>
      </div>
      <div class="flex gap-2">
        <div class="flex-1">
          <label class="text-accent text-xs font-heading block mb-1">{{ t('character.god') }}</label>
          <select v-model="store.god" class="w-full bg-surface-alt text-text rounded px-2 py-1.5 text-sm border border-border">
            <option value="">---</option>
            <option v-for="g in gods" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="text-accent text-xs font-heading block mb-1">{{ t('character.companion') }}</label>
          <select v-model="store.companion" class="w-full bg-surface-alt text-text rounded px-2 py-1.5 text-sm border border-border">
            <option value="">---</option>
            <option v-for="c in companions" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Attributes -->
    <div class="bg-surface rounded-lg px-3 py-2 mb-3">
      <AttributeRow attr="charm" />
      <AttributeRow attr="grace" />
      <AttributeRow attr="ingenuity" />
      <AttributeRow attr="strength" />
    </div>

    <!-- Stats -->
    <div class="bg-surface rounded-lg px-3 py-3 mb-3 space-y-3">
      <!-- Blessings -->
      <div class="flex items-center gap-3">
        <span class="text-accent text-sm font-heading w-24">{{ t('stats.blessings') }}</span>
        <div class="flex gap-1">
          <button
            v-for="i in 3" :key="i"
            @click="store.blessings = store.blessings === i ? i - 1 : i"
            class="w-8 h-8 rounded-full border-2 transition-colors"
            :class="i <= store.blessings ? 'bg-accent-strong border-accent' : 'bg-surface-alt border-border'"
          />
        </div>
      </div>

      <!-- Wounded -->
      <div class="flex items-center gap-3">
        <span class="text-accent text-sm font-heading w-24">{{ t('stats.wounded') }}</span>
        <button
          @click="store.wounded = !store.wounded"
          class="w-8 h-8 rounded border-2 transition-colors flex items-center justify-center text-lg"
          :class="store.wounded ? 'bg-danger border-danger text-on-accent' : 'bg-surface-alt border-border'"
        >
          {{ store.wounded ? '✕' : '' }}
        </button>
        <span v-if="store.wounded" class="text-danger text-sm">{{ t('stats.wound_penalty') }}</span>
      </div>

      <!-- Numeric stats -->
      <div class="grid grid-cols-3 gap-2">
        <div v-for="stat in [
          { key: 'glory', label: t('stats.glory') },
          { key: 'scars', label: t('stats.scars') },
          { key: 'money', label: t('stats.money') },
        ]" :key="stat.key" class="text-center">
          <label class="text-accent text-xs font-heading block mb-1">{{ stat.label }}</label>
          <div class="flex items-center justify-center gap-1">
            <button @click="(store as any)[stat.key] > 0 && (store as any)[stat.key]--" class="w-7 h-7 rounded bg-surface-alt active:bg-border text-sm">-</button>
            <input v-model.number="(store as any)[stat.key]" type="number" min="0" class="w-14 bg-surface-alt text-text text-center rounded py-1 text-sm border border-border" />
            <button @click="(store as any)[stat.key]++" class="w-7 h-7 rounded bg-surface-alt active:bg-border text-sm">+</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="grid grid-cols-3 gap-2 mb-3">
      <button @click="toggle('possessions')" class="bg-surface rounded-lg py-3 text-sm text-accent font-heading active:bg-surface-alt">
        {{ t('panels.possessions') }} <span class="text-muted">{{ store.possessions.length }}/20</span>
      </button>
      <button @click="toggle('codewords')" class="bg-surface rounded-lg py-3 text-sm text-accent font-heading active:bg-surface-alt">
        {{ t('panels.codewords') }}
      </button>
      <button @click="toggle('ticks')" class="bg-surface rounded-lg py-3 text-sm text-accent font-heading active:bg-surface-alt">
        {{ t('panels.ticks') }}
      </button>
      <button @click="toggle('titles')" class="bg-surface rounded-lg py-3 text-sm text-accent font-heading active:bg-surface-alt">
        {{ t('panels.titles') }} <span class="text-muted">{{ store.titles.length }}</span>
      </button>
      <button @click="toggle('notes')" class="bg-surface rounded-lg py-3 text-sm text-accent font-heading active:bg-surface-alt">
        {{ t('panels.notes') }} <span class="text-muted">{{ store.notes.length }}</span>
      </button>
      <button @click="toggle('map')" class="bg-surface rounded-lg py-3 text-sm text-accent font-heading active:bg-surface-alt">
        {{ t('panels.map') }}
      </button>
      <button @click="toggle('dice')" class="col-span-2 bg-surface rounded-lg py-3 text-sm text-accent font-heading active:bg-surface-alt">
        🎲 {{ t('panels.dice') }}
      </button>
      <button @click="toggle('rules')" class="bg-surface rounded-lg py-3 text-sm text-accent font-heading active:bg-surface-alt">
        {{ t('panels.rules') }}
      </button>
    </div>
  </div>

  <!-- Panels -->
  <Transition name="modal">
    <PossessionsModal v-if="activePanel === 'possessions'" @close="activePanel = null" />
  </Transition>
  <Transition name="modal">
    <CodewordsPanel v-if="activePanel === 'codewords'" @close="activePanel = null" />
  </Transition>
  <Transition name="modal">
    <TicksPanel v-if="activePanel === 'ticks'" @close="activePanel = null" />
  </Transition>
  <Transition name="modal">
    <TitlesModal v-if="activePanel === 'titles'" @close="activePanel = null" />
  </Transition>
  <Transition name="modal">
    <NotesModal v-if="activePanel === 'notes'" @close="activePanel = null" />
  </Transition>
  <Transition name="modal">
    <MapViewer v-if="activePanel === 'map'" @close="activePanel = null" />
  </Transition>
  <Transition name="modal">
    <DiceRoller v-if="activePanel === 'dice'" @close="activePanel = null" />
  </Transition>
  <Transition name="modal">
    <RulesReference v-if="activePanel === 'rules'" @close="activePanel = null" />
  </Transition>
</template>
