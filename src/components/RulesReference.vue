<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineEmits<{ close: [] }>()

const { t } = useI18n()
</script>

<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-end justify-center" @click.self="$emit('close')" role="dialog" aria-modal="true">
    <div class="bg-surface rounded-t-2xl w-full max-w-md max-h-[85dvh] overflow-y-auto p-4">
      <div class="flex justify-between items-center mb-3">
        <h2 class="font-heading text-accent text-lg">{{ t('rules.title') }}</h2>
        <button @click="$emit('close')" class="text-muted text-xl px-2">&times;</button>
      </div>

      <div class="space-y-4 text-sm">
        <section>
          <h3 class="font-heading text-accent text-sm mb-1">{{ t('rules.skill_check') }}</h3>
          <p class="text-muted">{{ t('rules.skill_check_desc') }}</p>
        </section>

        <section>
          <h3 class="font-heading text-accent text-sm mb-1">{{ t('rules.combat') }}</h3>
          <p class="text-muted">{{ t('rules.combat_desc') }}</p>
        </section>

        <section>
          <h3 class="font-heading text-accent text-sm mb-1">{{ t('rules.blessings') }}</h3>
          <p class="text-muted">{{ t('rules.blessings_desc') }}</p>
        </section>

        <section>
          <h3 class="font-heading text-accent text-sm mb-1">{{ t('rules.wounds') }}</h3>
          <p class="text-muted">{{ t('rules.wounds_desc') }}</p>
        </section>

        <section>
          <h3 class="font-heading text-accent text-sm mb-1">{{ t('rules.doubles') }}</h3>
          <p class="text-muted">{{ t('rules.doubles_desc') }}</p>
        </section>
      </div>
    </div>
  </div>
</template>
