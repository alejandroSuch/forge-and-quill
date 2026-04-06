<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCharacterStore } from './stores/character'
import { useTheme } from './composables/useTheme'
import { useToast } from './composables/useToast'
import { setLanguage } from './i18n'
import { exportCharacter, importCharacter } from './services/io'
import CharacterSheet from './components/CharacterSheet.vue'
import CharacterSlots from './components/CharacterSlots.vue'
import AppFooter from './components/AppFooter.vue'
import ToastContainer from './components/ToastContainer.vue'
import UpdatePrompt from './components/UpdatePrompt.vue'

const { t, locale } = useI18n()
const char = useCharacterStore()
const { isDark, toggle: toggleTheme } = useTheme()
const { show: showToast } = useToast()

const showResetConfirm = ref(false)
const showSlots = ref(false)
const fileInput = ref<HTMLInputElement>()

function switchLang() {
  setLanguage(locale.value === 'en' ? 'es' : 'en')
}

async function confirmReset() {
  await char.reset()
  showResetConfirm.value = false
}

function handleExport() {
  exportCharacter(char.toJSON())
  showToast(t('io.export_done'), 'success')
}

async function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (!window.confirm(t('io.import_confirm'))) return
  await importCharacter(file, char)
  showToast(t('io.import_done'), 'success')
  if (fileInput.value) fileInput.value.value = ''
}

async function handleShare() {
  const data = char.toJSON()
  const text = `${data.name || 'Character'}\n` +
    `C:${data.charm} G:${data.grace} I:${data.ingenuity} S:${data.strength}\n` +
    `Glory:${data.glory} Scars:${data.scars} Pyr:${data.money}`

  if (navigator.share) {
    await navigator.share({ title: t('share.title'), text })
  } else {
    await navigator.clipboard.writeText(text)
    showToast(t('share.title'), 'success')
  }
}

async function handleSlotSwitch(_slot: string) {
  showSlots.value = false
  await char.hydrate()
}
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <header class="bg-surface border-b border-border px-3 py-3 sticky top-0 z-50 flex items-center gap-1.5">
      <button @click="toggleTheme" class="text-muted text-base" :aria-label="isDark ? 'Light mode' : 'Dark mode'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
      <button @click="switchLang" class="text-muted text-xs font-medium uppercase">
        {{ locale === 'en' ? 'ES' : 'EN' }}
      </button>

      <h1 class="font-heading text-accent text-lg tracking-wide flex-1 text-center">{{ t('app.title') }}</h1>

      <button @click="showSlots = true" class="text-muted text-xs" :aria-label="t('app.characters')">👤</button>
      <button @click="handleShare" class="text-muted text-xs" :aria-label="t('app.share')">↗</button>
      <button @click="handleExport" class="text-muted text-xs" :aria-label="t('app.export')">↓</button>
      <button @click="fileInput?.click()" class="text-muted text-xs" :aria-label="t('app.import')">↑</button>
      <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleImport" />
      <button @click="showResetConfirm = true" class="text-danger text-sm active:opacity-70">
        {{ t('app.reset') }}
      </button>
    </header>

    <main class="pt-3 flex-1">
      <CharacterSheet />
    </main>

    <AppFooter />
    <ToastContainer />
    <UpdatePrompt />

    <!-- Reset confirmation modal -->
    <Transition name="modal">
      <div v-if="showResetConfirm" class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="showResetConfirm = false">
        <div class="bg-surface rounded-t-2xl w-full max-w-md p-4 text-center space-y-4">
          <h2 class="font-heading text-accent text-lg">{{ t('app.reset_confirm_title') }}</h2>
          <p class="text-muted text-sm">{{ t('app.reset_confirm_msg') }}</p>
          <div class="flex gap-2">
            <button @click="showResetConfirm = false" class="flex-1 bg-surface-alt text-text rounded-lg py-2.5 text-sm border border-border">
              {{ t('app.cancel') }}
            </button>
            <button @click="confirmReset" class="flex-1 bg-danger text-on-accent rounded-lg py-2.5 text-sm font-heading">
              {{ t('app.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Character slots modal -->
    <Transition name="modal">
      <CharacterSlots v-if="showSlots" @close="showSlots = false" @switch="handleSlotSwitch" />
    </Transition>
  </div>
</template>
