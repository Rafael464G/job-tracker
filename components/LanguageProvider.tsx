"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { Locale, translations, T } from '@/lib/i18n'

interface LangCtx {
  locale: Locale
  t: T
  setLocale: (l: Locale) => void
}

const LangContext = createContext<LangCtx>({
  locale: 'en',
  t: translations.en,
  setLocale: () => {},
})

export function useLanguage() {
  return useContext(LangContext)
}

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved === 'en' || saved === 'es') return saved
    const lang = navigator.language || ''
    return lang.toLowerCase().startsWith('en') ? 'en' : 'es'
  } catch {
    return 'en'
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    setLocaleState(detectLocale())
  }, [])

  function setLocale(l: Locale) {
    setLocaleState(l)
    try { localStorage.setItem('locale', l) } catch {}
  }

  return (
    <LangContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </LangContext.Provider>
  )
}
