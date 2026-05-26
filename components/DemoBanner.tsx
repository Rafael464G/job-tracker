"use client"

import Link from 'next/link'
import { useLanguage } from './LanguageProvider'

export default function DemoBanner() {
  const { t } = useLanguage()

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-800/40 dark:bg-indigo-950/20">
      <p className="text-sm text-indigo-800 dark:text-indigo-200">
        {t.demo.banner}{' '}
        <Link href="/signup" className="font-semibold underline underline-offset-2 hover:opacity-80">
          {t.demo.banner_cta}
        </Link>
      </p>
    </div>
  )
}
