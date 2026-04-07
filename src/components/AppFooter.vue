<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<template>
  <footer class="text-center py-6 px-4 text-muted text-xs space-y-1">
    <a href="https://github.com/alejandrosuch/forge-and-quill" target="_blank" rel="noopener" class="hover:text-accent transition-colors">
      {{ t('footer.source') }}
    </a>
  </footer>
</template>
