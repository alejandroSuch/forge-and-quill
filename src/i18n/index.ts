import { createI18n } from 'vue-i18n'
import en from './en.json'
import es from './es.json'

const STORAGE_KEY = 'fq-lang'

function detectLanguage(): 'en' | 'es' {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'es') return stored
  const nav = navigator.language.split('-')[0]
  return nav === 'es' ? 'es' : 'en'
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLanguage(),
  fallbackLocale: 'en',
  messages: { en, es },
})

export function setLanguage(lang: 'en' | 'es') {
  i18n.global.locale.value = lang
  localStorage.setItem(STORAGE_KEY, lang)
  document.documentElement.lang = lang
}
