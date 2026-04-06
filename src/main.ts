import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { i18n } from './i18n'
import { useCharacterStore } from './stores/character'
import { migrateV1 } from './services/storage'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(i18n)

// Migrate v1 data if present, then hydrate
const character = useCharacterStore(pinia)
migrateV1()
  .catch(() => {}) // v1 store may not exist
  .then(() => character.hydrate())
  .catch(e => console.error('Hydration failed:', e))
  .finally(() => {
    app.mount('#app')
  })
