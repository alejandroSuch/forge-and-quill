import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { i18n } from './i18n'
import { useCharacterStore } from './stores/character'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(i18n)

// Hydrate from IndexedDB before mounting
const character = useCharacterStore(pinia)
character.hydrate().finally(() => {
  app.mount('#app')
})
