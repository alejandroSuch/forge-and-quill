import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { useCharacterStore } from './stores/character'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

// Hydrate list data from IndexedDB before mounting
const character = useCharacterStore(pinia)
character.hydrateFromIDB().finally(() => {
  app.mount('#app')
})
