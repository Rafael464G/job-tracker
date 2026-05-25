"use client"

import { useLanguage } from './LanguageProvider'

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage()

  return (
    <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden text-xs font-medium">
      <button
        onClick={() => setLocale('en')}
        aria-label="Switch to English"
        className={`px-2.5 py-1.5 transition ${
          locale === 'en'
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
            : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('es')}
        aria-label="Cambiar a español"
        className={`px-2.5 py-1.5 transition ${
          locale === 'es'
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
            : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
        }`}
      >
        ES
      </button>
    </div>
  )
}
